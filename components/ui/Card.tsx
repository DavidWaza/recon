import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Card is a set of parts a screen arranges, not one component with a prop for
 * every arrangement (ARCHITECTURE.md §1). There is no `title` prop and no
 * `showFooter` — compose <CardHeader>/<CardFooter> or leave them out.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "surface-glow flex flex-col gap-4 rounded-2xl border border-border bg-surface py-4 text-foreground shadow-card sm:gap-5 sm:py-5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Restructures itself into title | action columns when a <CardAction> is
 * present — no prop, no JavaScript, just `has-data-[slot=card-action]`.
 */
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 px-4 sm:px-5",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-action]:gap-x-3",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 text-[15px] font-semibold leading-tight tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[13px] leading-relaxed text-muted", className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cn("px-4 sm:px-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex flex-wrap items-center gap-3 border-t border-border px-4 pt-4 sm:px-5",
        className,
      )}
      {...props}
    />
  );
}
