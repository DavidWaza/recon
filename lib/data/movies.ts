import type { Movie } from "@/lib/types";

const TMDB = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";

/** Build a wide hero backdrop from poster when no dedicated backdrop exists */
function backdropFromPoster(posterUrl: string) {
  const file = posterUrl.split("/").pop() ?? "";
  return `${TMDB_BACKDROP}/${file}`;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Inception",
    imdbRating: 8.8,
    genre: ["Sci-Fi", "Thriller"],
    description:
      "A thief who enters dreams to steal secrets faces his most dangerous job yet—planting an idea instead of stealing one.",
    poster: `${TMDB}/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg`,
    backdrop: `${TMDB_BACKDROP}/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg`,
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    watchUrl: "https://www.netflix.com",
    year: 2010,
    isNewThisWeek: true,
  },
  {
    id: 2,
    title: "The Dark Knight",
    imdbRating: 9.0,
    genre: ["Action", "Crime"],
    description:
      "Batman faces the Joker, a criminal mastermind who plunges Gotham into anarchy and tests the hero's moral limits.",
    poster: `${TMDB}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`,
    backdrop: backdropFromPoster(`${TMDB}/qJ2tW6WMUDux911r6m7haRef0WH.jpg`),
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    watchUrl: "https://www.netflix.com",
    year: 2008,
    isNewThisWeek: true,
  },
  {
    id: 3,
    title: "Parasite",
    imdbRating: 8.5,
    genre: ["Drama", "Thriller"],
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    poster: `${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
    backdrop: backdropFromPoster(`${TMDB}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`),
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
    watchUrl: "https://www.netflix.com",
    year: 2019,
    isNewThisWeek: true,
  },
  {
    id: 4,
    title: "Interstellar",
    imdbRating: 8.7,
    genre: ["Sci-Fi", "Adventure"],
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: `${TMDB}/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg`,
    backdrop: `${TMDB_BACKDROP}/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg`,
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    watchUrl: "https://www.netflix.com",
    year: 2014,
    isNewThisWeek: false,
  },
  {
    id: 5,
    title: "Pulp Fiction",
    imdbRating: 8.9,
    genre: ["Crime", "Drama"],
    description:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    poster: `${TMDB}/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg`,
    backdrop: backdropFromPoster(`${TMDB}/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg`),
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    watchUrl: "https://www.netflix.com",
    year: 1994,
    isNewThisWeek: false,
  },
  {
    id: 6,
    title: "The Shawshank Redemption",
    imdbRating: 9.3,
    genre: ["Drama"],
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    poster: `${TMDB}/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg`,
    backdrop: backdropFromPoster(`${TMDB}/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg`),
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=NmzuHssWmSE",
    watchUrl: "https://www.netflix.com",
    year: 1994,
    isNewThisWeek: false,
  },
  {
    id: 7,
    title: "Whiplash",
    imdbRating: 8.5,
    genre: ["Drama", "Music"],
    description:
      "A promising young drummer enrolls at a cut-throat music conservatory where his dreams are mentored by an instructor who will stop at nothing.",
    poster: `${TMDB}/3E53WEZJqP6aM84D8CckXx4pIHw.jpg`,
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=7d_jQycdQGo",
    watchUrl: "https://www.netflix.com",
    year: 2014,
    isNewThisWeek: true,
  },
  {
    id: 8,
    title: "The Social Network",
    imdbRating: 7.8,
    genre: ["Drama", "Biography"],
    description:
      "As Harvard student Mark Zuckerberg creates the social networking site that would become Facebook, he is sued by the twins who claimed he stole their idea.",
    poster: `${TMDB}/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg`,
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=lB95KLmpLR4",
    watchUrl: "https://www.netflix.com",
    year: 2010,
    isNewThisWeek: false,
  },
  {
    id: 9,
    title: "Knives Out",
    imdbRating: 7.9,
    genre: ["Mystery", "Comedy"],
    description:
      "A detective investigates the death of a patriarch of an eccentric, combative family.",
    poster: `${TMDB}/pThyQovXQrw2m0s9x82twj48Jq4.jpg`,
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=qGqiHJTsRyk",
    watchUrl: "https://www.netflix.com",
    year: 2019,
    isNewThisWeek: true,
  },
  {
    id: 10,
    title: "Arrival",
    imdbRating: 7.9,
    genre: ["Sci-Fi", "Drama"],
    description:
      "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
    poster: `${TMDB}/279PwJAcelI4VuBtdzrZASqDPQr.jpg`,
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=tFMo3LJ8B4g",
    watchUrl: "https://www.netflix.com",
    year: 2016,
    isNewThisWeek: false,
  },
];

export const weeklyPicks = movies.filter((m) => m.isNewThisWeek);
export const trendingPicks = [...movies].sort(
  (a, b) => b.imdbRating - a.imdbRating
);
export const previewMovies = movies.slice(0, 8);
export const heroPreviewMovies = movies.slice(0, 3);
/** Full-bleed hero carousel (StreamVid-style backdrop slides) */
export const heroCarouselMovies = movies.slice(0, 6);

export const allGenres = Array.from(
  new Set(movies.flatMap((m) => m.genre))
).sort();
