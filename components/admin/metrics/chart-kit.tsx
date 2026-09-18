"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

// Series palette validated against the card surface with the dataviz checks:
// lightness band, chroma floor, CVD separation, contrast. Neutrals track the
// base ramp in app/globals.css.
export const CHART = {
  series: ["#3987e5", "#199e70", "#c98500", "#008300"],
  ordinal: ["#3987e5", "#256abf", "#184f95"],
  grid: "#1f2645",
  axis: "#9aa3c8",
  surface: "#0e1224",
  up: "#22c55e",
  down: "#f05252",
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
    <div className="rounded-lg border border-border-strong bg-base-100 px-3 py-2 text-xs shadow-pop">
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

/**
 * An assembled default over the Card parts: every chart can flip to its
 * data table (the accessible twin). Screens needing a different arrangement
 * compose Card/CardHeader/CardAction directly.
 */
export function ChartCard({ title, subtitle, table, badge, className, children }: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>
          {title}
          {badge}
        </CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
        {table && (
          <CardAction>
            <Button
              color="secondary"
              variant="outline"
              size="xs"
              onClick={() => setShowTable((v) => !v)}
              aria-pressed={showTable}
              className="h-8"
            >
              <Icon name={showTable ? "chart" : "table"} className="size-3.5" />
              {showTable ? "Chart" : "Data"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="min-w-0">
        {showTable && table ? (
          <Table className="text-xs">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {table.columns.map((col, i) => (
                  <TableHead key={col} className={i > 0 ? "text-right" : ""}>
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((row, ri) => (
                <TableRow key={ri}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci} className={ci > 0 ? "text-right" : "text-foreground"}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/** Data provenance goes through the status registry, like every other state. */
export function SourceBadge({ source }: { source: "live" | "sample" }) {
  if (source === "live") return null;
  return <StatusBadge status={source} size="sm" />;
}
