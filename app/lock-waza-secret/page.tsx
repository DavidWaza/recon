"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Thriller",
  "Mystery",
  'Physchological Thriller',
  "Mind Bending",
  "Dark Comedy",
  "Crime",
  "Fantasy",
  "Romance",
  "Documentary",
  "War",
  "Tragedy",
];

const IMDB_OPTIONS = [
  "9.5",
  "9.0",
  "8.5",
  "8.0",
  "7.5",
  "7.0",
  "6.5",
  "6.0",
  "5.5",
  "5.0",
  "4.5",
  "4.0",
];

const PERSIST_KEY = "recon-admin-picks";

const EMPTY_PICK = {
  title: "",
  description: "",
  genre: "Action",
  imdb_rating: "8.0",
  poster_url: "",
  trailer_url: "",
  netflix_url: "",
};

export default function AdminPage() {
  const [picks, setPicks] = useState([{ ...EMPTY_PICK }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    sent?: number;
    failed?: number;
    error?: string;
  } | null>(null);

  const updatePick = (index: number, field: string, value: string) => {
    setPicks((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const addPick = () => setPicks((prev) => [...prev, { ...EMPTY_PICK }]);

  const removePick = (index: number) =>
    setPicks((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(PERSIST_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPicks(parsed);
      }
    } catch (error) {
      console.warn("Failed to restore admin picks:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(picks));
  }, [picks]);

  const handleSend = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(
        "/api/admin/send-picks",
        {
          picks: picks.map((p) => ({
            ...p,
            imdb_rating: parseFloat(p.imdb_rating),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY}`,
          },
        },
      );
      setResult(data);
      if (data.success) {
        setPicks([{ ...EMPTY_PICK }]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setResult({
          error: err.response?.data?.error ?? "Something went wrong",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin — Weekly Picks</h1>
        <p className="text-[#a3a3a3] mb-8">
          Add this week's picks and send to all subscribers.
        </p>

        <div className="space-y-6">
          {picks.map((pick, i) => (
            <div
              key={i}
              className="bg-[#141414] border border-[#1f1f1f] rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-white">Pick #{i + 1}</h2>
                {picks.length > 1 && (
                  <button
                    onClick={() => removePick(i)}
                    className="text-sm text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                      Title
                    </label>
                    <input
                      type="text"
                      value={pick.title}
                      onChange={(e) => updatePick(i, "title", e.target.value)}
                      placeholder="Movie title"
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                      IMDb Rating
                    </label>
                    <select
                      value={pick.imdb_rating}
                      onChange={(e) => updatePick(i, "imdb_rating", e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    >
                      {IMDB_OPTIONS.map((value) => (
                        <option key={value} value={value} className="bg-[#0f0f0f] text-white">
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={pick.description}
                    onChange={(e) => updatePick(i, "description", e.target.value)}
                    placeholder="A concise overview of the pick, styled for the newsletter."
                    className="w-full resize-none bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                      Genres
                    </label>
                    <select
                      multiple
                      value={pick.genre.split(",").map((value) => value.trim()).filter(Boolean)}
                      onChange={(e) => {
                        const selectedGenres = Array.from(e.target.selectedOptions).map((option) => option.value);
                        updatePick(i, "genre", selectedGenres.join(", "));
                      }}
                      className="h-32 w-full min-h-32 bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    >
                      {GENRE_OPTIONS.map((genre) => (
                        <option key={genre} value={genre} className="bg-[#0f0f0f] text-white">
                          {genre}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#7a7a7a]">Use Ctrl/Cmd+click to select multiple genres.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pick.genre
                        .split(",")
                        .map((value) => value.trim())
                        .filter(Boolean)
                        .map((genre) => (
                          <span
                            key={genre}
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white ring-1 ring-white/10"
                          >
                            {genre}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                      Trailer URL
                    </label>
                    <input
                      type="text"
                      value={pick.trailer_url}
                      onChange={(e) => updatePick(i, "trailer_url", e.target.value)}
                      placeholder="YouTube trailer link"
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                      Poster URL
                    </label>
                    <input
                      type="text"
                      value={pick.poster_url}
                      onChange={(e) => updatePick(i, "poster_url", e.target.value)}
                      placeholder="Cover image link"
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">
                      Netflix URL
                    </label>
                    <input
                      type="text"
                      value={pick.netflix_url}
                      onChange={(e) => updatePick(i, "netflix_url", e.target.value)}
                      placeholder="Netflix watch link"
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addPick}
          className="mt-4 w-full border border-dashed border-[#2a2a2a] rounded-xl py-3 text-sm text-[#a3a3a3] hover:border-[#E50914]/40 hover:text-white transition-colors"
        >
          + Add another pick
        </button>

        <button
          onClick={handleSend}
          disabled={loading}
          className="mt-6 w-full bg-[#E50914] hover:bg-[#c40812] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
        >
          {loading ? "Sending..." : "Save Picks & Send to All Subscribers"}
        </button>

        {result && (
          <div
            className={`mt-4 p-4 rounded-xl text-sm ${result.error ? "bg-red-950 text-red-400 border border-red-900" : "bg-green-950 text-green-400 border border-green-900"}`}
          >
            {result.error
              ? `❌ Error: ${result.error}`
              : `✅ Sent to ${result.sent} subscriber${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}`}
          </div>
        )}
      </div>
    </div>
  );
}
