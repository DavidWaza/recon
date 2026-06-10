"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CTAButton } from "@/components/ui/CTAButton";
import { allGenres } from "@/lib/data/movies";
import {
  getPreferences,
  savePreferences,
  type PreferenceSelection,
} from "@/services/preferences";

type Phase = "loading" | "identify" | "form" | "done";

type Identity = { token?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PreferencesClient({
  initialToken,
}: {
  initialToken: string | null;
}) {
  const [phase, setPhase] = useState<Phase>(
    initialToken ? "loading" : "identify",
  );
  const [identity, setIdentity] = useState<Identity>(
    initialToken ? { token: initialToken } : {},
  );
  const [emailInput, setEmailInput] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const [favorite, setFavorite] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [loved, setLoved] = useState("");

  const applyPrefs = (prefs: PreferenceSelection | null) => {
    setFavorite(prefs?.favoriteGenres ?? []);
    setDisliked(prefs?.dislikedGenres ?? []);
    setLoved((prefs?.likedMovies ?? []).join(", "));
  };

  // Resolve a token from the email link on first load. setState runs after the
  // await (asynchronously), and a cancel flag guards against unmount.
  useEffect(() => {
    if (!initialToken) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await getPreferences({ token: initialToken });
        if (cancelled) return;
        if (res.found) {
          applyPrefs(res.preferences);
          setIdentity({ token: initialToken });
          setPhase("form");
          return;
        }
      } catch {
        // fall through to email entry
      }
      if (cancelled) return;
      toast.error("That link didn't work — enter your email to continue.");
      setPhase("identify");
    })();

    return () => {
      cancelled = true;
    };
  }, [initialToken]);

  const identifyByEmail = async () => {
    const email = emailInput.trim();
    if (!EMAIL_RE.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    setIdentifying(true);
    try {
      const res = await getPreferences({ email });
      if (!res.found) {
        toast.error("We couldn't find that email. Subscribe first, then come back.");
        return;
      }
      applyPrefs(res.preferences);
      setIdentity({ email });
      setPhase("form");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIdentifying(false);
    }
  };

  const toggle = (
    value: string,
    list: string[],
    setList: (next: string[]) => void,
  ) => {
    setList(
      list.includes(value) ? list.filter((g) => g !== value) : [...list, value],
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await savePreferences({
        ...identity,
        favoriteGenres: favorite,
        dislikedGenres: disliked,
        likedMovies: loved
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
      });
      setPhase("done");
    } catch {
      toast.error("Couldn't save your preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
            Recon
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Your movie preferences
          </h1>
          <p className="mt-2 text-sm text-muted">
            Tell us what you love and your Friday picks get sharper every week.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card p-7 shadow-2xl sm:p-8">
          {phase === "loading" && (
            <p className="py-10 text-center text-sm text-muted">
              Loading your preferences…
            </p>
          )}

          {phase === "identify" && (
            <div>
              <label className="block text-sm font-semibold text-white">
                What email did you subscribe with?
              </label>
              <p className="mt-1 text-xs text-muted">
                We&apos;ll pull up your preferences so you can update them.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void identifyByEmail();
                  }}
                  placeholder="you@email.com"
                  className="flex-1 rounded-xl border border-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <CTAButton size="md" loading={identifying} onClick={identifyByEmail}>
                  Continue
                </CTAButton>
              </div>
              <p className="mt-5 text-center text-xs text-muted">
                Not subscribed yet?{" "}
                <Link href="/#subscribe" className="text-accent hover:underline">
                  Join the newsletter
                </Link>
              </p>
            </div>
          )}

          {phase === "form" && (
            <div className="space-y-7">
              <Section
                title="Which genres do you love?"
                subtitle="Pick as many as you like — this shapes your picks."
              >
                <GenreChips
                  genres={allGenres}
                  selected={favorite}
                  onToggle={(g) => toggle(g, favorite, setFavorite)}
                  tone="accent"
                />
              </Section>

              <Section
                title="Any genres to avoid?"
                subtitle="Optional — we'll keep these out of your inbox."
              >
                <GenreChips
                  genres={allGenres}
                  selected={disliked}
                  onToggle={(g) => toggle(g, disliked, setDisliked)}
                  tone="muted"
                />
              </Section>

              <Section
                title="Name a few movies you love"
                subtitle="Optional — separate with commas. Helps us read your taste."
              >
                <textarea
                  value={loved}
                  onChange={(e) => setLoved(e.target.value)}
                  rows={3}
                  placeholder="e.g. Dune: Part Two, Parasite, Spider-Verse"
                  className="w-full resize-none rounded-xl border border-border bg-black/40 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </Section>

              <CTAButton size="lg" fullWidth loading={saving} onClick={save}>
                Save my preferences
              </CTAButton>
            </div>
          )}

          {phase === "done" && (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-2xl">
                ✓
              </div>
              <h2 className="text-xl font-bold text-white">Preferences saved</h2>
              <p className="mt-2 text-sm text-muted">
                Your next Friday picks will be tuned to your taste.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPhase("form")}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Edit again
                </button>
                <Link href="/" className="text-sm text-muted hover:text-white">
                  Back to Recon
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
      <div className="mt-3">{children}</div>
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
