"use client";

import { useState, type ReactNode } from "react";

// Palette validated against the card surface (#11162a) with the dataviz
// checks: lightness band, chroma floor, CVD separation, contrast.
export const CHART = {
  series: ["#3987e5", "#199e70", "#c98500", "#008300"],
  ordinal: ["#3987e5", "#256abf", "#184f95"],
  grid: "#262c49",
  axis: "#a1a1aa",
  surface: "#11162a",
  up: "#22c55e",
  down: "#f87171",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDay(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}

export const compact = (n: number): string =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export const ngn = (n: number): string => `₦${compact(n)}`;

export const pct1 = (x: number): string => `${(x * 100).toFixed(1)}%`;

export const pp1 = (x: number): string => `${(x * 100).toFixed(1)} pp`;

interface TipEntry {
  name?: string | number;
  value?: number | string | Array<number | string>;
  color?: string;
  dataKey?: string | number;
}

interface ChartTipProps {
  active?: boolean;
  payload?: TipEntry[];
  label?: string | number;
  format?: (v: number) => string;
  labelFormat?: (label: string) => string;
}

// One tooltip for every chart: value leads, series name follows, keyed by a
// short stroke of the series color. Names render via React text (escaped).
export function ChartTip({ active, payload, label, format, labelFormat }: ChartTipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const fmt = format ?? ((v: number) => compact(v));
  const heading =
    typeof label === "string" && labelFormat ? labelFormat(label) : label;
  return (
    <div className="rounded-lg border border-border bg-[#1b2140] px-3 py-2 text-xs shadow-lg">
      {heading != null && heading !== "" && (
        <div className="mb-1 text-muted">{heading}</div>
      )}
      {payload.map((entry) => (
        <div key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2 py-0.5">
          <span
            aria-hidden
            className="inline-block h-0.5 w-3 rounded-full"
            style={{ background: entry.color ?? CHART.series[0] }}
          />
          <span className="font-semibold text-foreground tabular-nums">
            {typeof entry.value === "number" ? fmt(entry.value) : String(entry.value)}
          </span>
          {entry.name != null && <span className="text-muted">{String(entry.name)}</span>}
        </div>
      ))}
    </div>
  );
}

export interface TableSpec {
  columns: string[];
  rows: Array<Array<string | number>>;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  table?: TableSpec;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}

// Card shell with the accessible twin: every chart can flip to its data table.
export function ChartCard({ title, subtitle, table, badge, className, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {badge}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            {showTable ? "Chart" : "Data"}
          </button>
        )}
      </div>
      {showTable && table ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                {table.columns.map((col, i) => (
                  <th key={col} className={`py-1.5 pr-3 font-medium ${i > 0 ? "text-right" : ""}`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {table.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`py-1.5 pr-3 ${ci > 0 ? "text-right" : "text-foreground"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function SourceBadge({ source }: { source: "live" | "sample" }) {
  if (source === "live") return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Sample data
    </span>
  );
}
