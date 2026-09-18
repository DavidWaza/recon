import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's stock theme. Our shadow scale is
// custom (see app/globals.css), so without this `shadow-glow` would be read
// as a shadow *colour* and `shadow-none` could never override it.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["card", "pop", "glow"],
    },
  },
});

/**
 * The one helper every component needs. Later classes win by Tailwind
 * semantics, so a caller passing `py-2` genuinely replaces a default `py-6`
 * instead of both landing in the class list and fighting over specificity.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
