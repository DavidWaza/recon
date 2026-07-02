"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdBannerProps = {
  /** Ad unit slot ID from the AdSense dashboard. */
  slot: string;
  className?: string;
};

/**
 * Responsive display ad unit. Renders nothing until a slot ID is configured.
 * Pair with <AdSenseScript /> in the root layout.
 */
export function AdBanner({ slot, className = "" }: AdBannerProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("[AdSense] failed to load unit:", error);
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <aside
      className={`mx-auto w-full max-w-4xl px-6 ${className}`}
      aria-label="Advertisement"
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted/60">
          Sponsored
        </p>
        <ins
          className="adsbygoogle block min-h-[90px] w-full"
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
