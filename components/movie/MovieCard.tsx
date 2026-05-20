"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Movie } from "@/lib/types";
import { RatingBadge } from "./RatingBadge";
import { GenreTag } from "./GenreTag";
import { CTAButton } from "@/components/ui/CTAButton";

type MovieCardProps = {
  movie: Movie;
  isSaved?: boolean;
  onToggleSave?: (id: number) => void;
  compact?: boolean;
};

export function MovieCard({
  movie,
  isSaved = false,
  onToggleSave,
  compact = false,
}: MovieCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl",
        "bg-card ring-1 ring-border backdrop-blur-sm",
        "hover:ring-accent/50 hover:shadow-xl hover:shadow-accent/10",
        compact ? "" : "h-full",
      ].join(" ")}
    >
      <div
        className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:bg-accent/10 pointer-events-none"
        aria-hidden
      />

      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={movie.poster}
          alt={`${movie.title} poster`}
          fill
          className="object-cover transition-transform duration-400 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <RatingBadge rating={movie.imdbRating} />
        </div>
        {movie.netflixAvailable && (
          <span className="absolute top-3 right-3 rounded-md bg-[#E50914]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-lg">
            Netflix
          </span>
        )}
        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(movie.id)}
            aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
            className={[
              "absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
              isSaved
                ? "bg-accent text-foreground"
                : "bg-background/80 text-foreground/80 hover:bg-background hover:text-foreground",
            ].join(" ")}
          >
            <BookmarkIcon filled={isSaved} />
          </button>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-foreground line-clamp-1">{movie.title}</h3>
          {movie.year && (
            <p className="mt-0.5 text-xs text-muted">{movie.year}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {movie.genre.slice(0, 3).map((g) => (
            <GenreTag key={g} genre={g} />
          ))}
        </div>

        {!compact && (
          <p className="text-sm text-muted line-clamp-2 leading-relaxed">
            {movie.description}
          </p>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <a
            href={movie.trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <CTAButton variant="secondary" size="sm" fullWidth type="button">
              Watch Trailer
            </CTAButton>
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  if (filled) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6 2a2 2 0 00-2 2v18l8-4.5L20 22V4a2 2 0 00-2-2H6z" />
      </svg>
    );
  }
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path d="M6 2a2 2 0 00-2 2v18l8-4.5L20 22V4a2 2 0 00-2-2H6z" />
    </svg>
  );
}
