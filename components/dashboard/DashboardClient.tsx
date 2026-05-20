"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { movies, weeklyPicks, trendingPicks, allGenres } from "@/lib/data/movies";
import type { SortOption, ViewMode } from "@/lib/types";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { MovieCardSkeleton } from "@/components/movie/MovieCardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sidebar } from "@/components/layout/Sidebar";

export type DashboardTab = "home" | "weekly" | "favorites" | "settings";

type DashboardClientProps = {
  initialTab?: DashboardTab;
};

export function DashboardClient({ initialTab = "home" }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 3]));
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const baseMovies = useMemo(() => {
    if (activeTab === "favorites") {
      return movies.filter((m) => favorites.has(m.id));
    }
    if (activeTab === "weekly") return weeklyPicks;
    if (viewMode === "weekly") return weeklyPicks;
    return trendingPicks;
  }, [activeTab, favorites, viewMode]);

  const filteredMovies = useMemo(() => {
    let result = [...baseMovies];
    if (genreFilter !== "all") {
      result = result.filter((m) => m.genre.includes(genreFilter));
    }
    if (sortBy === "rating-desc") {
      result.sort((a, b) => b.imdbRating - a.imdbRating);
    } else if (sortBy === "rating-asc") {
      result.sort((a, b) => a.imdbRating - b.imdbRating);
    } else {
      result.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    }
    return result;
  }, [baseMovies, genreFilter, sortBy]);

  const showFilters = activeTab !== "settings" && activeTab !== "favorites";

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <DashboardHeader activeTab={activeTab} favoritesCount={favorites.size} />

          {activeTab === "settings" ? (
            <SettingsPanel />
          ) : activeTab === "favorites" && filteredMovies.length === 0 ? (
            <EmptyState
              title="No favorites yet"
              description="Save movies from Weekly Picks to build your personal watchlist."
              actionLabel="Browse Weekly Picks"
              onAction={() => setActiveTab("weekly")}
            />
          ) : (
            <>
              {showFilters && (
                <FilterBar
                  genreFilter={genreFilter}
                  sortBy={sortBy}
                  viewMode={viewMode}
                  onGenreChange={setGenreFilter}
                  onSortChange={setSortBy}
                  onViewModeChange={setViewMode}
                  showViewToggle
                />
              )}

              {isLoading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <MovieCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredMovies.length === 0 ? (
                <EmptyState
                  title="No movies found"
                  description="Try adjusting your genre filter to see more picks."
                  icon="search"
                  actionLabel="Clear filters"
                  onAction={() => setGenreFilter("all")}
                />
              ) : (
                <MovieGrid
                  movies={filteredMovies}
                  savedIds={favorites}
                  onToggleSave={toggleFavorite}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardHeader({
  activeTab,
  favoritesCount,
}: {
  activeTab: DashboardTab;
  favoritesCount: number;
}) {
  const titles: Record<DashboardTab, { title: string; subtitle: string }> = {
    home: {
      title: "Welcome back",
      subtitle: "Your personalized movie hub",
    },
    weekly: {
      title: "Weekly Picks",
      subtitle: "Fresh curated movies — updated every Friday",
    },
    favorites: {
      title: "Favorites",
      subtitle: `${favoritesCount} saved ${favoritesCount === 1 ? "movie" : "movies"}`,
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your preferences",
    },
  };

  const { title, subtitle } = titles[activeTab];

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      <p className="mt-1 text-muted">{subtitle}</p>
    </motion.div>
  );
}

function FilterBar({
  genreFilter,
  sortBy,
  viewMode,
  onGenreChange,
  onSortChange,
  onViewModeChange,
  showViewToggle,
}: {
  genreFilter: string;
  sortBy: SortOption;
  viewMode: ViewMode;
  onGenreChange: (v: string) => void;
  onSortChange: (v: SortOption) => void;
  onViewModeChange: (v: ViewMode) => void;
  showViewToggle: boolean;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted">Genre</label>
        <select
          value={genreFilter}
          onChange={(e) => onGenreChange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-white focus:border-accent/50 focus:outline-none"
        >
          <option value="all">All genres</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <label className="ml-2 text-sm text-muted">Sort</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-white focus:border-accent/50 focus:outline-none"
        >
          <option value="rating-desc">IMDb rating (high → low)</option>
          <option value="rating-asc">IMDb rating (low → high)</option>
          <option value="newest">Newest first</option>
        </select>
      </div>

      {showViewToggle && (
        <div className="flex rounded-xl bg-card p-1 ring-1 ring-border">
          {(["weekly", "trending"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={[
                "rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all",
                viewMode === mode
                  ? "bg-accent text-white shadow"
                  : "text-muted hover:text-white",
              ].join(" ")}
            >
              {mode === "weekly" ? "This Week" : "Trending"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-white">Email preferences</h3>
        <p className="mt-1 text-sm text-muted">
          Receive weekly picks every Friday at 9:00 AM
        </p>
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-border bg-card accent-accent"
          />
          <span className="text-sm text-muted">Weekly newsletter</span>
        </label>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold text-white">Minimum rating</h3>
        <p className="mt-1 text-sm text-muted">Only show movies rated 7.0+</p>
        <input
          type="range"
          min={7}
          max={9}
          step={0.1}
          defaultValue={7}
          className="mt-4 w-full accent-accent"
        />
      </div>
    </div>
  );
}
