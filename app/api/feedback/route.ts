import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SITE_URL } from "@/lib/email";

/**
 * Tracked feedback links (guide Phase 1.3).
 *
 * Each recommendation email renders three links per movie pointing here.
 * `r` is the opaque recommendation id, `a` is the action. We record the
 * action and send the reader to a friendly thank-you page.
 *
 * Requires the `recommendations` table from Phase 1.1. Until per-user
 * recommendation rows are inserted on send, this no-ops gracefully and still
 * redirects — the links never error in the reader's face.
 */
const ACTIONS = ["up", "down", "saved"] as const;
type Action = (typeof ACTIONS)[number];

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("r");
  const action = req.nextUrl.searchParams.get("a") ?? "";

  if (!id || !ACTIONS.includes(action as Action)) {
    return NextResponse.redirect(SITE_URL);
  }

  const { error } = await supabaseAdmin
    .from("recommendations")
    .update({ feedback: action, feedback_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[feedback] Supabase error:", error.message);
  }

  return NextResponse.redirect(`${SITE_URL}/thanks?a=${action}`);
}
