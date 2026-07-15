-- =============================================================================
-- Recon metrics schema
-- =============================================================================
-- Paste into the Supabase SQL editor (or run via migration).
--
-- Powers /lock-waza-secret/metrics with accurate data for:
--   • KPI cards / 7·30·90 day series   → metrics_daily
--   • Revenue mix                     → revenue_daily
--   • Latest issue + per-slot rates   → weekly_picks + link_clicks
--   • Trailer → watch funnel          → weekly_picks + link_clicks
--   • Movie leaderboard + 👍👎🔖      → weekly_picks + recommendations + link_clicks
--   • Genre stated vs revealed        → preferences + weekly_picks + link_clicks
--   • Platform pull                   → link_clicks + platform_catalog
--   • Personalization lift            → email_sends.variant (not wired yet)
--
-- SOURCING NOTE: the dashboard views read weekly_picks, because that is the
-- only table /api/admin/send-picks writes. email_issues / issue_picks /
-- email_sends are created here for the per-issue pipeline but nothing
-- populates them yet, so anything keyed to them can only ever be empty.
--
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout, drops
-- views before recreating them, and repairs a database whose issue_picks was
-- dropped with CASCADE (see §1a).
--
-- This file is the single source of truth. METRICS_SCHEMA.md documents it and
-- must not carry a second copy of the SQL — the two drifted once already and
-- that is what left issue_picks half-created.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 0. Core product tables (align with current app; create only if missing)
-- ---------------------------------------------------------------------------

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid(),
  tier text not null default 'free' check (tier in ('free', 'premium')),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table public.subscribers
  add column if not exists tier text not null default 'free',
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists unsubscribe_token uuid default gen_random_uuid();

create table if not exists public.preferences (
  subscriber_id uuid primary key references public.subscribers(id) on delete cascade,
  favorite_genres text[] not null default '{}',
  disliked_genres text[] not null default '{}',
  liked_movies text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- NOTE: existing Recon projects use uuid PKs on weekly_picks.
-- IF NOT EXISTS leaves an existing table alone — only the CREATE shape matters for new DBs.
create table if not exists public.weekly_picks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  genre text,
  imdb_rating numeric,
  poster_url text,
  trailer_url text,
  netflix_url text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 1. Issues (one Friday send) + picks in that issue
-- ---------------------------------------------------------------------------

create table if not exists public.email_issues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                 -- e.g. friday-2026-07-11
  subject text not null default 'Your movie picks for this Friday',
  sent_at timestamptz not null default now(),
  recipients_targeted int not null default 0,
  delivered int not null default 0,
  failed int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists email_issues_sent_at_idx
  on public.email_issues (sent_at desc);

-- weekly_pick_id is uuid because weekly_picks.id is uuid. A bigint here fails
-- with "foreign key constraint cannot be implemented" and takes the whole
-- script down mid-way.
create table if not exists public.issue_picks (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.email_issues(id) on delete cascade,
  weekly_pick_id uuid references public.weekly_picks(id) on delete set null,
  slot int not null check (slot >= 1),
  title text not null,
  genres text[] not null default '{}',
  trailer_url text,
  watch_url text,
  platform text,                             -- Netflix | Prime Video | …
  imdb_rating numeric,
  created_at timestamptz not null default now(),
  unique (issue_id, slot)
);

create index if not exists issue_picks_issue_id_idx
  on public.issue_picks (issue_id);
create index if not exists issue_picks_weekly_pick_idx
  on public.issue_picks (weekly_pick_id);

-- ---------------------------------------------------------------------------
-- 2. Per-subscriber send receipts (delivery + A/B variant)
-- ---------------------------------------------------------------------------

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.email_issues(id) on delete cascade,
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  variant text not null default 'control'
    check (variant in ('control', 'personalized')),
  status text not null default 'sent'
    check (status in ('sent', 'delivered', 'bounced', 'complained', 'failed')),
  opened_at timestamptz,                     -- treat as trend-only (Apple MPP)
  sent_at timestamptz not null default now(),
  unique (issue_id, subscriber_id)
);

create index if not exists email_sends_issue_id_idx
  on public.email_sends (issue_id);
create index if not exists email_sends_subscriber_id_idx
  on public.email_sends (subscriber_id);
create index if not exists email_sends_sent_at_idx
  on public.email_sends (sent_at);

-- ---------------------------------------------------------------------------
-- 3. Per-movie recommendations (feedback 👍 / 👎 / 🔖)
-- ---------------------------------------------------------------------------
-- Each email link uses recommendations.id as opaque `r=` token.

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.email_issues(id) on delete cascade,
  issue_pick_id uuid references public.issue_picks(id) on delete cascade,
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  weekly_pick_id uuid references public.weekly_picks(id) on delete set null,
  reason text,
  sent_at timestamptz not null default now(),
  feedback text check (feedback is null or feedback in ('up', 'down', 'saved')),
  feedback_at timestamptz
);

-- If recommendations already existed from the Phase 1 guide, stretch it.
alter table public.recommendations
  add column if not exists issue_id uuid references public.email_issues(id) on delete cascade,
  add column if not exists issue_pick_id uuid,
  add column if not exists weekly_pick_id uuid references public.weekly_picks(id) on delete set null,
  add column if not exists feedback_at timestamptz;

create index if not exists recommendations_subscriber_sent_idx
  on public.recommendations (subscriber_id, sent_at desc);
create index if not exists recommendations_issue_pick_idx
  on public.recommendations (issue_pick_id);
create index if not exists recommendations_feedback_idx
  on public.recommendations (feedback)
  where feedback is not null;

-- ---------------------------------------------------------------------------
-- 4. Click events (trailer / watch / CTA)
-- ---------------------------------------------------------------------------
-- Insert via /api/track?kind=trailer|watch&pick=<issue_pick_id>&s=<subscriber_id>
-- then redirect to the real destination URL.

create table if not exists public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.email_issues(id) on delete set null,
  issue_pick_id uuid,
  -- The leaderboard ranks weekly_picks (the table send-picks writes), so a
  -- click must be attributable to one directly. issue_pick_id stays for the
  -- per-issue pipeline that nothing populates yet.
  weekly_pick_id uuid references public.weekly_picks(id) on delete set null,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  send_id uuid references public.email_sends(id) on delete set null,
  kind text not null check (kind in ('trailer', 'watch', 'cta', 'other')),
  platform text,                             -- destination platform if known
  destination_url text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.link_clicks
  add column if not exists weekly_pick_id uuid references public.weekly_picks(id) on delete set null;

create index if not exists link_clicks_weekly_pick_kind_idx
  on public.link_clicks (weekly_pick_id, kind);

create index if not exists link_clicks_issue_id_idx
  on public.link_clicks (issue_id, kind);
create index if not exists link_clicks_pick_kind_idx
  on public.link_clicks (issue_pick_id, kind);
create index if not exists link_clicks_created_at_idx
  on public.link_clicks (created_at desc);
create index if not exists link_clicks_subscriber_kind_idx
  on public.link_clicks (subscriber_id, kind);

-- ---------------------------------------------------------------------------
-- 1a. Repair: restore FKs onto issue_picks
-- ---------------------------------------------------------------------------
-- `drop table public.issue_picks cascade` removes these constraints but leaves
-- the columns behind, so a plain re-run would silently skip them (there is no
-- `add constraint if not exists`). This block re-attaches them.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recommendations_issue_pick_id_fkey') then
    alter table public.recommendations
      add constraint recommendations_issue_pick_id_fkey
      foreign key (issue_pick_id) references public.issue_picks(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'link_clicks_issue_pick_id_fkey') then
    alter table public.link_clicks
      add constraint link_clicks_issue_pick_id_fkey
      foreign key (issue_pick_id) references public.issue_picks(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4a. Site feedback (homepage form → "Reader feedback" card)
-- ---------------------------------------------------------------------------
-- Named site_feedback, NOT feedback: `recommendations.feedback` already means
-- the per-movie up/down/saved signal, and conflating the two would wreck the
-- taste graph's meaning.

create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null check (btrim(message) <> '' and length(message) <= 2000),
  rating int check (rating is null or rating between 1 and 5),
  email text,
  subscriber_id uuid references public.subscribers(id) on delete set null,
  source text not null default 'homepage',
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists site_feedback_created_at_idx
  on public.site_feedback (created_at desc);
create index if not exists site_feedback_status_idx
  on public.site_feedback (status) where status = 'new';

-- ---------------------------------------------------------------------------
-- 5. Platform catalogue (affiliate / monetizable flags for Platform pull)
-- ---------------------------------------------------------------------------

create table if not exists public.platform_catalog (
  platform text primary key,
  has_affiliate boolean not null default false,
  is_monetizable boolean not null default false,  -- rent/buy / affiliate-eligible
  sort_order int not null default 100
);

insert into public.platform_catalog (platform, has_affiliate, is_monetizable, sort_order)
values
  ('Netflix',     false, false, 10),
  ('Prime Video', true,  true,  20),
  ('Max',         false, false, 30),
  ('Apple TV+',   false, true,  40),
  ('Showmax',     true,  false, 50),
  ('Disney+',     false, false, 60),
  ('YouTube',     false, true,  70),
  ('Other',       false, false, 999)
on conflict (platform) do update
  set has_affiliate = excluded.has_affiliate,
      is_monetizable = excluded.is_monetizable,
      sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- 6. Daily snapshot tables (KPI cards + revenue mix chart)
-- ---------------------------------------------------------------------------

create table if not exists public.metrics_daily (
  day date primary key,
  engaged_subs int not null default 0,
  total_subs int not null default 0,
  net_growth int not null default 0,
  open_rate numeric not null default 0,          -- 0–1
  click_rate numeric not null default 0,         -- 0–1 unique clickers / delivered
  feedback_ratio numeric not null default 0,     -- 0–1 feedback events / delivered
  inbox_rate numeric not null default 0,         -- 0–1 delivered / targeted
  hard_bounce_rate numeric not null default 0,   -- 0–1
  complaint_rate numeric not null default 0,     -- 0–1
  mrr_ngn numeric not null default 0,
  conv_pct numeric not null default 0,           -- free→paid %, e.g. 1.2 = 1.2%
  rec_lift numeric not null default 0,           -- personalized − control watch rate
  refreshed_at timestamptz not null default now()
);

create table if not exists public.revenue_daily (
  day date primary key,
  adsense numeric not null default 0,
  affiliate numeric not null default 0,
  sponsorship numeric not null default 0,
  premium numeric not null default 0,
  notes text,
  refreshed_at timestamptz not null default now()
);

-- Manual / import helper: leave revenue_daily for ops to fill (AdSense CSV, etc.).
-- metrics_daily is filled by refresh_metrics_daily() below.

-- ---------------------------------------------------------------------------
-- 7. Helper: detect engaged = sent OR clicked OR gave feedback in last 30 days
-- ---------------------------------------------------------------------------

create or replace function public.is_engaged_subscriber(
  p_subscriber_id uuid,
  p_as_of date default current_date
) returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.email_sends es
    where es.subscriber_id = p_subscriber_id
      and es.sent_at >= (p_as_of::timestamptz - interval '30 days')
      and es.status in ('sent', 'delivered')
  )
  or exists (
    select 1
    from public.link_clicks lc
    where lc.subscriber_id = p_subscriber_id
      and lc.created_at >= (p_as_of::timestamptz - interval '30 days')
  )
  or exists (
    select 1
    from public.recommendations r
    where r.subscriber_id = p_subscriber_id
      and r.feedback is not null
      and coalesce(r.feedback_at, r.sent_at) >= (p_as_of::timestamptz - interval '30 days')
  );
$$;

-- ---------------------------------------------------------------------------
-- 8. Refresh one day of metrics_daily from event tables
-- ---------------------------------------------------------------------------

create or replace function public.refresh_metrics_daily(p_day date default current_date)
returns public.metrics_daily
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total int;
  v_engaged int;
  v_prev_total int;
  v_targeted int;
  v_delivered int;
  v_bounced int;
  v_complained int;
  v_opened int;
  v_unique_clickers int;
  v_feedback int;
  v_premium int;
  v_pers_rate numeric;
  v_ctrl_rate numeric;
  v_row public.metrics_daily;
begin
  select count(*) into v_total
  from public.subscribers
  where created_at::date <= p_day
    and (subscribed = true or coalesce(unsubscribed_at::date, 'infinity'::date) > p_day);

  select count(*) into v_engaged
  from public.subscribers s
  where s.subscribed = true
    and public.is_engaged_subscriber(s.id, p_day);

  select count(*) into v_prev_total
  from public.subscribers
  where created_at::date <= (p_day - 1)
    and (subscribed = true or coalesce(unsubscribed_at::date, 'infinity'::date) > (p_day - 1));

  select
    coalesce(sum(recipients_targeted), 0),
    coalesce(sum(delivered), 0)
  into v_targeted, v_delivered
  from public.email_issues
  where sent_at::date = p_day;

  -- Fallback if issue counters not updated yet: count email_sends
  if v_targeted = 0 then
    select count(*), count(*) filter (where status in ('sent', 'delivered'))
    into v_targeted, v_delivered
    from public.email_sends
    where sent_at::date = p_day;
  end if;

  select
    count(*) filter (where status = 'bounced'),
    count(*) filter (where status = 'complained'),
    count(*) filter (where opened_at is not null)
  into v_bounced, v_complained, v_opened
  from public.email_sends
  where sent_at::date = p_day;

  select count(distinct subscriber_id) into v_unique_clickers
  from public.link_clicks
  where created_at::date = p_day
    and subscriber_id is not null;

  select count(*) into v_feedback
  from public.recommendations
  where feedback is not null
    and coalesce(feedback_at, sent_at)::date = p_day;

  select count(*) into v_premium
  from public.subscribers
  where tier = 'premium' and subscribed = true;

  -- Personalization lift for issues sent this day (watch clickers / recipients)
  select
    coalesce(
      count(distinct lc.subscriber_id) filter (where es.variant = 'personalized')::numeric
        / nullif(count(distinct es.subscriber_id) filter (where es.variant = 'personalized'), 0),
      0
    ),
    coalesce(
      count(distinct lc.subscriber_id) filter (where es.variant = 'control')::numeric
        / nullif(count(distinct es.subscriber_id) filter (where es.variant = 'control'), 0),
      0
    )
  into v_pers_rate, v_ctrl_rate
  from public.email_sends es
  left join public.link_clicks lc
    on lc.send_id = es.id and lc.kind = 'watch'
  where es.sent_at::date = p_day;

  insert into public.metrics_daily as m (
    day, engaged_subs, total_subs, net_growth,
    open_rate, click_rate, feedback_ratio,
    inbox_rate, hard_bounce_rate, complaint_rate,
    mrr_ngn, conv_pct, rec_lift, refreshed_at
  ) values (
    p_day,
    v_engaged,
    v_total,
    v_total - v_prev_total,
    case when v_delivered > 0 then v_opened::numeric / v_delivered else 0 end,
    case when v_delivered > 0 then v_unique_clickers::numeric / v_delivered else 0 end,
    case when v_delivered > 0 then v_feedback::numeric / v_delivered else 0 end,
    case when v_targeted > 0 then v_delivered::numeric / v_targeted else 0 end,
    case when v_targeted > 0 then v_bounced::numeric / v_targeted else 0 end,
    case when v_targeted > 0 then v_complained::numeric / v_targeted else 0 end,
    -- MRR stub: fill from revenue_daily.premium * 30 or Stripe later
    coalesce((select premium * 30 from public.revenue_daily where day = p_day), 0),
    case when v_total > 0 then (v_premium::numeric / v_total) * 100 else 0 end,
    v_pers_rate - v_ctrl_rate,
    now()
  )
  on conflict (day) do update set
    engaged_subs = excluded.engaged_subs,
    total_subs = excluded.total_subs,
    net_growth = excluded.net_growth,
    open_rate = excluded.open_rate,
    click_rate = excluded.click_rate,
    feedback_ratio = excluded.feedback_ratio,
    inbox_rate = excluded.inbox_rate,
    hard_bounce_rate = excluded.hard_bounce_rate,
    complaint_rate = excluded.complaint_rate,
    mrr_ngn = excluded.mrr_ngn,
    conv_pct = excluded.conv_pct,
    rec_lift = excluded.rec_lift,
    refreshed_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

-- refresh_metrics_daily is SECURITY DEFINER, so PostgREST would otherwise let
-- anyone on the internet trigger a recompute via /rest/v1/rpc/.
revoke all on function public.refresh_metrics_daily(date) from public, anon, authenticated;
grant execute on function public.refresh_metrics_daily(date) to service_role, postgres;

-- Backfill last 90 days (idempotent). Safe on empty event tables.
do $$
declare
  d date;
begin
  for d in
    select generate_series(
      (current_date - 89),
      current_date,
      interval '1 day'
    )::date
  loop
    perform public.refresh_metrics_daily(d);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 9. Dashboard views (what lib/metrics/data.ts reads)
-- ---------------------------------------------------------------------------
-- Every view is `security_invoker = on`. Without it a view runs as its owner
-- (postgres) and bypasses the RLS below, so anon could read all metrics
-- through PostgREST — Supabase flags this as security_definer_view (ERROR).
-- service_role has BYPASSRLS, so the app still reads everything.
--
-- These views are sourced from weekly_picks, NOT email_issues/issue_picks:
-- /api/admin/send-picks only ever writes weekly_picks, so anything keyed to
-- email_issues can only be empty. Re-point them if the send path ever starts
-- writing per-issue receipts.
--
-- `create or replace view` cannot drop or rename a column, so re-running this
-- file against an older shape would fail with 42P16. Drop first — views hold no
-- data, so this is free.

drop view if exists public.v_metrics_latest_issue;
drop view if exists public.v_metrics_latest_slots;
drop view if exists public.v_metrics_funnel;
drop view if exists public.v_metrics_genres;
drop view if exists public.v_metrics_personalization;
drop view if exists public.v_metrics_movie_leaderboard;
drop view if exists public.v_metrics_platforms;
drop view if exists public.v_metrics_revenue_mix;
drop view if exists public.v_metrics_weekly_issues;
drop view if exists public.v_metrics_feedback_summary;
drop view if exists public.v_metrics_feedback_ratings;
-- Superseded: every view now derives its issue from weekly_picks.
drop view if exists public.v_metrics_issue_delivered;

-- A "Friday issue" is the batch of weekly_picks sharing a sent_at day.
-- send-picks emails every subscribed subscriber and records no receipt, so
-- `delivered` is RECONSTRUCTED from the list. It is an estimate, not a
-- measurement — writing email_sends at send time is what makes it exact.
create or replace view public.v_metrics_weekly_issues
with (security_invoker = on) as
select
  date_trunc('day', wp.sent_at)::date as day,
  'friday-' || to_char(date_trunc('day', wp.sent_at), 'YYYY-MM-DD') as slug,
  max(wp.sent_at) as sent_at,
  count(*)::int as pick_count,
  (
    select count(*) from public.subscribers s
    where s.subscribed and s.created_at <= max(wp.sent_at)
  )::numeric as delivered
from public.weekly_picks wp
where wp.sent_at is not null
group by 1, 2;

-- Latest issue summary + mini stats
create or replace view public.v_metrics_latest_issue
with (security_invoker = on) as
with latest as (
  select * from public.v_metrics_weekly_issues order by sent_at desc limit 1
),
picks as (
  select wp.id
  from public.weekly_picks wp, latest l
  where wp.sent_at is not null
    and date_trunc('day', wp.sent_at)::date = l.day
),
c as (
  select
    count(distinct lc.subscriber_id) as unique_clickers,
    count(distinct lc.subscriber_id) filter (where lc.kind = 'trailer') as trailer_clickers,
    count(distinct lc.subscriber_id) filter (where lc.kind = 'watch') as watch_clickers
  from public.link_clicks lc
  where lc.weekly_pick_id in (select id from picks)
)
select
  l.slug,
  l.day as sent_at,
  l.delivered::int as delivered,
  coalesce(c.unique_clickers, 0)::int as unique_clickers,
  case when l.delivered > 0
    then coalesce(c.trailer_clickers, 0)::numeric / l.delivered else 0 end as trailer_ctr,
  case when l.delivered > 0
    then coalesce(c.watch_clickers, 0)::numeric / l.delivered else 0 end as watch_intent_rate
from latest l cross join c;

-- Per-slot watch intent for latest issue
create or replace view public.v_metrics_latest_slots
with (security_invoker = on) as
with latest as (
  select * from public.v_metrics_weekly_issues order by sent_at desc limit 1
),
picks as (
  select
    wp.id,
    wp.title,
    row_number() over (order by wp.created_at, wp.id)::int as slot,
    l.delivered
  from public.weekly_picks wp, latest l
  where wp.sent_at is not null
    and date_trunc('day', wp.sent_at)::date = l.day
)
select
  p.slot,
  p.title,
  case when p.delivered > 0 then
    (select count(distinct lc.subscriber_id) from public.link_clicks lc
      where lc.weekly_pick_id = p.id and lc.kind = 'watch')::numeric / p.delivered
  else 0 end as watch_intent_rate
from picks p
order by p.slot;

-- Trailer → watch funnel for latest issue
create or replace view public.v_metrics_funnel
with (security_invoker = on) as
with latest as (
  select * from public.v_metrics_weekly_issues order by sent_at desc limit 1
),
picks as (
  select wp.id
  from public.weekly_picks wp, latest l
  where wp.sent_at is not null
    and date_trunc('day', wp.sent_at)::date = l.day
),
c as (
  select
    count(distinct lc.subscriber_id) filter (where lc.kind = 'trailer') as trailer_clickers,
    count(distinct lc.subscriber_id) filter (where lc.kind = 'watch') as watch_clickers
  from public.link_clicks lc
  where lc.weekly_pick_id in (select id from picks)
)
select * from (
  select 1 as ord, 'Delivered'::text as stage, (select delivered::int from latest) as value
  union all
  select 2, 'Trailer clickers', (select trailer_clickers::int from c)
  union all
  select 3, 'Watch clickers', (select watch_clickers::int from c)
) x
where exists (select 1 from latest)
order by ord;

-- Personalization needs a control holdout, which only exists once email_sends
-- records a variant. Return no rows rather than a 0.0 that reads as "measured
-- no lift" when nothing was measured at all — the UI renders "not measured".
create or replace view public.v_metrics_personalization
with (security_invoker = on) as
with latest as (
  select id from public.email_issues order by sent_at desc limit 1
),
base as (
  select
    es.variant,
    count(distinct es.subscriber_id) as recipients,
    count(distinct lc.subscriber_id) filter (where lc.kind = 'watch') as watchers
  from latest l
  join public.email_sends es on es.issue_id = l.id
  left join public.link_clicks lc on lc.send_id = es.id
  group by es.variant
)
select
  coalesce((select watchers::numeric / nullif(recipients, 0) from base where variant = 'personalized'), 0) as personalized_rate,
  coalesce((select watchers::numeric / nullif(recipients, 0) from base where variant = 'control'), 0) as control_rate,
  coalesce((select recipients from base where variant = 'personalized'), 0)::int as personalized_recipients,
  coalesce((select recipients from base where variant = 'control'), 0)::int as control_recipients
where exists (select 1 from base);

-- Movie leaderboard (last 90 days), sourced from weekly_picks.
--
-- weekly_picks is the table /api/admin/send-picks actually writes; issue_picks
-- is part of a per-issue pipeline nothing populates yet, so a leaderboard built
-- on it can only ever be empty. A "Friday issue" here is the batch of
-- weekly_picks sharing a sent_at day, and slot is the pick's position in it.
create or replace view public.v_metrics_movie_leaderboard
with (security_invoker = on) as
with sent as (
  select
    wp.id,
    wp.title,
    wp.sent_at,
    row_number() over (
      partition by date_trunc('day', wp.sent_at)
      order by wp.created_at, wp.id
    )::int as slot,
    -- send-picks emails every subscribed subscriber but records no receipt, so
    -- recipients are RECONSTRUCTED from the list as it stands today. This is an
    -- estimate, not a measurement: it reads current `subscribed` state, so
    -- anyone who has since unsubscribed is missing. Writing email_sends at send
    -- time is what makes this exact.
    (
      select count(*) from public.subscribers s
      where s.subscribed and s.created_at <= wp.sent_at
    )::numeric as impressions
  from public.weekly_picks wp
  where wp.sent_at is not null
    and wp.sent_at >= now() - interval '90 days'
),
clicks as (
  select
    lc.weekly_pick_id as id,
    count(distinct lc.subscriber_id) filter (where lc.kind = 'trailer')::numeric as trailer_clickers,
    count(distinct lc.subscriber_id) filter (where lc.kind = 'watch')::numeric as watch_clickers
  from public.link_clicks lc
  where lc.weekly_pick_id is not null
  group by lc.weekly_pick_id
),
fb as (
  select
    r.weekly_pick_id as id,
    count(*) filter (where r.feedback = 'up')::int as ups,
    count(*) filter (where r.feedback = 'down')::int as downs,
    count(*) filter (where r.feedback = 'saved')::int as saves
  from public.recommendations r
  where r.weekly_pick_id is not null
  group by r.weekly_pick_id
),
rates as (
  select
    s.id, s.title, s.slot, s.sent_at, s.impressions,
    case when s.impressions > 0
      then coalesce(c.trailer_clickers, 0) / s.impressions else 0 end as trailer_ctr,
    case when s.impressions > 0
      then coalesce(c.watch_clickers, 0) / s.impressions else 0 end as watch_intent_rate
  from sent s
  left join clicks c on c.id = s.id
),
slot_avg as (
  select slot, avg(watch_intent_rate) as avg_watch_rate from rates group by slot
)
-- No impressions floor: the guide's `>= 200` assumes a big list and would
-- exclude every row at the current subscriber count.
select
  r.title,
  r.slot,
  r.impressions::int as impressions,
  r.trailer_ctr,
  r.watch_intent_rate,
  case when coalesce(sa.avg_watch_rate, 0) > 0
    then r.watch_intent_rate / sa.avg_watch_rate else 0 end as slot_adjusted_lift,
  coalesce(f.ups, 0) as ups,
  coalesce(f.downs, 0) as downs,
  coalesce(f.saves, 0) as saves
from rates r
left join slot_avg sa on sa.slot = r.slot
left join fb f on f.id = r.id
order by slot_adjusted_lift desc, r.sent_at desc, r.slot
limit 25;

-- Genre: stated preference share vs revealed watch intent.
-- weekly_picks.genre is a comma-separated label list ("Action, Drama"), not an
-- array — split it before matching against preferences.favorite_genres.
create or replace view public.v_metrics_genres
with (security_invoker = on) as
with total_prefs as (
  select count(*)::numeric as n from public.preferences
  where coalesce(array_length(favorite_genres, 1), 0) > 0
),
stated as (
  select unnest(favorite_genres) as genre, count(*)::numeric as c
  from public.preferences group by 1
),
genre_picks as (
  select distinct btrim(g) as genre, wp.id as pick_id
  from public.weekly_picks wp
  cross join lateral unnest(string_to_array(wp.genre, ',')) as g
  where wp.sent_at is not null
    and wp.sent_at >= now() - interval '90 days'
    and wp.genre is not null
    and btrim(g) <> ''
),
reached as (
  select (select count(*) from public.subscribers where subscribed)::numeric as n
),
watched as (
  select gp.genre, count(distinct lc.subscriber_id)::numeric as watchers
  from genre_picks gp
  join public.link_clicks lc
    on lc.weekly_pick_id = gp.pick_id and lc.kind = 'watch'
  group by gp.genre
)
select
  s.genre,
  case when t.n > 0 then s.c / t.n else 0 end as stated_pct,
  case when r.n > 0 and exists (select 1 from genre_picks gp where gp.genre = s.genre)
    then coalesce(w.watchers, 0) / r.n else 0 end as revealed_rate
from stated s
cross join total_prefs t
cross join reached r
left join watched w on w.genre = s.genre
order by stated_pct desc
limit 20;

-- Platform pull (last 90 days)
create or replace view public.v_metrics_platforms
with (security_invoker = on) as
select
  coalesce(lc.platform, 'Other') as platform,
  count(*)::int as watch_clicks,
  case when count(*) = 0 then 0
    else round(100.0 * count(*) filter (where coalesce(pc.is_monetizable, false)) / count(*))::int
  end as pct_monetizable,
  coalesce(bool_or(pc.has_affiliate), false) as has_affiliate
from public.link_clicks lc
left join public.platform_catalog pc on pc.platform = lc.platform
where lc.kind = 'watch'
  and lc.created_at >= now() - interval '90 days'
group by coalesce(lc.platform, 'Other')
order by watch_clicks desc;

-- Revenue mix (passthrough)
create or replace view public.v_metrics_revenue_mix
with (security_invoker = on) as
select day::text as day, adsense, affiliate, sponsorship, premium
from public.revenue_daily
order by day asc;

-- Reader feedback: compact summary for the card — counts only, no message
-- bodies (those are read straight off site_feedback, capped and admin-only).
create or replace view public.v_metrics_feedback_summary
with (security_invoker = on) as
select
  count(*)::int as total,
  count(*) filter (where created_at >= now() - interval '30 days')::int as last_30d,
  count(*) filter (where status = 'new')::int as unread,
  count(rating)::int as rated,
  round(avg(rating), 2) as avg_rating
from public.site_feedback;

-- Rating distribution, 1..5 always present so the bars never have holes.
create or replace view public.v_metrics_feedback_ratings
with (security_invoker = on) as
select
  g.rating,
  coalesce(count(f.id), 0)::int as count
from generate_series(1, 5) as g(rating)
left join public.site_feedback f on f.rating = g.rating
group by g.rating
order by g.rating;

-- ---------------------------------------------------------------------------
-- 10. RLS: deny by default; the app reads with the service role
-- ---------------------------------------------------------------------------
-- The Next.js app uses SUPABASE_SERVICE_ROLE_KEY, which has BYPASSRLS.
-- No policies for anon/authenticated → they read nothing.

alter table public.email_issues enable row level security;
alter table public.issue_picks enable row level security;
alter table public.email_sends enable row level security;
alter table public.recommendations enable row level security;
alter table public.link_clicks enable row level security;
alter table public.metrics_daily enable row level security;
alter table public.revenue_daily enable row level security;
alter table public.platform_catalog enable row level security;
-- site_feedback carries reader emails: writes go through /api/site-feedback
-- with the service role, reads are admin-only.
alter table public.site_feedback enable row level security;

-- =============================================================================
-- Done. Next steps:
--   1. Run this SQL in Supabase.
--   2. Deploy app changes that write email_issues / issue_picks / email_sends
--      / recommendations / link_clicks on Friday send + click redirects.
--   3. Optionally schedule: select refresh_metrics_daily(current_date);
--      daily via pg_cron or a Vercel cron hitting an admin API.
--   4. Fill revenue_daily manually or from AdSense/affiliate CSVs.
-- =============================================================================
