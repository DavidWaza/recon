/**
 * Canonical genre list for admin picks, preference quiz, and filters.
 * Add new sub-genres here so every surface stays in sync.
 */
export const ALL_GENRES = [
  // Core genres
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",

  // Comedy & romance
  "Action Comedy",
  "Adventure Comedy",
  "Black Comedy",
  "Buddy Comedy",
  "Dark Comedy",
  "Dark Romance",
  "Mockumentary",
  "Parody",
  "Romantic Comedy",
  "Satire",
  "Stoner Comedy",
  "Tragicomedy",
  "Workplace Comedy",

  // Drama & thriller
  "Coming-of-Age",
  "Conspiracy Thriller",
  "Courtroom Drama",
  "Crime Drama",
  "Crime Thriller",
  "Erotic Drama",
  "Erotic Thriller",
  "Family Drama",
  "Legal Drama",
  "Legal Thriller",
  "Medical Drama",
  "Medical Thriller",
  "Melodrama",
  "Period Drama",
  "Political Drama",
  "Political Thriller",
  "Psychological Drama",
  "Psychological Thriller",
  "Revenge",
  "Sports Drama",
  "Tech Thriller",
  "Tragedy",
  "True Crime",

  // Horror & suspense
  "Body Horror",
  "Cosmic Horror",
  "Eco-Horror",
  "Folk Horror",
  "Found Footage",
  "Giallo",
  "Gothic",
  "Lovecraftian",
  "Paranormal",
  "Psychological Horror",
  "Slasher",
  "Southern Gothic",
  "Supernatural",
  "Survival Horror",
  "Vampire",
  "Werewolf",
  "Whodunnit",
  "Zombie",

  // Sci-fi & fantasy
  "Alien",
  "Alternate History",
  "Cyberpunk",
  "Dystopian",
  "High Fantasy",
  "Low Fantasy",
  "Mind Bending",
  "Post-Apocalyptic",
  "Space Opera",
  "Steampunk",
  "Superhero",
  "Sword and Sorcery",
  "Time Travel",
  "Urban Fantasy",

  // Action & adventure
  "Disaster",
  "Epic Adventure",
  "Espionage",
  "Exploitation",
  "Grindhouse",
  "Heist",
  "Martial Arts",
  "Military",
  "Prison",
  "Road Movie",
  "Spy",
  "Survival",
  "War Crime",

  // Setting & mood
  "Art House",
  "Cult Classic",
  "Desert",
  "Film Noir",
  "Historical",
  "Independent",
  "Neo-Noir",
  "Nordic Noir",

  // Sports & music
  "Dance",
  "Music",
  "Sports",

  // Identity & audience
  "Anime",
  "LGBTQ+",
  "Teen",

  // World cinema & language
  "British",
  "Chinese",
  "Foreign",
  "French",
  "Hindi",
  "Italian",
  "Japanese",
  "Korean",
  "Nordic",
  "Spanish",

  // Format
  "Anthology",
  "Biopic",
] as const;

export type Genre = (typeof ALL_GENRES)[number];

/** @deprecated Use ALL_GENRES — kept for admin page import alias. */
export const GENRE_OPTIONS = ALL_GENRES;
