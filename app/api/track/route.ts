import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SITE_URL } from "@/lib/urls";

/**
 * Click redirect for trailer / watch links in weekly emails.
 *
 * Usage (in email HTML):
 *   /api/track?kind=trailer&wp=<weekly_pick_id>&s=<subscriber_id>&u=<encoded_url>
 *   /api/track?kind=watch&wp=<weekly_pick_id>&s=<subscriber_id>&u=<encoded_url>
 *
 * `wp` is a weekly_picks.id — that is the table /api/admin/send-picks writes,
 * and what the movie leaderboard ranks. `pick` (an issue_picks.id) is still
 * accepted for the not-yet-built per-issue pipeline.
 *
 * Always redirects to `u` (or SITE_URL) so the reader is never stuck if
 * logging fails. Populates `link_clicks` for the metrics dashboard.
 */

const KINDS = ["trailer", "watch", "cta", "other"] as const;
type Kind = (typeof KINDS)[number];

function inferPlatform(url: string): string {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return "";
    }
  })();

  if (host.includes("netflix")) return "Netflix";
  if (host.includes("primevideo") || host.includes("amazon")) return "Prime Video";
  if (host.includes("max.com") || host.includes("hbomax")) return "Max";
  if (host.includes("apple.com") || host.includes("tv.apple")) return "Apple TV+";
  if (host.includes("showmax")) return "Showmax";
  if (host.includes("disney")) return "Disney+";
  if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
  return "Other";
}

function safeRedirect(url: string | null): string {
  if (!url) return SITE_URL;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    /* fall through */
  }
  return SITE_URL;
}

export async function GET(req: NextRequest) {
  const kindParam = req.nextUrl.searchParams.get("kind") ?? "other";
  const kind = (KINDS.includes(kindParam as Kind) ? kindParam : "other") as Kind;
  const pickId = req.nextUrl.searchParams.get("pick");
  const weeklyPickId = req.nextUrl.searchParams.get("wp");
  const subscriberId = req.nextUrl.searchParams.get("s");
  const sendId = req.nextUrl.searchParams.get("send");
  const dest = safeRedirect(req.nextUrl.searchParams.get("u"));

  // Resolve issue_id from the pick when possible (keeps inserts cheap for apps).
  let issueId: string | null = null;
  let platform: string | null =
    kind === "watch" || kind === "trailer" ? inferPlatform(dest) : null;

  if (pickId) {
    const { data: pick } = await supabaseAdmin
      .from("issue_picks")
      .select("issue_id, platform")
      .eq("id", pickId)
      .maybeSingle();

    if (pick?.issue_id) issueId = pick.issue_id as string;
    if (!platform && pick?.platform) platform = pick.platform as string;
  }

  try {
    await supabaseAdmin.from("link_clicks").insert({
      issue_id: issueId,
      issue_pick_id: pickId || null,
      weekly_pick_id: weeklyPickId || null,
      subscriber_id: subscriberId || null,
      send_id: sendId || null,
      kind,
      platform,
      destination_url: dest,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    });
  } catch (error) {
    console.error("[track] insert failed:", error);
  }

  return NextResponse.redirect(dest, 302);
}
