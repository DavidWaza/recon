import axios from "axios";

export type PreferencePayload = {
  subscriberId: string;
  favoriteGenres: string[];
  dislikedGenres: string[];
  likedMovies: string[];
};

export async function savePreferences(payload: PreferencePayload) {
  const { data } = await axios.post("/api/preferences", payload);
  return data;
}
