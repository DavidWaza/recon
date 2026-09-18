import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { STATUS_REGISTRY, TONE_PALETTE, resolveStatus, type Tone } from "@/lib/tone";

export const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium tabular-nums",
  {
    variants: {
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
        lg: "h-7 px-3 text-[13px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    tone?: Tone;
    /** Leading status dot. */
    dot?: boolean;
  };

export function Badge({ tone = "neutral", dot, size, className, children, ...props }: BadgeProps) {
  const t = TONE_PALETTE[tone];
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      className={cn(badgeVariants({ size }), t.bg, t.bd, t.fg, className)}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", t.solid)} />}
      {children}
    </span>
  );
}

/**
 * Status rendering goes through one component (ARCHITECTURE.md §5.1).
 * Call sites pass the raw backend string; the resolver and registry decide
 * the label and tone. Unknown strings render nothing rather than "Unknown".
 */
export function StatusBadge({
  status,
  size,
  className,
}: {
  status: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const key = resolveStatus(status);
  if (!key) return null;
  const { label, tone } = STATUS_REGISTRY[key];
  return (
    <Badge tone={tone} size={size} dot className={className}>
      {label}
    </Badge>
  );
}
