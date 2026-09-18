"use client";

import { useMemo, useState } from "react";
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
import {
  PageActions,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeading,
  PageTitle,
} from "@/components/admin/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { EmptyPanel } from "@/components/ui/EmptyState";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const RANGE_OPTIONS = RANGES.map((r) => ({ value: r, label: `${r} days` }));

interface KpiSpec {
  label: string;
  key: keyof DailyMetric;
  format: (v: number) => string;
  icon: IconName;
}

// §06 order: audience, engagement, deliverability, revenue, premium, rec quality.
const KPIS: KpiSpec[] = [
  { label: "Engaged subscribers", key: "engaged_subs", format: compact, icon: "users" },
  { label: "Click rate", key: "click_rate", format: pct1, icon: "cursor" },
  { label: "Inbox placement", key: "inbox_rate", format: pct1, icon: "inbox" },
  { label: "MRR", key: "mrr_ngn", format: ngn, icon: "currency" },
  { label: "Free → paid", key: "conv_pct", format: (v) => `${v.toFixed(1)}%`, icon: "trend-up" },
  { label: "Rec lift vs control", key: "rec_lift", format: pp1, icon: "sparkles" },
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
  const [range, setRange] = useState<Range>(30);
  const daily = useMemo(() => data.daily.slice(-range), [data.daily, range]);
  const revenueMix = useMemo(() => data.revenueMix.slice(-range), [data.revenueMix, range]);

  const issue = data.latestIssue;
  const p = data.personalization;
  const lift = p ? p.personalizedRate - p.controlRate : 0;

  return (
    <>
      <PageHeader>
        <PageHeading>
          <PageEyebrow>
            <Icon name="chart" className="size-3.5" />
            Analytics
          </PageEyebrow>
          <PageTitle className="flex flex-wrap items-center gap-3">
            Recon metrics
            <SourceBadge source={data.overviewSource} />
          </PageTitle>
          <PageDescription>
            Six metric groups plus click analytics for the Friday send.
          </PageDescription>
        </PageHeading>
        <PageActions>
          <Segmented
            aria-label="Date range"
            value={range}
            onChange={setRange}
            options={RANGE_OPTIONS}
          />
        </PageActions>
      </PageHeader>

      {/* The six §06 cards — 2-up on phones so all six fit in ~1.5 screens. */}
      <section
        aria-label="Headline metrics"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
      >
        {KPIS.map((kpi) => {
          const series = kpiSeries(daily, kpi.key);
          const last = series[series.length - 1];
          return (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              icon={kpi.icon}
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
      <section className="mt-4 sm:mt-6">
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
      <section className="mt-10">
        <SectionHeading
          title="Click analytics"
          description="Latest issue and trailing 90 days. A watch click is intent, not a view."
          badge={<SourceBadge source={data.clicksSource} />}
        />

        <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
          <ChartCard
            title={`This issue — ${issue.slug}`}
            subtitle="Watch-intent rate by slot position"
            table={{
              columns: ["Slot", "Title", "Watch intent"],
              rows: issue.perSlot.map((s) => [s.slot, s.title, pct1(s.watchIntentRate)]),
            }}
          >
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="Delivered" value={compact(issue.delivered)} />
              <MiniStat label="Unique clickers" value={compact(issue.uniqueClickers)} />
              <MiniStat label="Trailer CTR" value={pct1(issue.trailerCtr)} />
              <MiniStat label="Watch intent" value={pct1(issue.watchIntentRate)} highlight />
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
            <div className="mt-4 rounded-xl border border-border bg-base-0/50 p-3.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-subtle">
                Personalization lift vs control
              </div>
              {p ? (
                <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={cn(
                      "text-3xl font-semibold tracking-tight tabular-nums",
                      lift >= 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
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
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Not measured. Every subscriber gets the same hand-curated list, so there is no
                  control group to compare against — this stays blank until sends record a
                  variant.
                </p>
              )}
            </div>
          </ChartCard>
        </div>

        <div className="mt-4 sm:mt-6">
          <ChartCard
            title="Movie leaderboard"
            badge={<SourceBadge source={data.leaderboardSource} />}
            subtitle={
              data.leaderboardSource === "live"
                ? "Real picks from weekly_picks, ranked by slot-adjusted lift. Impressions are estimated from the subscriber list until sends are recorded."
                : "Ranked by slot-adjusted lift — raw clicks just re-rank slot 1"
            }
          >
            {/* Phones: ranked cards. A 7-column table is unreadable at 375px. */}
            <ol className="grid gap-2 md:hidden">
              {data.leaderboard.map((m, i) => (
                <li
                  key={`${m.title}-${m.slot}`}
                  className="rounded-xl border border-border bg-base-0/40 p-3"
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={i + 1} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                      {m.title}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {m.slotAdjustedLift.toFixed(2)}×
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <LeaderStat label="Slot" value={String(m.slot)} />
                    <LeaderStat label="Trailer CTR" value={pct1(m.trailerCtr)} />
                    <LeaderStat label="Watch" value={pct1(m.watchIntentRate)} />
                    <LeaderStat label="Impr." value={compact(m.impressions)} />
                    <LeaderStat label="👍 / 👎" value={`${m.ups} / ${m.downs}`} />
                    <LeaderStat label="Saves" value={String(m.saves)} />
                  </dl>
                </li>
              ))}
            </ol>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Slot</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Trailer CTR</TableHead>
                    <TableHead className="text-right">Watch intent</TableHead>
                    <TableHead className="text-right">👍 / 👎 / 🔖</TableHead>
                    <TableHead className="text-right">Lift</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.leaderboard.map((m, i) => (
                    <TableRow key={`${m.title}-${m.slot}`}>
                      <TableCell className="text-foreground">
                        <span className="flex items-center gap-3">
                          <RankBadge rank={i + 1} />
                          <span className="max-w-[16rem] truncate font-medium">{m.title}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{m.slot}</TableCell>
                      <TableCell className="text-right">{m.impressions.toLocaleString("en")}</TableCell>
                      <TableCell className="text-right">{pct1(m.trailerCtr)}</TableCell>
                      <TableCell className="text-right">{pct1(m.watchIntentRate)}</TableCell>
                      <TableCell className="text-right">
                        {m.ups} / {m.downs} / {m.saves}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {m.slotAdjustedLift.toFixed(2)}×
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ChartCard>
        </div>

        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-2">
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
              <EmptyPanel>
                No watch clicks recorded yet. Platform pull fills in once the weekly email routes
                its links through <code className="text-foreground">/api/track</code>.
              </EmptyPanel>
            )}
          </ChartCard>
        </div>
      </section>

      {/* Reader feedback — last, so it never competes with the numbers above. */}
      <section className="mt-10">
        <SectionHeading
          title="Reader feedback"
          description={
            data.feedback
              ? "Free-text messages from the homepage form, newest first"
              : "What readers tell us from the homepage form"
          }
        />
        <ChartCard title="Inbox" subtitle={data.feedback ? `${data.feedback.total} messages` : undefined}>
          {data.feedback ? (
            <FeedbackPanel data={data.feedback} />
          ) : (
            <EmptyPanel>
              No feedback yet. Messages sent from the form on the homepage show up here.
            </EmptyPanel>
          )}
        </ChartCard>
      </section>

      <footer className="mt-10 flex gap-2.5 rounded-2xl border border-border bg-surface/60 p-4 text-xs leading-relaxed text-muted">
        <Icon name="info" className="mt-px size-4 shrink-0 text-subtle" />
        <p>
          Open rate is tracked for trend only (Apple MPP inflates it). Watch intent is a click on a
          watch link — confirmations from the &ldquo;Seen it?&rdquo; prompt calibrate what a click is worth.
        </p>
      </footer>
    </>
  );
}

function SectionHeading({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mb-4 sm:mb-5">
      <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
        {badge}
      </h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border px-3 py-2.5",
        highlight ? "border-accent-150 bg-accent-50" : "border-border bg-base-0/50",
      )}
    >
      <div className="truncate text-[11px] font-medium text-subtle">{label}</div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold tabular-nums",
        rank === 1
          ? "border-yellow-150 bg-yellow-50 text-yellow-500"
          : rank <= 3
            ? "border-accent-150 bg-accent-50 text-accent-500"
            : "border-border bg-base-100 text-subtle",
      )}
    >
      {rank}
    </span>
  );
}

function LeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-subtle">{label}</dt>
      <dd className="truncate font-semibold tabular-nums text-muted">{value}</dd>
    </div>
  );
}
