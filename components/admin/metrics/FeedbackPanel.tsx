"use client";

import { useState } from "react";
import type { FeedbackNote, FeedbackSummary } from "@/lib/metrics/types";
import { CHART } from "./chart-kit";

const PREVIEW_CHARS = 180;
const COLLAPSED_COUNT = 4;

function relativeDay(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="whitespace-nowrap text-xs" title={`${rating} out of 5`}>
      <span aria-hidden style={{ color: CHART.series[2] }}>
        {"★".repeat(rating)}
      </span>
      <span aria-hidden className="text-muted">
        {"★".repeat(5 - rating)}
      </span>
      <span className="sr-only">{rating} out of 5</span>
    </span>
  );
}

function Note({ note }: { note: FeedbackNote }) {
  const [open, setOpen] = useState(false);
  const isLong = note.message.length > PREVIEW_CHARS;
  const shown = open || !isLong ? note.message : `${note.message.slice(0, PREVIEW_CHARS)}…`;

  return (
    <li className="border-b border-border/50 py-3 last:border-b-0">
      <div className="mb-1 flex items-center gap-2">
        {note.rating !== null && <Stars rating={note.rating} />}
        <span className="text-[11px] text-muted">{relativeDay(note.createdAt)}</span>
        {note.email && (
          <span className="truncate text-[11px] text-muted" title={note.email}>
            · {note.email}
          </span>
        )}
      </div>
      {/* Untrusted input: rendered as text, never as markup. */}
      <p className="whitespace-pre-wrap break-words text-sm text-foreground">{shown}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
        >
          {open ? "Less" : "More"}
        </button>
      )}
    </li>
  );
}

export function FeedbackPanel({ data }: { data: FeedbackSummary }) {
  const [expanded, setExpanded] = useState(false);
  const maxCount = Math.max(1, ...data.ratingCounts.map((r) => r.count));
  const notes = expanded ? data.recent : data.recent.slice(0, COLLAPSED_COUNT);
  const hasMore = data.recent.length > COLLAPSED_COUNT;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total" value={String(data.total)} />
        <Stat label="Last 30 days" value={String(data.last30d)} />
        <Stat label="Unread" value={String(data.unread)} />
        <Stat
          label="Avg rating"
          value={data.avgRating === null ? "—" : `${data.avgRating.toFixed(1)}/5`}
        />
      </div>

      {data.avgRating !== null && (
        <div className="mt-4 space-y-1">
          {[...data.ratingCounts].reverse().map((r) => (
            <div key={r.rating} className="flex items-center gap-2">
              <span className="w-3 text-right text-[11px] tabular-nums text-muted">
                {r.rating}
              </span>
              <span aria-hidden className="text-[11px]" style={{ color: CHART.series[2] }}>
                ★
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(r.count / maxCount) * 100}%`,
                    background: CHART.series[0],
                  }}
                />
              </div>
              <span className="w-6 text-right text-[11px] tabular-nums text-muted">
                {r.count}
              </span>
            </div>
          ))}
        </div>
      )}

      <ul
        className={`mt-3 ${expanded ? "max-h-96 overflow-y-auto pr-1" : ""}`}
      >
        {notes.map((note) => (
          <Note key={note.id} note={note} />
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full rounded-md border border-border py-1.5 text-xs text-muted transition-colors hover:text-foreground"
        >
          {expanded
            ? "Show less"
            : `Show ${data.recent.length - COLLAPSED_COUNT} more`}
        </button>
      )}

      {data.total > data.recent.length && (
        <p className="mt-2 text-center text-[11px] text-muted">
          Showing the {data.recent.length} most recent of {data.total}.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}
