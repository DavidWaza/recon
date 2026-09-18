"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { Segmented } from "@/components/ui/Segmented";

const WIDTHS = [
  { value: "phone", label: "Phone" },
  { value: "desktop", label: "Desktop" },
] as const;

type Width = (typeof WIDTHS)[number]["value"];

/**
 * Live email preview. The width toggle renders the iframe at a real phone
 * width, because most subscribers open Friday's email on a phone and the
 * desktop column hides layout bugs that only show at 375px.
 */
export function EmailPreview({ html, className }: { html: string; className?: string }) {
  const [width, setWidth] = useState<Width>("phone");

  return (
    <aside
      aria-label="Email preview"
      className={cn(
        "flex min-w-0 flex-col gap-3 lg:sticky lg:top-10 lg:max-h-[calc(100dvh-5rem)] lg:self-start",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
          </span>
          Live preview
        </p>
        <Segmented
          aria-label="Preview width"
          value={width}
          onChange={setWidth}
          options={WIDTHS}
          className="w-auto"
        />
      </div>

      <div className="relative flex min-h-0 flex-1 justify-center overflow-hidden rounded-3xl border border-border bg-base-0/60 p-2 shadow-card sm:p-3">
        <div
          className={cn(
            "flex h-[70dvh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-white transition-[max-width] duration-300 lg:h-[calc(100dvh-10rem)]",
            width === "phone" ? "max-w-[390px]" : "max-w-full",
          )}
        >
          {/* Fake inbox chrome so the preview reads as "an email", not a page. */}
          <div className="flex shrink-0 items-center gap-2 border-b border-base-400/20 bg-base-900 px-3 py-2">
            <span className="flex gap-1">
              <span className="size-2 rounded-full bg-red-500/70" />
              <span className="size-2 rounded-full bg-yellow-500/70" />
              <span className="size-2 rounded-full bg-green-500/70" />
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-[11px] font-medium text-base-0/60">
              <Icon name="inbox" className="size-3.5" />
              Recon · Inbox
            </span>
          </div>
          <iframe
            srcDoc={html}
            title="Email preview"
            className="min-h-0 w-full flex-1 border-0 bg-white"
          />
        </div>
      </div>
    </aside>
  );
}

/** Phone-only switch between the composer and its preview. Hidden from lg up. */
export function EditPreviewSwitch({
  value,
  onChange,
}: {
  value: "edit" | "preview";
  onChange: (v: "edit" | "preview") => void;
}) {
  return (
    <div className="sticky top-[calc(3.5rem+1px+env(safe-area-inset-top))] z-30 -mx-4 mb-4 border-b border-border bg-base-0/85 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
      <Segmented
        aria-label="Editor view"
        value={value}
        onChange={onChange}
        options={[
          { value: "edit", label: "Compose" },
          { value: "preview", label: "Preview" },
        ]}
      />
    </div>
  );
}
