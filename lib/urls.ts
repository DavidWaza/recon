/**
 * Client-safe URL helpers (no server-only deps like nodemailer).
 *
 * Importing these — rather than reaching into `lib/email.ts` — lets email
 * templates be imported into client components for live previews.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://recon.com.ng";

/** One-click unsubscribe URL (guide Phase 0.5). Never put the email in the URL. */
export function unsubscribeUrl(token: string) {
  return `${SITE_URL}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Click-tracking redirect for a trailer / watch link, so the metrics dashboard
 * can attribute the click to a weekly pick. Email cannot run JavaScript — a
 * redirect through our own domain is the only way to measure this.
 *
 * Falls back to the raw destination when there is no real `weekly_picks.id` to
 * attribute to (the admin preview and test sends use synthetic ids), because a
 * redirect that logs an unusable row just costs the reader a hop.
 */
export function trackedUrl(opts: {
  kind: "trailer" | "watch";
  destination: string;
  weeklyPickId?: string | number;
  subscriberId?: string;
}) {
  const { kind, destination, weeklyPickId, subscriberId } = opts;
  if (!weeklyPickId || !UUID_RE.test(String(weeklyPickId))) return destination;

  const params = new URLSearchParams({
    kind,
    wp: String(weeklyPickId),
    u: destination,
  });
  if (subscriberId) params.set("s", subscriberId);
  return `${SITE_URL}/api/track?${params.toString()}`;
}

/** Tracked feedback URL for a single recommendation (guide Phase 1.3). */
export function feedbackUrl(
  recommendationId: string | number,
  action: "up" | "down" | "saved",
) {
  return `${SITE_URL}/api/feedback?r=${encodeURIComponent(
    String(recommendationId),
  )}&a=${action}`;
}
