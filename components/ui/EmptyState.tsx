import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: IconName;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "heart",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center sm:px-8 sm:py-16",
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-base-100 text-muted">
        <Icon name={icon} className="size-7" weight={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      {actionLabel && onAction && (
        <Button color="secondary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/** A dashed placeholder for a chart or list that has no data yet. */
export function EmptyPanel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-panel"
      className={cn(
        "flex min-h-36 items-center justify-center rounded-xl border border-dashed border-border bg-base-0/40 p-5",
        className,
      )}
      {...props}
    >
      <p className="max-w-sm text-center text-xs leading-relaxed text-muted">{children}</p>
    </div>
  );
}
