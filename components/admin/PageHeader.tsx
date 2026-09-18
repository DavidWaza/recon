import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Page header parts. Actions stack under the title on phones and move to the
 * right from `md` up — via `has-data-[slot=page-actions]`, not a prop.
 */
export function PageHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "mb-6 grid gap-4 sm:mb-8",
        "md:has-data-[slot=page-actions]:grid-cols-[1fr_auto] md:has-data-[slot=page-actions]:items-end",
        className,
      )}
      {...props}
    />
  );
}

export function PageHeading({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="page-heading" className={cn("min-w-0", className)} {...props} />;
}

export function PageEyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="page-eyebrow"
      className={cn(
        "mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-500",
        className,
      )}
      {...props}
    />
  );
}

export function PageTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      data-slot="page-title"
      className={cn("text-2xl font-bold tracking-tight text-foreground sm:text-3xl", className)}
      {...props}
    />
  );
}

export function PageDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="page-description"
      className={cn("mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-[15px]", className)}
      {...props}
    />
  );
}

export function PageActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="page-actions"
      className={cn("flex flex-wrap items-center gap-2 md:justify-end", className)}
      {...props}
    />
  );
}
