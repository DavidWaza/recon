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

/** Tracked feedback URL for a single recommendation (guide Phase 1.3). */
export function feedbackUrl(
  recommendationId: string | number,
  action: "up" | "down" | "saved",
) {
  return `${SITE_URL}/api/feedback?r=${encodeURIComponent(
    String(recommendationId),
  )}&a=${action}`;
}
