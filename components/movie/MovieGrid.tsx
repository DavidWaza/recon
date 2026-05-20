"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Movie } from "@/lib/types";
import { MovieCard } from "./MovieCard";

type MovieGridProps = {
  movies: Movie[];
  savedIds?: Set<number>;
  onToggleSave?: (id: number) => void;
  compact?: boolean;
};

export function MovieGrid({
  movies,
  savedIds,
  onToggleSave,
  compact,
}: MovieGridProps) {
  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence mode="popLayout">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isSaved={savedIds?.has(movie.id)}
            onToggleSave={onToggleSave}
            compact={compact}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
