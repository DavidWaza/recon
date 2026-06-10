import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Preference quiz storage (guide Phase 1.2).
 *
 * Subscribers can be resolved three ways so both the signup quiz AND the
 * standalone /preferences page work:
 *   - subscriberId — returned straight from /api/subscribe (signup quiz)
 *   - token        — the opaque unsubscribe_token from an email link
 *   - email        — typed by an already-subscribed user on /preferences
 *
 * Requires the `preferences` table from Phase 1.1.
 */
async function resolveSubscriberId(opts: {
  subscriberId?: string;
  token?: string;
  email?: string;
}): Promise<string | null> {
  if (opts.subscriberId) return opts.subscriberId;

  if (opts.token) {
    const byToken = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .eq("unsubscribe_token", opts.token)
      .maybeSingle();
    if (!byToken.error && byToken.data) return byToken.data.id;

    // Fall back to row id if the token column isn't present yet.
    const byId = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .eq("id", opts.token)
      .maybeSingle();
    if (!byId.error && byId.data) return byId.data.id;
    return null;
  }

  if (opts.email) {
    const { data } = await supabaseAdmin
      .from("subscribers")
      .select("id")
      .ilike("email", opts.email.trim())
      .maybeSingle();
    return data?.id ?? null;
  }

  return null;
}

// Load a subscriber's current preferences to prefill the form.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? undefined;
  const email = req.nextUrl.searchParams.get("email") ?? undefined;

  if (!token && !email) {
    return NextResponse.json(
      { error: "Provide a token or email" },
      { status: 400 },
    );
  }

  const id = await resolveSubscriberId({ token, email });
  if (!id) return NextResponse.json({ found: false });

  const { data, error } = await supabaseAdmin
    .from("preferences")
    .select("favorite_genres, disliked_genres, liked_movies")
    .eq("subscriber_id", id)
    .maybeSingle();

  if (error) {
    // e.g. the preferences table doesn't exist yet — still let them set it.
    console.error("[preferences GET] Supabase error:", error.message);
    return NextResponse.json({ found: true, preferences: null });
  }

  return NextResponse.json({
    found: true,
    preferences: data
      ? {
          favoriteGenres: data.favorite_genres ?? [],
          dislikedGenres: data.disliked_genres ?? [],
          likedMovies: data.liked_movies ?? [],
        }
      : null,
  });
}

export async function POST(req: Request) {
  let body: {
    subscriberId?: string;
    token?: string;
    email?: string;
    favoriteGenres?: string[];
    dislikedGenres?: string[];
    likedMovies?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { subscriberId, token, email, favoriteGenres, dislikedGenres, likedMovies } =
    body;

  const id = await resolveSubscriberId({ subscriberId, token, email });
  if (!id) {
    return NextResponse.json(
      { error: "We couldn't find that subscriber. Make sure you're subscribed." },
      { status: 404 },
    );
  }

  const { error } = await supabaseAdmin.from("preferences").upsert(
    {
      subscriber_id: id,
      favorite_genres: favoriteGenres ?? [],
      disliked_genres: dislikedGenres ?? [],
      liked_movies: likedMovies ?? [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "subscriber_id" },
  );

  if (error) {
    console.error("[preferences POST] Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
