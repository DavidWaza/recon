"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  weeklyPicksEmailHtml,
  type WeeklyPick,
} from "@/lib/emails/weekly-picks";
import { GenrePicker } from "@/components/admin/GenrePicker";

const IMDB_OPTIONS = [
  "10.0",
  "9.8",
  "9.7",
  "9.6",
  "9.5",
  "9.4",
  "9.3",
  "9.2",
  "9.1",
  "9.0",
  "8.9",
  "8.8",
  "8.7",
  "8.6",
  "8.5",
  "8.4",
  "8.3",
  "8.2",
  "8.1",
  "8.0",
  "7.9",
  "7.8",
  "7.7",
  "7.6",
  "7.5",
  "7.4",
  "7.3",
  "7.2",
  "7.1",
  "7.0",
  "6.9",
  "6.8",
  "6.7",
  "6.6",
  "6.5",
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

type Pick = typeof EMPTY_PICK;

function toWeeklyPick(p: Pick, i: number): WeeklyPick {
  return {
    id: i + 1,
    title: p.title || "Untitled pick",
    genre: p.genre,
    description: p.description,
    imdb_rating: p.imdb_rating,
    poster_url: p.poster_url || undefined,
    trailer_url: p.trailer_url || undefined,
    netflix_url: p.netflix_url || undefined,
  };
}

export default function AdminPage() {
  const [picks, setPicks] = useState<Pick[]>([{ ...EMPTY_PICK }]);
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState<null | "test" | "all">(null);
  const [result, setResult] = useState<{
    sent?: number;
    failed?: number;
    message?: string;
    error?: string;
  } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const updatePick = (index: number, field: keyof Pick, value: string) => {
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

  const validPickCount = picks.filter((pick) => pick.title.trim()).length;

  const previewHtml = weeklyPicksEmailHtml(
    testEmail || "you@email.com",
    picks.map(toWeeklyPick),
  );

  const send = async (mode: "test" | "all") => {
    if (validPickCount === 0) {
      const error = "Add at least one pick with a title before sending.";
      setResult({ error });
      toast.error(error);
      return;
    }
    if (mode === "test" && !testEmail.trim()) {
      toast.error("Enter a test email address");
      return;
    }

    setBusy(mode);
    setResult(null);
    try {
      const { data } = await axios.post(
        "/api/admin/send-picks",
        {
          mode,
          testEmail: mode === "test" ? testEmail.trim() : undefined,
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
        toast.success(data.message ?? `Sent to ${data.sent} subscriber(s)`);
        // Keep the picks after a broadcast so the list can be re-sent if not
        // every subscriber was reached in one pass.
      } else {
        toast.error(data.error ?? "Failed to send");
      }
    } catch (err) {
      const error = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? "Something went wrong")
        : "Something went wrong";
      setResult({ error });
      toast.error(error);
    } finally {
      setBusy(null);
    }
  };

  const requestSend = () => {
    if (validPickCount === 0) {
      setResult({ error: "Add at least one pick with a title before sending." });
      return;
    }
    setShowConfirmModal(true);
  };

  const inputClass =
    "w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20";
  const labelClass =
    "block text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <ConfirmDialog
        open={showConfirmModal}
        title="Send weekly picks to all subscribers?"
        description={`This will save ${validPickCount} pick${validPickCount !== 1 ? "s" : ""} and email every active subscriber immediately. This cannot be undone.`}
        confirmLabel="Yes, send picks"
        onConfirm={() => {
          setShowConfirmModal(false);
          void send("all");
        }}
        onCancel={() => setShowConfirmModal(false)}
        loading={busy === "all"}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold mb-2">Admin — Weekly Picks</h1>
          <a
            href="/lock-waza-secret/metrics"
            className="shrink-0 rounded-2xl border border-[#2a2a2a] px-4 py-2 text-sm text-[#a3a3a3] hover:text-white transition-colors"
          >
            Metrics →
          </a>
        </div>
        <p className="text-[#a3a3a3] mb-8">
          Build this week&apos;s picks, send a test to yourself, then send to
          all subscribers.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(360px,520px)]">
          {/* Editor + actions */}
          <div>
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
                        <label className={labelClass}>Title</label>
                        <input
                          type="text"
                          value={pick.title}
                          onChange={(e) => updatePick(i, "title", e.target.value)}
                          placeholder="Movie title"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>IMDb Rating</label>
                        <select
                          value={pick.imdb_rating}
                          onChange={(e) =>
                            updatePick(i, "imdb_rating", e.target.value)
                          }
                          className={inputClass}
                        >
                          {IMDB_OPTIONS.map((value) => (
                            <option
                              key={value}
                              value={value}
                              className="bg-[#0f0f0f] text-white"
                            >
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Description</label>
                      <textarea
                        rows={4}
                        value={pick.description}
                        onChange={(e) =>
                          updatePick(i, "description", e.target.value)
                        }
                        placeholder="A concise overview of the pick, styled for the newsletter."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Genres</label>
                      <GenrePicker
                        value={pick.genre}
                        onChange={(genre) => updatePick(i, "genre", genre)}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className={labelClass}>Trailer URL</label>
                        <input
                          type="text"
                          value={pick.trailer_url}
                          onChange={(e) =>
                            updatePick(i, "trailer_url", e.target.value)
                          }
                          placeholder="YouTube trailer link"
                          className={inputClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>Poster URL</label>
                        <input
                          type="text"
                          value={pick.poster_url}
                          onChange={(e) =>
                            updatePick(i, "poster_url", e.target.value)
                          }
                          placeholder="Cover image link"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>
                        Watch link (Netflix, Prime, Max…)
                      </label>
                      <input
                        type="text"
                        value={pick.netflix_url}
                        onChange={(e) =>
                          updatePick(i, "netflix_url", e.target.value)
                        }
                        placeholder="Where to watch link"
                        className={inputClass}
                      />
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

            {/* Test + broadcast */}
            <div className="mt-6 rounded-xl border border-[#1f1f1f] bg-[#141414] p-5">
              <p className="text-sm font-semibold text-white">
                Test before you broadcast
              </p>
              <p className="mt-1 text-xs text-[#a3a3a3]">
                Sends these exact picks to one address only. Nothing is saved or
                sent to subscribers.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputClass}
                />
                <button
                  onClick={() => send("test")}
                  disabled={busy !== null}
                  className="shrink-0 rounded-xl border border-[#2a2a2a] bg-[#1f1f1f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a] disabled:opacity-50"
                >
                  {busy === "test" ? "Sending…" : "Send test to myself"}
                </button>
              </div>

              <button
                onClick={requestSend}
                disabled={busy !== null}
                className="mt-4 w-full bg-[#E50914] hover:bg-[#c40812] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors"
              >
                {busy === "all"
                  ? "Sending..."
                  : "Save Picks & Send to All Subscribers"}
              </button>

              {result && (
                <div
                  className={`mt-4 p-4 rounded-xl text-sm ${result.error ? "bg-red-950 text-red-400 border border-red-900" : "bg-green-950 text-green-400 border border-green-900"}`}
                >
                  {result.error
                    ? `❌ Error: ${result.error}`
                    : `✅ ${result.message ?? `Sent to ${result.sent} subscriber${result.sent !== 1 ? "s" : ""}${result.failed ? ` (${result.failed} failed)` : ""}`}`}
                </div>
              )}
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a3a3a3]">
                Live preview
              </p>
              <button
                onClick={() => setShowPreview((s) => !s)}
                className="text-xs text-[#a3a3a3] transition-colors hover:text-white"
              >
                {showPreview ? "Hide" : "Show"}
              </button>
            </div>
            {showPreview && (
              <div className="overflow-hidden rounded-xl border border-[#1f1f1f]">
                <iframe
                  srcDoc={previewHtml}
                  title="Email preview"
                  className="h-[720px] w-full border-0 bg-[#0a0a0a]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
