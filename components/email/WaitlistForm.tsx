"use client";

import { useState } from "react";
import axios from "axios";
import { joinWaitlist } from "@/services/waitlist";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await joinWaitlist(email);
      setPosition(data.position);
      setEmail("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error ?? "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  if (position) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-card sm:p-8">
        <p className="text-sm font-bold uppercase tracking-widest text-accent-500 mb-2">
          You're in!
        </p>
        <p className="text-5xl font-black text-foreground mb-2">#{position}</p>
        <p className="text-muted text-sm">in the waitlist</p>
        {/* <p className="mt-4 text-sm text-muted">
          Check your inbox for your confirmation email.
        </p> */}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-12 w-full rounded-full border border-border bg-surface-sunken px-5 text-foreground placeholder:text-subtle focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-500/15"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-full bg-accent-500 font-semibold text-base-950 shadow-glow transition-colors hover:bg-accent-600 disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join the Waitlist"}
      </button>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
    </form>
  );
}
