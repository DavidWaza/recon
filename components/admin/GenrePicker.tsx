"use client";

import { useMemo, useState } from "react";
import { GENRE_OPTIONS } from "@/lib/data/genres";

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
    <div className="space-y-3">
      {/* Selected */}
      {selected.length > 0 && (
        <div className="rounded-xl border border-[#E50914]/30 bg-[#E50914]/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E50914]">
              Selected ({selected.length})
            </p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[11px] text-[#a3a3a3] transition-colors hover:text-white"
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
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E50914] px-3 py-1 text-xs font-medium text-white ring-1 ring-[#E50914]"
              >
                {genre}
                <span aria-hidden className="text-white/70">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search genres… e.g. korean, whodunnit, noir"
        className="w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-2.5 text-sm text-white placeholder:text-[#666] focus:border-[#E50914]/50 focus:outline-none focus:ring-1 focus:ring-[#E50914]/20"
      />

      {/* Quick picks */}
      {showQuick && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
            Quick picks
          </p>
          <div className="flex flex-wrap gap-2">
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
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#7a7a7a]">
          {query.trim()
            ? `${filtered.length} match${filtered.length !== 1 ? "es" : ""}`
            : `All genres (${GENRE_OPTIONS.length})`}
        </p>
        <div className="max-h-44 overflow-y-auto rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-3">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-[#666]">
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

      <p className="text-[11px] text-[#7a7a7a]">
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
      className={[
        "rounded-full px-3 py-1 text-xs font-medium transition-all",
        active
          ? "bg-white/15 text-white ring-1 ring-white/40"
          : "bg-[#1a1a1a] text-[#a3a3a3] ring-1 ring-[#2a2a2a] hover:text-white hover:ring-[#444]",
      ].join(" ")}
    >
      {genre}
    </button>
  );
}
