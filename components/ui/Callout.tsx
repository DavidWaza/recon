import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { TONE_PALETTE, type Tone } from "@/lib/tone";
import { Icon, type IconName } from "./Icon";

const TONE_ICON: Record<Tone, IconName> = {
  neutral: "info",
  info: "info",
  pending: "info",
  attention: "warning",
  success: "check-circle",
  danger: "x-circle",
};

type CalloutProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
};

/** An inline, toned message block. Children are the message — compose freely. */
export function Callout({ tone = "info", className, children, ...props }: CalloutProps) {
  const t = TONE_PALETTE[tone];
  return (
    <div
      data-slot="callout"
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm leading-relaxed",
        t.bg,
        t.bd,
        className,
      )}
      {...props}
    >
      <Icon name={TONE_ICON[tone]} className={cn("mt-px size-5", t.fg)} />
      <div className="min-w-0 flex-1 text-foreground">{children}</div>
    </div>
  );
}
