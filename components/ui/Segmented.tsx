"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/utils";

type SegmentedProps<T extends string | number> = {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  "aria-label": string;
  className?: string;
};

/**
 * A single-choice control for filters like a date range. On a phone it's a
 * full-width track so every segment is a comfortable tap target; from `sm`
 * up it shrinks to fit its content.
 */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
  ...aria
}: SegmentedProps<T>) {
  const layoutId = useId();
  return (
    <div
      data-slot="segmented"
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn(
        "grid w-full auto-cols-fr grid-flow-col gap-1 rounded-full border border-border bg-surface p-1 sm:inline-grid sm:w-auto",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative h-9 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium transition-colors",
              active ? "text-base-950" : "text-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className="absolute inset-0 rounded-full bg-accent-500 shadow-glow"
                transition={{ type: "spring", bounce: 0.18, duration: 0.45 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
