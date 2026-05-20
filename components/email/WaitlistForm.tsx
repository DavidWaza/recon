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
      <div className="text-center p-8 bg-[#141414] border border-[#1f1f1f] rounded-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-[#E50914] mb-2">
          You're in!
        </p>
        <p className="text-5xl font-black text-white mb-2">#{position}</p>
        <p className="text-[#a3a3a3] text-sm">in the waitlist</p>
        {/* <p className="mt-4 text-sm text-[#a3a3a3]">
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
          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white placeholder:text-[#4a4a4a] focus:outline-none focus:border-[#E50914]/50 focus:ring-1 focus:ring-[#E50914]/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#E50914] hover:bg-[#c40812] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
      >
        {loading ? "Joining..." : "Join the Waitlist"}
      </button>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
    </form>
  );
}
