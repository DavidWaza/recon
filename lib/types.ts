export type Movie = {
  id: number;
  title: string;
  imdbRating: number;
  genre: string[];
  description: string;
  poster: string;
  /** Wide cinematic image for hero backgrounds (falls back to poster) */
  backdrop?: string;
  netflixAvailable: boolean;
  trailerUrl?: string;
  watchUrl?: string;
  year?: number;
  isNewThisWeek?: boolean;
};

export type SortOption = "rating-desc" | "rating-asc" | "newest";
export type ViewMode = "weekly" | "trending";
