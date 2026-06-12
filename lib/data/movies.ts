import type { Movie } from "@/lib/types";
import { ALL_GENRES } from "./genres";

export const movies: Movie[] = [
  {
    id: 1,
    title: "Forgotten",
    imdbRating: 7.4,
    genre: ["Mystery", "Thriller", "Drama"],
    description:
      "After moving into a new home, Jin-seok witnesses his brother being kidnapped. When his brother returns 19 days later with no memory, Jin-seok begins to uncover a deeply disturbing truth.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779293269/rencom/forgotten_vyobdh.jpg",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779293269/rencom/forgotten_vyobdh.jpg",
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=ZeNEBxRDzuM",
    watchUrl: "https://www.netflix.com/title/80189019",
    year: 2017,
    isNewThisWeek: false,
  },
  {
    id: 2,
    title: "Smile 2",
    imdbRating: 6.7,
    genre: ["Horror", "Mystery", "Thriller"],
    description:
      "About to embark on a new world tour, global pop sensation Skye Riley begins experiencing increasingly terrifying and inexplicable events, forced to face her dark past before it spirals out of control.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779485788/ff095060bb7a4e874a02dd780b73af58_ccyr0q.jpg",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779485788/ff095060bb7a4e874a02dd780b73af58_ccyr0q.jpg",
    netflixAvailable: false,
    trailerUrl: "https://www.youtube.com/watch?v=WPm9g2HtOMc",
    watchUrl: "https://www.paramountplus.com/movies/smile-2/",
    year: 2024,
    isNewThisWeek: true,
  },
  {
    id: 3,
    title: "Bird Box",
    imdbRating: 6.6,
    genre: ["Thriller", "Horror", "Drama"],
    description:
      "A mother and her children must survive a mysterious force that drives people to deadly violence if seen.",
    poster:
      "https://image.tmdb.org/t/p/w500/rGfGfgL2pEPCfhIvqHXieXFn7gp.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/w1280/rGfGfgL2pEPCfhIvqHXieXFn7gp.jpg",
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=o2AsIXSh2xo",
    watchUrl: "https://www.netflix.com/title/80196789",
    year: 2018,
    isNewThisWeek: false,
  },
  {
    id: 4,
    title: "Dune: Part Two",
    imdbRating: 8.5,
    genre: ["Sci-Fi", "Action", "Adventure"],
    description:
      "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.",
    poster:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    netflixAvailable: false,
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    watchUrl: "https://www.max.com/movies/dune-part-two/",
    year: 2024,
    isNewThisWeek: false,
  },
  {
    id: 5,
    title: "Spider-Man: Into the Spider-Verse",
    imdbRating: 8.4,
    genre: ["Animation", "Action", "Adventure"],
    description:
      "Brooklyn teenager Miles Morales becomes Spider-Man and teams up with alternate universe versions of the web-slinger to stop a threat that could destroy all reality.",
    poster:
      "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    backdrop:
      "https://image.tmdb.org/t/p/w1280/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=tg52up16eq0",
    watchUrl: "https://www.netflix.com/title/81004016",
    year: 2018,
    isNewThisWeek: false,
  },
  {
    id: 6,
    title: "The RIP",
    imdbRating: 6.8,
    genre: ["Action", "Crime", "Thriller"],
    description:
      "A group of Miami cops discover a stash of millions in cash, leading to distrust and danger as outsiders learn about the massive seizure and everyone questions who they can rely on.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779485788/the-rip-movie-poster_wqu9ng.webp",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779485788/the-rip-movie-backdrop_jhjvqz.jpg",
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=QJT6qCBE2jQ",
    watchUrl: "https://www.netflix.com/title/81797921",
    year: 2026,
    isNewThisWeek: true,
  },
  {
    id: 7,
    title: "Mortal Kombat",
    imdbRating: 6.1,
    genre: ["Action", "Adventure", "Fantasy"],
    description:
      "MMA fighter Cole Young, unaware of his heritage, seeks out Earth's greatest champions to stand against the enemies of Outworld in a high-stakes battle for the universe.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486018/xGuOF1T3WmPsAcQEQJfnG7Ud9f8_kiiqb8.webp",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486018/xGuOF1T3WmPsAcQEQJfnG7Ud9f8_kiiqb8.webp",
    netflixAvailable: false,
    trailerUrl: "https://www.youtube.com/watch?v=tL6orNhbSVE",
    watchUrl: "https://www.max.com/movies/mortal-kombat/",
    year: 2021,
    isNewThisWeek: false,
  },
  {
    id: 8,
    title: "Scarface",
    imdbRating: 8.3,
    genre: ["Crime", "Drama"],
    description:
      "Cuban immigrant Tony Montana claws his way to the top of Miami's drug trade, but his insatiable greed and paranoia set him on a catastrophic path to destruction.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486018/iQ5ztdjvteGeboxtmRdXEChJOHh_nxxjd0.webp",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486018/iQ5ztdjvteGeboxtmRdXEChJOHh_nxxjd0.webp",
    netflixAvailable: false,
    trailerUrl: "https://www.youtube.com/watch?v=CF1FE5mGTdo",
    watchUrl: "https://www.amazon.com/Scarface-Al-Pacino/dp/B001ANYNLM",
    year: 1983,
    isNewThisWeek: false,
  },
  {
    id: 9,
    title: "Carry-On",
    imdbRating: 6.5,
    genre: ["Action", "Crime", "Thriller"],
    description:
      "A young TSA agent is blackmailed by a mysterious traveler into letting a dangerous package slip onto a Christmas Eve flight, forcing him to outsmart the threat before it's too late.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486017/AAAAQVthPYbc2c3ih7Nyy5Q2MF5_FoOhLwMQsjBREOtioR4WI8r0VHJZJ3BqnToMOBsq3RoN79ovtYD4DW3L1JHTH1i3J4owz7N0fnI-8c1_Z3cYJC9cqQc0ukFaOUD78QVNAwaVRsq72MpKqOAXO2fUuMw1hZkU83iCkUOABYeaX7HhewwOLfDg30W1WMakngy_fwh72l.jpg",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486017/AAAAQVthPYbc2c3ih7Nyy5Q2MF5_FoOhLwMQsjBREOtioR4WI8r0VHJZJ3BqnToMOBsq3RoN79ovtYD4DW3L1JHTH1i3J4owz7N0fnI-8c1_Z3cYJC9cqQc0ukFaOUD78QVNAwaVRsq72MpKqOAXO2fUuMw1hZkU83iCkUOABYeaX7HhewwOLfDg30W1WMakngy_fwh72l.jpg",
    netflixAvailable: true,
    trailerUrl: "https://www.youtube.com/watch?v=kD1XTCVRkCo",
    watchUrl: "https://www.netflix.com/title/81476963",
    year: 2024,
    isNewThisWeek: true,
  },
  {
    id: 10,
    title: "Caught Stealing",
    imdbRating: 6.9,
    genre: ["Action", "Comedy", "Crime"],
    description:
      "Burned-out ex-baseball player Hank Thompson finds himself hunted by dangerous gangsters in late 1990s New York City after agreeing to cat-sit for his neighbor — with no idea why everyone wants a piece of him.",
    poster:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486017/qKexsXGDhYBF3FpdmL0JcGnKVEq_wk4hav.webp",
    backdrop:
      "https://res.cloudinary.com/dgbl43ljm/image/upload/v1779486017/qKexsXGDhYBF3FpdmL0JcGnKVEq_wk4hav.webp",
    netflixAvailable: false,
    trailerUrl: "https://www.youtube.com/watch?v=p6CX-m1IVXQ",
    watchUrl: "https://www.fandangonow.com/details/movie/caught-stealing-2025",
    year: 2025,
    isNewThisWeek: true,
  },
];
export const weeklyPicks = movies.filter((m) => m.isNewThisWeek);

export const trendingPicks = [...movies].sort(
  (a, b) => b.imdbRating - a.imdbRating
);

export const previewMovies = movies.slice(0, 8);

export const heroPreviewMovies = movies.slice(0, 5);

/** Full-bleed hero carousel */
export const heroCarouselMovies = movies.slice(0, 6);

export const allGenres = Array.from(
  new Set([...ALL_GENRES, ...movies.flatMap((m) => m.genre)]),
).sort();