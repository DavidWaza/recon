"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  FunnelStage,
  GenreRow,
  PlatformRow,
  RevenueMixPoint,
  SlotStat,
} from "@/lib/metrics/types";
import { CHART, ChartTip, compact, formatDay, ngn, pct1 } from "./chart-kit";

// Recharts label formatters receive RenderableText, not number — coerce once.
const fmtLabel = (fmt: (n: number) => string) => (value: unknown) =>
  typeof value === "number" ? fmt(value) : String(value ?? "");

const REVENUE_STREAMS = [
  { key: "adsense", name: "AdSense" },
  { key: "affiliate", name: "Affiliate" },
  { key: "sponsorship", name: "Sponsorship" },
  { key: "premium", name: "Premium" },
] as const;

function LegendRow({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.name} className="inline-flex items-center gap-1.5 text-xs text-muted">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: item.color }}
          />
          {item.name}
        </span>
      ))}
    </div>
  );
}

export function RevenueMixChart({ data }: { data: RevenueMixPoint[] }) {
  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={formatDay}
              tick={{ fill: CHART.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: CHART.grid }}
              interval="preserveStartEnd"
              minTickGap={48}
            />
            <YAxis
              tickFormatter={(v: number) => ngn(v)}
              tick={{ fill: CHART.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip content={<ChartTip format={(v) => ngn(v)} labelFormat={formatDay} />} />
            {REVENUE_STREAMS.map((stream, i) => (
              <Area
                key={stream.key}
                type="monotone"
                dataKey={stream.key}
                name={stream.name}
                stackId="mix"
                stroke={CHART.series[i]}
                strokeWidth={2}
                fill={CHART.series[i]}
                fillOpacity={0.14}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <LegendRow
        items={REVENUE_STREAMS.map((s, i) => ({ name: s.name, color: CHART.series[i] }))}
      />
    </div>
  );
}

// Stated preference and revealed click behaviour are different scales, so
// they get two aligned panels sharing one genre order — never one dual axis.
export function GenrePanels({ data }: { data: GenreRow[] }) {
  const height = data.length * 30 + 30;
  const shared = {
    layout: "vertical" as const,
    margin: { top: 0, right: 40, bottom: 0, left: 0 },
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="mb-1 text-xs font-medium text-muted">Stated preference</div>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} {...shared}>
              <XAxis type="number" hide domain={[0, "dataMax"]} />
              <YAxis
                type="category"
                dataKey="genre"
                width={88}
                tick={{ fill: CHART.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<ChartTip format={pct1} />}
              />
              <Bar
                dataKey="statedPct"
                name="Stated preference"
                fill={CHART.series[0]}
                maxBarSize={14}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="statedPct"
                  position="right"
                  formatter={fmtLabel(pct1)}
                  style={{ fill: CHART.axis, fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-muted">Revealed watch intent</div>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} {...shared}>
              <XAxis type="number" hide domain={[0, "dataMax"]} />
              <YAxis type="category" dataKey="genre" width={8} tick={false} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<ChartTip format={pct1} />}
              />
              <Bar
                dataKey="revealedRate"
                name="Revealed watch intent"
                fill={CHART.series[1]}
                maxBarSize={14}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="revealedRate"
                  position="right"
                  formatter={fmtLabel(pct1)}
                  style={{ fill: CHART.axis, fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function PlatformPullChart({ data }: { data: PlatformRow[] }) {
  const rows = data.map((p) => {
    const monetizable = Math.round((p.watchClicks * p.pctMonetizable) / 100);
    return {
      platform: p.platform,
      monetizable,
      subscription: p.watchClicks - monetizable,
      total: p.watchClicks,
    };
  });
  const height = rows.length * 34 + 30;
  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 44, bottom: 0, left: 0 }}>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="platform"
              width={92}
              tick={{ fill: CHART.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={<ChartTip format={(v) => compact(v)} />}
            />
            <Bar
              dataKey="subscription"
              name="Subscription (unpaid)"
              stackId="pull"
              fill={CHART.series[0]}
              maxBarSize={16}
              isAnimationActive={false}
            />
            <Bar
              dataKey="monetizable"
              name="Rent / buy (monetizable)"
              stackId="pull"
              fill={CHART.series[1]}
              maxBarSize={16}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="total"
                position="right"
                formatter={fmtLabel(compact)}
                style={{ fill: CHART.axis, fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <LegendRow
        items={[
          { name: "Subscription (unpaid)", color: CHART.series[0] },
          { name: "Rent / buy (monetizable)", color: CHART.series[1] },
        ]}
      />
    </div>
  );
}

export function FunnelChart({ data }: { data: FunnelStage[] }) {
  const height = data.length * 40 + 16;
  const conversions = data.slice(1).map((stage, i) => ({
    from: data[i].stage,
    to: stage.stage,
    rate: data[i].value > 0 ? stage.value / data[i].value : 0,
  }));
  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 52, bottom: 0, left: 0 }}>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="stage"
              width={110}
              tick={{ fill: CHART.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={<ChartTip format={(v) => compact(v)} />}
            />
            <Bar dataKey="value" name="People" maxBarSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((stage, i) => (
                <Cell key={stage.stage} fill={CHART.ordinal[Math.min(i, CHART.ordinal.length - 1)]} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                formatter={fmtLabel(compact)}
                style={{ fill: CHART.axis, fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {conversions.map((c) => (
          <span key={c.to}>
            {c.from} → {c.to}:{" "}
            <span className="font-medium text-foreground tabular-nums">{pct1(c.rate)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SlotBreakdownChart({ data }: { data: SlotStat[] }) {
  const rows = data.map((s) => ({ ...s, label: `Slot ${s.slot}` }));
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
          />
          <YAxis
            tickFormatter={(v: number) => pct1(v)}
            tick={{ fill: CHART.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={<SlotTip />}
          />
          <Bar
            dataKey="watchIntentRate"
            name="Watch intent"
            fill={CHART.series[0]}
            maxBarSize={24}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SlotTipProps {
  active?: boolean;
  payload?: Array<{ payload?: SlotStat & { label: string }; value?: number }>;
}

function SlotTip({ active, payload }: SlotTipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-border bg-[#1b2140] px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 text-muted">{row.title}</div>
      <div className="font-semibold text-foreground tabular-nums">
        {pct1(row.watchIntentRate)} <span className="font-normal text-muted">watch intent</span>
      </div>
    </div>
  );
}
