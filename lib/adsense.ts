/** Public AdSense publisher ID (safe to expose in client code). */
export const ADSENSE_CLIENT = "ca-pub-7801685874493098";

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/**
 * Optional display-ad slot IDs from the AdSense dashboard.
 * Create ad units at https://adsense.google.com → Ads → By ad unit,
 * then paste each slot ID here or in env (env wins).
 */
export const ADSENSE_SLOTS = {
  /** Mid-page: after featured picks, before “How it works”. */
  homeMid:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID ??
    process.env.NEXT_PUBLIC_ADSENSE_SLOT ??
    "",
  /** Lower page: after FAQ, before footer. */
  homeFooter: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FOOTER ?? "",
} as const;
