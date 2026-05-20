"use client";

import { useState } from "react";
import axios from "axios";

const EMPTY_PICK = {
  title: "",
  description: "",
  genre: "",
  imdb_rating: "",
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
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: "title", label: "Title", span: true },
                  { field: "description", label: "Description", span: true },
                  { field: "genre", label: "Genre" },
                  { field: "imdb_rating", label: "IMDb Rating" },
                  { field: "poster_url", label: "Poster URL", span: true },
                  { field: "trailer_url", label: "Trailer URL", span: true },
                  { field: "netflix_url", label: "Netflix URL", span: true },
                ].map(({ field, label, span }) => (
                  <div key={field} className={span ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={pick[field as keyof typeof EMPTY_PICK]}
                      onChange={(e) => updatePick(i, field, e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
                    />
                  </div>
                ))}
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
