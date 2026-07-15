import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Homepage feedback form.
 *
 * Distinct from /api/feedback, which records the per-movie up/down/saved signal
 * against a recommendation. This is free-text "how are we doing" feedback.
 */

const MAX_MESSAGE = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message, rating, email } = (body ?? {}) as {
    message?: unknown;
    rating?: unknown;
    email?: unknown;
  };

  const text = typeof message === "string" ? message.trim() : "";
  if (!text) {
    return NextResponse.json(
      { error: "Please write a message before sending." },
      { status: 400 },
    );
  }
  if (text.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: `Please keep it under ${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  // Rating is optional, but if present it must be 1–5 — the DB check would
  // reject anything else with a 500, so fail cleanly here instead.
  let score: number | null = null;
  if (rating !== undefined && rating !== null && rating !== "") {
    const n = Number(rating);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }
    score = n;
  }

  const cleanEmail =
    typeof email === "string" && EMAIL_RE.test(email.trim())
      ? email.trim().toLowerCase()
      : null;

  // Link to a subscriber when the address is already on the list, so admin can
  // see feedback in the context of that reader's taste profile.
  let subscriberId: string | null = null;
  if (cleanEmail) {
    const { data } = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();
    if (data?.id) subscriberId = data.id as string;
  }

  const { error } = await supabaseAdmin.from("site_feedback").insert({
    message: text,
    rating: score,
    email: cleanEmail,
    subscriber_id: subscriberId,
    source: "homepage",
    user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
  });

  if (error) {
    console.error("[site-feedback] insert failed:", error.message);
    return NextResponse.json(
      { error: "Could not save your feedback. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
