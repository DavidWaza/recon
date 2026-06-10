import axios from "axios";

export type PreferenceSelection = {
  favoriteGenres: string[];
  dislikedGenres: string[];
  likedMovies: string[];
};

/** One of subscriberId / token / email identifies the subscriber. */
export type PreferencePayload = PreferenceSelection & {
  subscriberId?: string;
  token?: string;
  email?: string;
};

export type PreferenceLookup =
  | { found: false }
  | { found: true; preferences: PreferenceSelection | null };

export async function savePreferences(payload: PreferencePayload) {
  const { data } = await axios.post("/api/preferences", payload);
  return data;
}

export async function getPreferences(params: {
  token?: string;
  email?: string;
}): Promise<PreferenceLookup> {
  const { data } = await axios.get("/api/preferences", { params });
  return data as PreferenceLookup;
}
