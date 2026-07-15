# Recon metrics — Supabase SQL schema

The SQL lives in **[`metrics-schema.sql`](./metrics-schema.sql)** — that file is the single source of
truth. This page explains how to run it and what it builds.

> This document used to embed a second copy of the whole script. The two drifted, and that is how
> `issue_picks` ended up dropped while `link_clicks.issue_pick_id` kept pointing at nothing. Keep the
> SQL in one place.

Safe to re-run (`if not exists` / `create or replace` throughout). Requires `pgcrypto` (the script enables it).

---

## How to run

1. Open your project in [Supabase](https://supabase.com/dashboard).
2. Go to **SQL Editor → New query**.
3. Paste the contents of [`metrics-schema.sql`](./metrics-schema.sql).
4. Click **Run**.
5. Confirm under **Table Editor** that `metrics_daily`, `email_issues`, `issue_picks` and `link_clicks` exist.
6. Open `/lock-waza-secret/metrics`.

---

## What each object is for

| Object | Metrics page section |
|--------|----------------------|
| `metrics_daily` | KPI cards (engaged subs, click rate, inbox, MRR, free→paid, rec lift) |
| `revenue_daily` | Revenue mix chart |
| `email_issues` | One Friday newsletter send |
| `issue_picks` | Movies in that send (slot 1…n) — the impression unit |
| `email_sends` | Per-subscriber delivery + A/B variant |
| `recommendations` | 👍 / 👎 / 🔖 feedback (`id` = email `r=` token) |
| `link_clicks` | Trailer / watch click events |
| `platform_catalog` | Affiliate / monetizable flags |
| `preferences` | Genre “stated” likes (already used by the app) |
| `subscribers` / `weekly_picks` | Core product tables (created only if missing) |
| `refresh_metrics_daily(date)` | Rebuilds one day of `metrics_daily` from events |
| `v_metrics_*` views | Aggregations read by `lib/metrics/data.ts` |

## Type note (important)

Your live `weekly_picks.id` is **`uuid`**, not `bigint`. This schema uses:

- `weekly_picks.id uuid`
- `issue_picks.weekly_pick_id uuid`
- `recommendations.weekly_pick_id uuid`

A `bigint` here fails with *"foreign key constraint cannot be implemented"* and takes the script down mid-way.

If a previous run failed, **just re-run the whole script** — it is idempotent and repairs a partial state.

> ⚠️ **Do not** `drop table public.issue_picks cascade` as a fix. The cascade also drops
> `v_metrics_latest_slots`, `v_metrics_movie_leaderboard` and `v_metrics_genres`, and it strips the
> `issue_pick_id` foreign keys off `recommendations` and `link_clicks` while leaving the columns
> behind — so a later re-run silently skips them (Postgres has no `add constraint if not exists`).
> Re-running the full script repairs all of that; §1a re-attaches the constraints.

## Security model

- **Every `v_metrics_*` view is `security_invoker = on`.** Without it a view runs as its owner
  (`postgres`) and bypasses the RLS on its base tables, so `anon` could read all metrics through
  PostgREST. Supabase flags that as `security_definer_view` (ERROR).
- **RLS is on with no anon/authenticated policies** → deny by default.
- **The app reads with `SUPABASE_SERVICE_ROLE_KEY`**, which has `BYPASSRLS`, so the dashboard still
  sees everything. Never expose that key to the browser.
- **`refresh_metrics_daily` is `SECURITY DEFINER`**, so `execute` is revoked from `anon`/`authenticated`
  — otherwise anyone could trigger a recompute via `/rest/v1/rpc/refresh_metrics_daily`.

---

## After you run it

**Refresh today’s KPIs**

```sql
select public.refresh_metrics_daily(current_date);
```

**Log revenue for a day** (AdSense / affiliate / sponsorship / premium in ₦)

```sql
insert into public.revenue_daily (day, adsense, affiliate, sponsorship, premium)
values (current_date, 3200, 800, 0, 1500)
on conflict (day) do update set
  adsense = excluded.adsense,
  affiliate = excluded.affiliate,
  sponsorship = excluded.sponsorship,
  premium = excluded.premium;
```

The revenue mix chart needs **at least two days** of `revenue_daily` rows to draw a band.

**Click tracking URLs** (app route `/api/track`)

```
/api/track?kind=watch&pick=<issue_pick_uuid>&s=<subscriber_uuid>&u=<encoded_url>
/api/track?kind=trailer&pick=<issue_pick_uuid>&s=<subscriber_uuid>&u=<encoded_url>
```

---

## Why the dashboard still shows zeros / sample data

`metrics_daily` is a **snapshot of the event tables** — it can only report what has been recorded:

| Section | Goes live when |
|---|---|
| KPI cards | `email_sends` / `link_clicks` / `recommendations` have rows, then `refresh_metrics_daily(day)` reruns for those days. Until then every rate is a true `0`. |
| Revenue mix | `revenue_daily` has ≥ 2 rows |
| Click analytics (issue, funnel, leaderboard, genres, platforms) | a real `email_issues` row exists — `lib/metrics/data.ts` gates the whole section on it, so a partially-populated view can never label demo rows as live |

Backfilling 90 days of `metrics_daily` does **not** invent history: it writes the rows, and every rate
stays `0` until the Friday send starts writing `email_issues` / `issue_picks` / `email_sends` /
`recommendations`, and email links start going through `/api/track`.
