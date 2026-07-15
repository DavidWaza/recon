"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import axios from "axios";
import { sendSiteFeedback } from "@/services/site-feedback";

const RATINGS = [1, 2, 3, 4, 5];

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const remaining = 2000 - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const text = message.trim();
    if (!text) {
      toast.error("Please write a message before sending.");
      return;
    }

    setBusy(true);
    try {
      await sendSiteFeedback({
        message: text,
        rating,
        email: email.trim() || undefined,
      });
      setDone(true);
      toast.success("Thanks — we read every message.");
    } catch (error) {
      const msg =
        axios.isAxiosError(error) && error.response?.data?.error
          ? (error.response.data.error as string)
          : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="feedback" className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 sm:p-8"
        >
          {done ? (
            <div className="py-6 text-center">
              <div className="text-3xl" aria-hidden>
                🎬
              </div>
              <h2 className="mt-3 text-xl font-bold text-foreground">
                Thanks for the feedback
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                We read every message — it genuinely shapes what lands in your inbox on Friday.
              </p>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setMessage("");
                  setRating(null);
                  setEmail("");
                }}
                className="mt-5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                Tell us what you think
              </h2>
              <p className="mt-2 text-sm text-muted">
                Missing a platform? Picks not landing? Tell us — it shapes what we send.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    How are we doing? <span className="font-normal normal-case">(optional)</span>
                  </span>
                  <div
                    className="mt-2 flex gap-1"
                    onMouseLeave={() => setHovered(null)}
                  >
                    {RATINGS.map((n) => {
                      const active = (hovered ?? rating ?? 0) >= n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(rating === n ? null : n)}
                          onMouseEnter={() => setHovered(n)}
                          aria-label={`${n} out of 5`}
                          aria-pressed={rating === n}
                          className={`rounded-md px-1.5 py-1 text-2xl leading-none transition-transform hover:scale-110 ${
                            active ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          <span aria-hidden>★</span>
                        </button>
                      );
                    })}
                    {rating !== null && (
                      <span className="self-center pl-2 text-xs text-muted">
                        {rating}/5
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="feedback-message"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    Your feedback
                  </label>
                  <textarea
                    id="feedback-message"
                    required
                    rows={4}
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What would make Recon better?"
                    className="mt-2 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                  <div className="mt-1 text-right text-[11px] text-muted">
                    {remaining} characters left
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="feedback-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted"
                  >
                    Email <span className="font-normal normal-case">(optional, if you want a reply)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy || !message.trim()}
                  className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send feedback"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
