# Metrics schema (Supabase)

Run this once in the **Supabase SQL editor**:

[`metrics-schema.sql`](./metrics-schema.sql)

## What it creates

| Object | Feeds on metrics page |
|--------|------------------------|
| `metrics_daily` | KPI cards (engaged subs, click rate, inbox, MRR, conversion, rec lift) |
| `revenue_daily` | Revenue mix chart (AdSense / affiliate / sponsorship / premium) |
| `email_issues` + `issue_picks` | Latest issue slug, per-slot titles |
| `email_sends` | Delivered counts, personalization A/B |
| `link_clicks` | Trailer CTR, watch intent, funnel, platform pull |
| `recommendations` | 👍 / 👎 / 🔖 on the movie leaderboard |
| `preferences` | Genre “stated” share |
| `platform_catalog` | Affiliate / monetizable flags |
| Views `v_metrics_*` | Aggregations read by `lib/metrics/data.ts` |
| `refresh_metrics_daily(date)` | Rebuilds one day of `metrics_daily` from events |

## After running the SQL

1. Open `/lock-waza-secret/metrics` — overview badges flip to **live** once `metrics_daily` has rows (the SQL backfills 90 days from current subscriber counts).
2. Click sections stay **sample** until Friday sends write `email_issues` / `issue_picks` / `email_sends` / `recommendations`, and trailer/watch links go through `/api/track`.
3. Optionally schedule daily:

```sql
select public.refresh_metrics_daily(current_date);
```

4. Fill `revenue_daily` manually (or import AdSense/affiliate CSVs):

```sql
insert into revenue_daily (day, adsense, affiliate, sponsorship, premium)
values (current_date, 3200, 800, 0, 1500)
on conflict (day) do update set
  adsense = excluded.adsense,
  affiliate = excluded.affiliate,
  sponsorship = excluded.sponsorship,
  premium = excluded.premium;
```

## Click tracking URL shape

```
/api/track?kind=watch&pick=<issue_pick_uuid>&s=<subscriber_uuid>&u=<encoded_destination>
/api/track?kind=trailer&pick=<issue_pick_uuid>&s=<subscriber_uuid>&u=<encoded_destination>
```
