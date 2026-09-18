"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button";
import { Icon } from "./Icon";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  /** Destructive actions get a red confirm button. */
  destructive?: boolean;
}

/**
 * Bottom sheet on phones (thumb-reachable actions, full width), centred modal
 * from `sm` up. Escape and backdrop close it unless a send is in flight.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Yes, send",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  destructive = false,
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-70 flex items-end justify-center sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            disabled={loading}
            onClick={loading ? undefined : onCancel}
            className="absolute inset-0 bg-base-0/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="pb-safe relative w-full max-w-md rounded-t-3xl border border-border bg-surface px-5 pt-3 shadow-pop sm:rounded-3xl sm:p-7"
          >
            {/* Grab handle — signals "sheet" on touch devices. */}
            <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-500 sm:hidden" />

            <div
              className={
                destructive
                  ? "mb-4 flex size-11 items-center justify-center rounded-2xl border border-red-150 bg-red-50 text-red-500"
                  : "mb-4 flex size-11 items-center justify-center rounded-2xl border border-accent-150 bg-accent-50 text-accent-500"
              }
            >
              <Icon name={destructive ? "warning" : "send"} />
            </div>

            <h2 id="confirm-dialog-title" className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {title}
            </h2>
            <p id="confirm-dialog-description" className="mt-2 text-sm leading-relaxed text-muted">
              {description}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <Button color="secondary" variant="outline" onClick={onCancel} disabled={loading} className="sm:w-auto" block>
                {cancelLabel}
              </Button>
              <Button
                color={destructive ? "destructive" : "primary"}
                onClick={onConfirm}
                loading={loading}
                className="sm:w-auto"
                block
              >
                {loading ? "Sending…" : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
