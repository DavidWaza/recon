"use client";

import { useEffect } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Yes, send",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-label="Close dialog"
        disabled={loading}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-7"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-bold text-white sm:text-xl"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mt-3 text-sm leading-relaxed text-muted"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/25 transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Sending…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
