"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { CTAButton } from "@/components/ui/CTAButton";
import { savePreferences } from "@/services/preferences";
import { allGenres } from "@/lib/data/movies";

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
 */
export function PreferenceQuiz({ subscriberId, onClose }: PreferenceQuizProps) {
  const [step, setStep] = useState<Step>(0);
  const [favorite, setFavorite] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [loved, setLoved] = useState("");
  const [saving, setSaving] = useState(false);

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
          tone="muted"
        />
      ),
    },
    {
      title: "Name a few movies you love",
      subtitle: "Optional — separate with commas. Helps us read your taste.",
      body: (
        <textarea
          value={loved}
          onChange={(e) => setLoved(e.target.value)}
          rows={3}
          placeholder="e.g. Dune: Part Two, Parasite, Spider-Verse"
          className="w-full resize-none rounded-xl border border-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      ),
    },
  ];

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
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
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-card p-7 shadow-2xl sm:p-8"
      >
        {/* Skip */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-xs font-medium text-muted transition-colors hover:text-white"
        >
          Skip
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          You&apos;re in · Step {step + 1} of {steps.length}
        </p>

        {/* Progress */}
        <div className="mt-3 flex gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={[
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-accent" : "bg-border",
              ].join(" ")}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              {current.title}
            </h2>
            <p className="mt-1.5 text-sm text-muted">{current.subtitle}</p>
            <div className="mt-5">{current.body}</div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0}
            className="text-sm font-medium text-muted transition-colors hover:text-white disabled:opacity-0"
          >
            ← Back
          </button>

          {isLast ? (
            <CTAButton size="md" loading={saving} onClick={submit}>
              Save my taste
            </CTAButton>
          ) : (
            <CTAButton
              size="md"
              onClick={() => setStep((s) => ((s + 1) as Step))}
            >
              Continue
            </CTAButton>
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
  tone: "accent" | "muted";
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
            className={[
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              active
                ? tone === "accent"
                  ? "bg-accent text-white ring-1 ring-accent"
                  : "bg-white/10 text-white ring-1 ring-white/30"
                : "bg-black/30 text-muted ring-1 ring-border hover:text-white hover:ring-white/20",
            ].join(" ")}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
