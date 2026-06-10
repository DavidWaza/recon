import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Signup preference quiz (guide Phase 1.2).
 *
 * Upserts the subscriber's stated taste into the `preferences` table. The
 * quiz is skippable on the client, so this only fires when the user opts in.
 * Requires the `preferences` table from Phase 1.1.
 */
export async function POST(req: Request) {
  let body: {
    subscriberId?: string;
    favoriteGenres?: string[];
    dislikedGenres?: string[];
    likedMovies?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { subscriberId, favoriteGenres, dislikedGenres, likedMovies } = body;

  if (!subscriberId) {
    return NextResponse.json(
      { error: "Missing subscriberId" },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("preferences").upsert(
    {
      subscriber_id: subscriberId,
      favorite_genres: favoriteGenres ?? [],
      disliked_genres: dislikedGenres ?? [],
      liked_movies: likedMovies ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "subscriber_id" },
  );

  if (error) {
    console.error("[preferences] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
