import Script from "next/script";
import { ADSENSE_SCRIPT_SRC } from "@/lib/adsense";

/** Loads the AdSense library site-wide (required for auto ads and display units). */
export function AdSenseScript() {
  return (
    <Script
      id="adsense-loader"
      async
      src={ADSENSE_SCRIPT_SRC}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
