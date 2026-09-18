"use client";

import type { HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Landing-page section rhythm in one place: phone padding first, stepping up
 * at sm/lg. Every marketing section used to hand-roll `py-28 px-6`, which on
 * a 375px screen wasted a third of the first viewport on whitespace.
 */
export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      data-slot="section"
      className={cn("relative scroll-mt-20 overflow-hidden py-16 sm:py-24 lg:py-28", className)}
      {...props}
    />
  );
}

export function SectionContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="section-container"
      className={cn("relative mx-auto max-w-6xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}

/** Eyebrow + title + lead, centred, with a one-shot reveal. */
export function SectionHeader({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("mx-auto mb-10 max-w-2xl text-center sm:mb-14", className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent-500 sm:text-[13px]">
        {eyebrow}
      </p>
      <h2 className="text-balance text-[1.875rem] font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {lead && (
        <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted sm:mt-5 sm:text-lg">
          {lead}
        </p>
      )}
    </motion.div>
  );
}

/** Hairline gradient divider across the top of a section. */
export function SectionRule({ position = "top" }: { position?: "top" | "bottom" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-accent-500/30 to-transparent",
        position === "top" ? "top-0" : "bottom-0",
      )}
    />
  );
}
