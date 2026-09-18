/**
 * Tones are semantic, not colours (ARCHITECTURE.md §5.1). A screen says
 * "this is pending", never "this is yellow" — so a design change to what
 * pending looks like is one edit here, not a grep across every screen.
 */
export type Tone =
  | "neutral"
  | "info"
  | "pending"
  | "attention"
  | "success"
  | "danger";

export interface ToneClasses {
  /** foreground text / icon */
  fg: string;
  /** tinted background */
  bg: string;
  /** border / ring */
  bd: string;
  /** solid dot or bar */
  solid: string;
}

export const TONE_PALETTE: Record<Tone, ToneClasses> = {
  neutral: {
    fg: "text-base-600",
    bg: "bg-base-100",
    bd: "border-base-400",
    solid: "bg-base-550",
  },
  info: {
    fg: "text-accent-500",
    bg: "bg-accent-50",
    bd: "border-accent-150",
    solid: "bg-accent-500",
  },
  pending: {
    fg: "text-yellow-500",
    bg: "bg-yellow-50",
    bd: "border-yellow-150",
    solid: "bg-yellow-500",
  },
  attention: {
    fg: "text-yellow-500",
    bg: "bg-yellow-50",
    bd: "border-yellow-500/50",
    solid: "bg-yellow-500",
  },
  success: {
    fg: "text-green-500",
    bg: "bg-green-50",
    bd: "border-green-150",
    solid: "bg-green-500",
  },
  danger: {
    fg: "text-red-500",
    bg: "bg-red-50",
    bd: "border-red-150",
    solid: "bg-red-500",
  },
};

/**
 * Canonical states → label + tone. The dashboard renders data sources, send
 * outcomes and feedback states; each gets exactly one look, defined here.
 */
export const STATUS_REGISTRY = {
  live: { label: "Live data", tone: "success" },
  sample: { label: "Sample data", tone: "attention" },
  sent: { label: "Sent", tone: "success" },
  partial: { label: "Partially sent", tone: "attention" },
  failed: { label: "Failed", tone: "danger" },
  sending: { label: "Sending", tone: "pending" },
  draft: { label: "Draft", tone: "neutral" },
  ready: { label: "Ready to send", tone: "info" },
} as const satisfies Record<string, { label: string; tone: Tone }>;

export type Status = keyof typeof STATUS_REGISTRY;

/**
 * Raw strings from the API or DB → canonical status. When a backend invents a
 * new spelling, add one alias line and every screen updates.
 */
const STATUS_ALIASES: Record<string, Status> = {
  demo: "sample",
  mock: "sample",
  success: "sent",
  delivered: "sent",
  error: "failed",
  in_progress: "sending",
  processing: "sending",
};

export function resolveStatus(raw: string | null | undefined): Status | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (key in STATUS_REGISTRY) return key as Status;
  return STATUS_ALIASES[key] ?? null;
}
