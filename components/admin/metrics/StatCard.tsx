"use client";

import {
  Area,
  AreaChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CHART, ChartTip, formatDay } from "./chart-kit";

export interface StatPoint {
  day: string;
  v: number;
}

interface StatCardProps {
  label: string;
  value: string;
  delta: number | null; // percent change over the selected range
  deltaLabel: string;
  series: StatPoint[];
  format: (v: number) => string;
  icon?: IconName;
}

export function StatCard({ label, value, delta, deltaLabel, series, format, icon }: StatCardProps) {
  // useId can contain characters that break a url(#…) reference.
  const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const last = series[series.length - 1];
  const up = delta != null && delta >= 0;
  return (
    <div className="surface-glow group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {icon && (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-accent-150 bg-accent-50 text-accent-500">
              <Icon name={icon} className="size-3.5" />
            </span>
          )}
          <span className="truncate text-xs font-medium text-muted">{label}</span>
        </div>
        {delta != null && (
          <span
            title={deltaLabel}
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              up
                ? "border-green-150 bg-green-50 text-green-500"
                : "border-red-150 bg-red-50 text-red-500",
            )}
          >
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-3xl">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-subtle">{deltaLabel}</div>

      <div className="-mx-1 mt-3 h-12" aria-hidden={series.length === 0}>
        {series.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 6, bottom: 2, left: 6 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.series[0]} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART.series[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                cursor={{ stroke: CHART.grid, strokeWidth: 1 }}
                content={<ChartTip format={format} labelFormat={formatDay} />}
              />
              <Area
                type="monotone"
                dataKey="v"
                name={label}
                stroke={CHART.series[0]}
                strokeOpacity={0.8}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
              {last && (
                <ReferenceDot
                  x={last.day}
                  y={last.v}
                  r={4}
                  fill={CHART.series[0]}
                  stroke={CHART.surface}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
