"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DailyMetric, DashboardData } from "@/lib/metrics/types";
import {
  ChartCard,
  SourceBadge,
  compact,
  formatDay,
  ngn,
  pct1,
  pp1,
} from "./chart-kit";
import { StatCard, type StatPoint } from "./StatCard";
import { FeedbackPanel } from "./FeedbackPanel";
import {
  FunnelChart,
  GenrePanels,
  PlatformPullChart,
  RevenueMixChart,
  SlotBreakdownChart,
} from "./charts";

const RANGES = [7, 30, 90] as const;

interface KpiSpec {
  label: string;
  key: keyof DailyMetric;
  format: (v: number) => string;
}

// §06 order: audience, engagement, deliverability, revenue, premium, rec quality.
const KPIS: KpiSpec[] = [
  { label: "Engaged subscribers", key: "engaged_subs", format: compact },
  { label: "Click rate", key: "click_rate", format: pct1 },
  { label: "Inbox placement", key: "inbox_rate", format: pct1 },
  { label: "MRR", key: "mrr_ngn", format: ngn },
  { label: "Free → paid", key: "conv_pct", format: (v) => `${v.toFixed(1)}%` },
  { label: "Rec lift vs control", key: "rec_lift", format: pp1 },
];

function kpiSeries(daily: DailyMetric[], key: keyof DailyMetric): StatPoint[] {
  return daily.map((d) => ({ day: d.day, v: Number(d[key]) }));
}

function pctDelta(series: StatPoint[]): number | null {
  if (series.length < 2) return null;
  const first = series[0].v;
  const last = series[series.length - 1].v;
  if (first === 0) return null;
  return ((last - first) / Math.abs(first)) * 100;
}

export function MetricsDashboard({ data }: { data: DashboardData }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const daily = useMemo(() => data.daily.slice(-range), [data.daily, range]);
  const revenueMix = useMemo(() => data.revenueMix.slice(-range), [data.revenueMix, range]);

  const issue = data.latestIssue;
  const p = data.personalization;
  const lift = p ? p.personalizedRate - p.controlRate : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recon metrics</h1>
          <p className="mt-1 text-sm text-muted">
            Six metric groups plus click analytics for the Friday send.
          </p>
        </div>
        <Link
          href="/lock-waza-secret"
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Weekly picks admin
        </Link>
      </header>

      {/* Filter row — scopes the time-series section below it */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            aria-pressed={range === r}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              range === r
                ? "bg-accent font-medium text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            Last {r} days
          </button>
        ))}
        <div className="ml-auto">
          <SourceBadge source={data.overviewSource} />
        </div>
      </div>

      {/* The six §06 cards */}
      <section aria-label="Headline metrics" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {KPIS.map((kpi) => {
          const series = kpiSeries(daily, kpi.key);
          const last = series[series.length - 1];
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={last ? kpi.format(last.v) : "—"}
              delta={pctDelta(series)}
              deltaLabel={`vs ${range} days ago`}
              series={series}
              format={kpi.format}
            />
          );
        })}
      </section>

      {/* Revenue mix — the escaping-AdSense chart */}
      <section className="mt-4">
        <ChartCard
          title="Revenue mix by stream"
          subtitle={`Daily revenue (₦), last ${range} days — watching the AdSense share shrink`}
          table={{
            columns: ["Day", "AdSense", "Affiliate", "Sponsorship", "Premium"],
            rows: revenueMix.map((r) => [
              formatDay(r.day),
              ngn(r.adsense),
              ngn(r.affiliate),
              ngn(r.sponsorship),
              ngn(r.premium),
            ]),
          }}
        >
          <RevenueMixChart data={revenueMix} />
        </ChartCard>
      </section>

      {/* Click analytics */}
      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Click analytics</h2>
            <p className="mt-0.5 text-sm text-muted">
              Latest issue and trailing 90 days. A watch click is intent, not a view.
            </p>
          </div>
          <SourceBadge source={data.clicksSource} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title={`This issue — ${issue.slug}`}
            subtitle="Watch-intent rate by slot position"
            table={{
              columns: ["Slot", "Title", "Watch intent"],
              rows: issue.perSlot.map((s) => [s.slot, s.title, pct1(s.watchIntentRate)]),
            }}
          >
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Delivered" value={compact(issue.delivered)} />
              <MiniStat label="Unique clickers" value={compact(issue.uniqueClickers)} />
              <MiniStat label="Trailer CTR" value={pct1(issue.trailerCtr)} />
              <MiniStat label="Watch intent" value={pct1(issue.watchIntentRate)} />
            </div>
            <SlotBreakdownChart data={issue.perSlot} />
          </ChartCard>

          <ChartCard
            title="Trailer → watch funnel"
            subtitle="Unique people per stage, latest issue"
            table={{
              columns: ["Stage", "People"],
              rows: data.funnel.map((f) => [f.stage, f.value.toLocaleString("en")]),
            }}
          >
            <FunnelChart data={data.funnel} />
            <div className="mt-4 rounded-lg border border-border bg-background/40 p-3">
              <div className="text-xs uppercase tracking-wide text-muted">
                Personalization lift vs control
              </div>
              {p ? (
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground">
                    {lift >= 0 ? "+" : ""}
                    {pp1(lift)}
                  </span>
                  <span className="text-xs text-muted">
                    personalized {pct1(p.personalizedRate)} (
                    {compact(p.personalizedRecipients)}) vs control{" "}
                    {pct1(p.controlRate)} ({compact(p.controlRecipients)})
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted">
                  Not measured. Every subscriber gets the same hand-curated list, so there is no
                  control group to compare against — this stays blank until sends record a
                  variant.
                </p>
              )}
            </div>
          </ChartCard>
        </div>

        <div className="mt-4">
          <ChartCard
            title="Movie leaderboard"
            badge={<SourceBadge source={data.leaderboardSource} />}
            subtitle={
              data.leaderboardSource === "live"
                ? "Real picks from weekly_picks, ranked by slot-adjusted lift. Impressions are estimated from the subscriber list until sends are recorded."
                : "Ranked by slot-adjusted lift — raw clicks just re-rank slot 1"
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="py-2 pr-3 font-medium">Title</th>
                    <th className="py-2 pr-3 text-right font-medium">Slot</th>
                    <th className="py-2 pr-3 text-right font-medium">Impressions</th>
                    <th className="py-2 pr-3 text-right font-medium">Trailer CTR</th>
                    <th className="py-2 pr-3 text-right font-medium">Watch intent</th>
                    <th className="py-2 pr-3 text-right font-medium">👍 / 👎 / 🔖</th>
                    <th className="py-2 text-right font-medium">Lift</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {data.leaderboard.map((m) => (
                    <tr key={`${m.title}-${m.slot}`} className="border-b border-border/50">
                      <td className="py-2 pr-3 text-foreground">{m.title}</td>
                      <td className="py-2 pr-3 text-right text-muted">{m.slot}</td>
                      <td className="py-2 pr-3 text-right text-muted">{m.impressions.toLocaleString("en")}</td>
                      <td className="py-2 pr-3 text-right text-muted">{pct1(m.trailerCtr)}</td>
                      <td className="py-2 pr-3 text-right text-muted">{pct1(m.watchIntentRate)}</td>
                      <td className="py-2 pr-3 text-right text-muted">
                        {m.ups} / {m.downs} / {m.saves}
                      </td>
                      <td className="py-2 text-right font-semibold text-foreground">
                        {m.slotAdjustedLift.toFixed(2)}×
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Genre: stated vs revealed"
            subtitle="What people say they like vs what they click — when they disagree, the clicks are right"
            table={{
              columns: ["Genre", "Stated", "Revealed watch intent"],
              rows: data.genres.map((g) => [g.genre, pct1(g.statedPct), pct1(g.revealedRate)]),
            }}
          >
            <GenrePanels data={data.genres} />
          </ChartCard>

          <ChartCard
            title="Platform pull"
            subtitle="Watch clicks by destination, last 90 days — rent/buy clicks are the ones that pay"
            table={{
              columns: ["Platform", "Watch clicks", "Monetizable", "Affiliate program"],
              rows: data.platforms.map((p) => [
                p.platform,
                p.watchClicks.toLocaleString("en"),
                `${p.pctMonetizable}%`,
                p.hasAffiliate ? "Yes" : "No",
              ]),
            }}
          >
            {data.platforms.length > 0 ? (
              <PlatformPullChart data={data.platforms} />
            ) : (
              <EmptyChart>
                No watch clicks recorded yet. Platform pull fills in once the weekly email routes
                its links through <code className="text-foreground">/api/track</code>.
              </EmptyChart>
            )}
          </ChartCard>
        </div>
      </section>

      {/* Reader feedback — last, so it never competes with the numbers above. */}
      <section className="mt-8">
        <ChartCard
          title="Reader feedback"
          subtitle={
            data.feedback
              ? "Free-text messages from the homepage form, newest first"
              : undefined
          }
        >
          {data.feedback ? (
            <FeedbackPanel data={data.feedback} />
          ) : (
            <EmptyChart>
              No feedback yet. Messages sent from the form on the homepage show up here.
            </EmptyChart>
          )}
        </ChartCard>
      </section>

      <footer className="mt-8 text-xs text-muted">
        Open rate is tracked for trend only (Apple MPP inflates it). Watch intent is a click on a
        watch link — confirmations from the &ldquo;Seen it?&rdquo; prompt calibrate what a click is worth.
      </footer>
    </main>
  );
}

function EmptyChart({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border p-4">
      <p className="max-w-sm text-center text-xs text-muted">{children}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
