"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { savePreferences } from "@/services/preferences";
import { allGenres } from "@/lib/data/movies";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

type PreferenceQuizProps = {
  /** Subscriber row id returned from /api/subscribe. */
  subscriberId: string;
  onClose: () => void;
};

type Step = 0 | 1 | 2;

/**
 * Signup preference quiz (guide Phase 1.2).
 *
 * Skippable, lightweight, and aligned to the `preferences` table columns
 * (favorite_genres, disliked_genres, liked_movies). Even rough data here is
 * what later powers personalization, so we keep it optional to protect signup
 * conversion.
 *
 * Layout: bottom sheet on phones (header and actions pinned, genre list
 * scrolls between them), centred dialog from `sm` up.
 */
export function PreferenceQuiz({ subscriberId, onClose }: PreferenceQuizProps) {
  const [step, setStep] = useState<Step>(0);
  const [favorite, setFavorite] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [loved, setLoved] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const toggle = (
    value: string,
    list: string[],
    setList: (next: string[]) => void,
  ) => {
    setList(
      list.includes(value)
        ? list.filter((g) => g !== value)
        : [...list, value],
    );
  };

  const submit = async () => {
    setSaving(true);
    try {
      await savePreferences({
        subscriberId,
        favoriteGenres: favorite,
        dislikedGenres: disliked,
        likedMovies: loved
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
      });
      toast.success("Saved! Your Friday picks will be tuned to your taste.");
      onClose();
    } catch {
      // Don't trap the user if persistence fails — they're already subscribed.
      toast.error("Couldn't save your preferences, but you're still subscribed.");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      title: "Which genres do you love?",
      subtitle: "Pick as many as you like — this shapes your picks.",
      body: (
        <GenreChips
          genres={allGenres}
          selected={favorite}
          onToggle={(g) => toggle(g, favorite, setFavorite)}
          tone="accent"
        />
      ),
    },
    {
      title: "Any genres to avoid?",
      subtitle: "Optional — we'll keep these out of your inbox.",
      body: (
        <GenreChips
          genres={allGenres}
          selected={disliked}
          onToggle={(g) => toggle(g, disliked, setDisliked)}
          tone="danger"
        />
      ),
    },
    {
      title: "Name a few movies you love",
      subtitle: "Optional — separate with commas. Helps us read your taste.",
      body: (
        <Textarea
          value={loved}
          onChange={(e) => setLoved(e.target.value)}
          rows={3}
          aria-label="Movies you love"
          placeholder="e.g. Dune: Part Two, Parasite, Spider-Verse"
          className="resize-none"
        />
      ),
    },
  ];

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center sm:items-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-base-0/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Tell us your taste"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", bounce: 0.12, duration: 0.45 }}
        className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-pop sm:max-h-[85dvh] sm:rounded-3xl"
      >
        {/* Header — pinned */}
        <div className="shrink-0 px-5 pt-3 sm:px-8 sm:pt-7">
          <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-base-500 sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-500">
              You&apos;re in · Step {step + 1} of {steps.length}
            </p>
            <Button color="secondary" variant="ghost" size="xs" onClick={onClose} className="-mr-2">
              Skip
            </Button>
          </div>

          <div className="mt-3 flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  i <= step ? "bg-accent-500" : "bg-base-400",
                )}
              />
            ))}
          </div>
        </div>

        {/* Body — the only part that scrolls */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-2 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <h2 className="mt-5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {current.title}
              </h2>
              <p className="mt-1.5 text-sm text-muted">{current.subtitle}</p>
              <div className="mt-5">{current.body}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions — pinned, thumb-reachable */}
        <div className="pb-safe flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface px-5 pt-4 sm:px-8 sm:pb-7">
          <Button
            color="secondary"
            variant="ghost"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0}
            className="disabled:opacity-0"
          >
            <Icon name="arrow-left" />
            Back
          </Button>

          {isLast ? (
            <Button loading={saving} onClick={submit}>
              Save my taste
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => (s + 1) as Step)}>
              Continue
              <Icon name="arrow-right" />
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function GenreChips({
  genres,
  selected,
  onToggle,
  tone,
}: {
  genres: string[];
  selected: string[];
  onToggle: (genre: string) => void;
  tone: "accent" | "danger";
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => {
        const active = selected.includes(genre);
        return (
          <button
            key={genre}
            type="button"
            onClick={() => onToggle(genre)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-200",
              active
                ? tone === "accent"
                  ? "border-accent-500 bg-accent-500 text-base-950"
                  : "border-red-150 bg-red-50 text-red-500"
                : "border-border bg-base-100 text-muted hover:border-border-strong hover:text-foreground",
            )}
          >
            {active && (
              <Icon name={tone === "accent" ? "check" : "close"} className="size-3.5" weight={2.5} />
            )}
            {genre}
          </button>
        );
      })}
    </div>
  );
}
