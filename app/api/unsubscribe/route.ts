import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SITE_URL } from "@/lib/email";

/**
 * One-click unsubscribe (guide Phase 0.5).
 *
 * The link in every email carries an opaque token — never the email address.
 * We flip `subscribed` to false. Matching falls back to the row id so this
 * keeps working whether or not the `unsubscribe_token` column has been added
 * yet (guide Phase 1.1 schema).
 */
async function unsubscribe(token: string | null) {
  if (!token) return false;

  // Prefer the opaque token column; fall back to id for older rows.
  const byToken = await supabaseAdmin
    .from("subscribers")
    .update({ subscribed: false })
    .eq("unsubscribe_token", token)
    .select("id");

  if (!byToken.error && byToken.data && byToken.data.length > 0) return true;

  const byId = await supabaseAdmin
    .from("subscribers")
    .update({ subscribed: false })
    .eq("id", token)
    .select("id");

  if (byId.error) {
    console.error("[unsubscribe] Supabase error:", byId.error.message);
    return false;
  }
  return Boolean(byId.data && byId.data.length > 0);
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  await unsubscribe(token);
  // Always send somewhere friendly, even if the token didn't match.
  return NextResponse.redirect(`${SITE_URL}/unsubscribed`);
}

// Gmail/Outlook native one-click unsubscribe issues a POST.
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const ok = await unsubscribe(token);
  return NextResponse.json({ success: ok });
}
