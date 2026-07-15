"use client";

import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
}

export function StatCard({ label, value, delta, deltaLabel, series, format }: StatCardProps) {
  const last = series[series.length - 1];
  const up = delta != null && delta >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-foreground">{value}</span>
        {delta != null && (
          <span
            className="text-sm font-medium"
            style={{ color: up ? CHART.up : CHART.down }}
            title={deltaLabel}
          >
            {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3 h-12" aria-hidden={series.length === 0}>
        {series.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, right: 8, bottom: 2, left: 8 }}>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                cursor={{ stroke: CHART.grid, strokeWidth: 1 }}
                content={<ChartTip format={format} labelFormat={formatDay} />}
              />
              <Line
                type="monotone"
                dataKey="v"
                name={label}
                stroke="rgba(57, 135, 229, 0.55)"
                strokeWidth={2}
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
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
