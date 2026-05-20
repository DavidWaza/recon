import { LandingPage } from "@/components/landing/LandingPage";
import { supabaseAdmin } from "@/lib/supabase";
import {
  heroCarouselMovies as defaultHeroCarouselMovies,
  heroPreviewMovies as defaultHeroPreviewMovies,
} from "@/lib/data/movies";
import type { Movie } from "@/lib/types";

async function fetchLatestWeeklyPicks(): Promise<Movie[]> {
  const { data, error } = await supabaseAdmin
    .from("weekly_picks")
    .select(
      `id, title, description, genre, imdb_rating, poster_url, trailer_url, netflix_url, sent_at`,
    )
    .order("sent_at", { ascending: false })
    .order("id", { ascending: false });

  if (error || !data || data.length === 0) {
    return defaultHeroCarouselMovies;
  }

  const latestSentAt = data[0].sent_at;
  const latestPicks = data.filter((pick: any) => pick.sent_at === latestSentAt);

  if (latestPicks.length === 0) {
    return defaultHeroCarouselMovies;
  }

  return latestPicks
    .map((pick: any, index: number) => ({
      id: pick.id ?? index,
      title: pick.title,
      imdbRating: Number(pick.imdb_rating) || 0,
      genre: typeof pick.genre === "string" ? pick.genre.split(",").map((g: string) => g.trim()) : [],
      description: pick.description ?? "",
      poster: pick.poster_url ?? "",
      backdrop: pick.poster_url ?? "",
      netflixAvailable: Boolean(pick.netflix_url),
      trailerUrl: pick.trailer_url ?? undefined,
      watchUrl: pick.netflix_url ?? undefined,
      year: undefined,
    }))
    .filter((movie) => movie.poster && movie.title);
}

export default async function Home() {
  const latestPicks = await fetchLatestWeeklyPicks();
  const heroCarouselMovies = latestPicks.slice(0, 6);
  const heroPreviewMovies = latestPicks.slice(0, 3);

  return (
    <LandingPage
      heroCarouselMovies={heroCarouselMovies.length ? heroCarouselMovies : defaultHeroCarouselMovies}
      heroPreviewMovies={heroPreviewMovies.length ? heroPreviewMovies : defaultHeroPreviewMovies}
    />
  );
}
