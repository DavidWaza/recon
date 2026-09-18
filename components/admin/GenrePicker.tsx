"use client";

import { useMemo, useState } from "react";
import { GENRE_OPTIONS } from "@/lib/data/genres";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

/** Shown when search is empty — common picks to tap quickly. */
const QUICK_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Psychological Thriller",
  "Dark Comedy",
  "Korean",
  "Dystopian",
  "Whodunnit",
] as const;

function parseGenres(raw: string) {
  return raw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

function joinGenres(genres: string[]) {
  return genres.join(", ");
}

type GenrePickerProps = {
  /** Comma-separated genre string (stored on each pick). */
  value: string;
  onChange: (value: string) => void;
};

export function GenrePicker({ value, onChange }: GenrePickerProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => parseGenres(value), [value]);

  const toggle = (genre: string) => {
    const next = selected.includes(genre)
      ? selected.filter((g) => g !== genre)
      : [...selected, genre];
    onChange(joinGenres(next));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...GENRE_OPTIONS];
    return GENRE_OPTIONS.filter((g) => g.toLowerCase().includes(q));
  }, [query]);

  const showQuick = !query.trim();

  return (
    <div className="min-w-0 space-y-3">
      {/* Selected */}
      {selected.length > 0 && (
        <div className="rounded-xl border border-accent-150 bg-accent-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-500">
              Selected ({selected.length})
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="-my-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-base-100 hover:text-foreground"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggle(genre)}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-accent-500 pl-3 pr-2 text-xs font-semibold text-base-950 shadow-glow transition-colors hover:bg-accent-600"
              >
                {genre}
                <Icon name="close" className="size-3.5 opacity-80" weight={2.25} />
                <span className="sr-only">Remove</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search genres… korean, whodunnit, noir"
          aria-label="Search genres"
          className="pl-10"
        />
      </div>

      {/* Quick picks — one swipeable row on phones, wraps from sm up. */}
      {showQuick && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
            Quick picks
          </p>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {QUICK_GENRES.map((genre) => (
              <GenreChip
                key={genre}
                genre={genre}
                active={selected.includes(genre)}
                onClick={() => toggle(genre)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All / filtered */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">
          {query.trim()
            ? `${filtered.length} match${filtered.length !== 1 ? "es" : ""}`
            : `All genres (${GENRE_OPTIONS.length})`}
        </p>
        <div className="max-h-52 overflow-y-auto overscroll-contain rounded-xl border border-border bg-surface-sunken p-3">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-subtle">
              No genres match &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filtered.map((genre) => (
                <GenreChip
                  key={genre}
                  genre={genre}
                  active={selected.includes(genre)}
                  onClick={() => toggle(genre)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-subtle">
        Tap to select · tap again to remove · pick as many as you like
      </p>
    </div>
  );
}

function GenreChip({
  genre,
  active,
  onClick,
}: {
  genre: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
        active
          ? "border-accent-500/60 bg-accent-50 text-foreground"
          : "border-border bg-base-100 text-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {active && <Icon name="check" className="size-3.5 text-accent-500" weight={2.5} />}
      {genre}
    </button>
  );
}
