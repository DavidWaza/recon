// Server-only: loads the admin metrics dashboard.
// Uses live Supabase tables/views when present; falls back section-by-section
// to deterministic sample data so the UI never breaks mid-migration.
import { supabaseAdmin } from "@/lib/supabase";
import { buildDemoData } from "./demo-data";
import type {
  DailyMetric,
  DashboardData,
  FeedbackSummary,
  FunnelStage,
  GenreRow,
  IssueSummary,
  MovieRow,
  PersonalizationSplit,
  PlatformRow,
  RevenueMixPoint,
  SlotStat,
} from "./types";

interface MetricsDailyRow {
  day: string;
  engaged_subs: number | null;
  total_subs: number | null;
  net_growth: number | null;
  open_rate: number | null;
  click_rate: number | null;
  feedback_ratio: number | null;
  inbox_rate: number | null;
  hard_bounce_rate: number | null;
  complaint_rate: number | null;
  mrr_ngn: number | null;
  conv_pct: number | null;
  rec_lift: number | null;
}

function n(v: number | string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const x = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(x) ? x : fallback;
}

async function fetchDaily(): Promise<DailyMetric[] | null> {
  const { data, error } = await supabaseAdmin
    .from("metrics_daily")
    .select("*")
    .order("day", { ascending: true })
    .limit(90);

  if (error || !data || data.length === 0) return null;

  return (data as MetricsDailyRow[]).map((r) => ({
    day: String(r.day).slice(0, 10),
    engaged_subs: n(r.engaged_subs),
    total_subs: n(r.total_subs),
    net_growth: n(r.net_growth),
    open_rate: n(r.open_rate),
    click_rate: n(r.click_rate),
    feedback_ratio: n(r.feedback_ratio),
    inbox_rate: n(r.inbox_rate),
    hard_bounce_rate: n(r.hard_bounce_rate),
    complaint_rate: n(r.complaint_rate),
    mrr_ngn: n(r.mrr_ngn),
    conv_pct: n(r.conv_pct),
    rec_lift: n(r.rec_lift),
  }));
}

async function fetchRevenueMix(): Promise<RevenueMixPoint[] | null> {
  const { data, error } = await supabaseAdmin
    .from("revenue_daily")
    .select("day, adsense, affiliate, sponsorship, premium")
    .order("day", { ascending: true })
    .limit(90);

  if (error || !data || data.length === 0) return null;

  return data.map((r) => ({
    day: String(r.day).slice(0, 10),
    adsense: n(r.adsense),
    affiliate: n(r.affiliate),
    sponsorship: n(r.sponsorship),
    premium: n(r.premium),
  }));
}

async function fetchLatestIssue(): Promise<IssueSummary | null> {
  const { data: issue, error } = await supabaseAdmin
    .from("v_metrics_latest_issue")
    .select("*")
    .maybeSingle();

  if (error || !issue) return null;

  const { data: slots } = await supabaseAdmin
    .from("v_metrics_latest_slots")
    .select("slot, title, watch_intent_rate")
    .order("slot", { ascending: true });

  const perSlot: SlotStat[] = (slots ?? []).map((s) => ({
    slot: n(s.slot),
    title: String(s.title ?? ""),
    watchIntentRate: n(s.watch_intent_rate),
  }));

  return {
    slug: String(issue.slug ?? "issue"),
    sentAt: String(issue.sent_at).slice(0, 10),
    delivered: n(issue.delivered),
    uniqueClickers: n(issue.unique_clickers),
    trailerCtr: n(issue.trailer_ctr),
    watchIntentRate: n(issue.watch_intent_rate),
    perSlot,
  };
}

async function fetchFunnel(): Promise<FunnelStage[] | null> {
  const { data, error } = await supabaseAdmin
    .from("v_metrics_funnel")
    .select("stage, value")
    .order("ord", { ascending: true });

  // Views may not expose `ord` as selectable via PostgREST ordering — try plain.
  if (error) {
    const retry = await supabaseAdmin.from("v_metrics_funnel").select("stage, value");
    if (retry.error || !retry.data || retry.data.length === 0) return null;
    const order = ["Delivered", "Trailer clickers", "Watch clickers"];
    return [...retry.data]
      .sort(
        (a, b) =>
          order.indexOf(String(a.stage)) - order.indexOf(String(b.stage)),
      )
      .map((r) => ({ stage: String(r.stage), value: n(r.value) }));
  }

  if (!data || data.length === 0) return null;
  return data.map((r) => ({ stage: String(r.stage), value: n(r.value) }));
}

async function fetchPersonalization(): Promise<PersonalizationSplit | null> {
  const { data, error } = await supabaseAdmin
    .from("v_metrics_personalization")
    .select("*")
    .maybeSingle();

  if (error || !data) return null;

  return {
    personalizedRate: n(data.personalized_rate),
    controlRate: n(data.control_rate),
    personalizedRecipients: n(data.personalized_recipients),
    controlRecipients: n(data.control_recipients),
  };
}

async function fetchLeaderboard(): Promise<MovieRow[] | null> {
  const { data, error } = await supabaseAdmin
    .from("v_metrics_movie_leaderboard")
    .select("*");

  if (error || !data || data.length === 0) return null;

  return data.map((r) => ({
    title: String(r.title ?? ""),
    slot: n(r.slot),
    impressions: n(r.impressions),
    trailerCtr: n(r.trailer_ctr),
    watchIntentRate: n(r.watch_intent_rate),
    slotAdjustedLift: n(r.slot_adjusted_lift),
    ups: n(r.ups),
    downs: n(r.downs),
    saves: n(r.saves),
  }));
}

async function fetchGenres(): Promise<GenreRow[] | null> {
  const { data, error } = await supabaseAdmin
    .from("v_metrics_genres")
    .select("genre, stated_pct, revealed_rate");

  if (error || !data || data.length === 0) return null;

  return data.map((r) => ({
    genre: String(r.genre ?? ""),
    statedPct: n(r.stated_pct),
    revealedRate: n(r.revealed_rate),
  }));
}

async function fetchPlatforms(): Promise<PlatformRow[] | null> {
  const { data, error } = await supabaseAdmin
    .from("v_metrics_platforms")
    .select("platform, watch_clicks, pct_monetizable, has_affiliate");

  if (error || !data || data.length === 0) return null;

  return data.map((r) => ({
    platform: String(r.platform ?? "Other"),
    watchClicks: n(r.watch_clicks),
    pctMonetizable: n(r.pct_monetizable),
    hasAffiliate: Boolean(r.has_affiliate),
  }));
}

/** Recent notes only — the card is a pulse check, not an inbox. */
const RECENT_FEEDBACK_LIMIT = 20;

async function fetchFeedback(): Promise<FeedbackSummary | null> {
  const [summary, ratings, recent] = await Promise.all([
    supabaseAdmin.from("v_metrics_feedback_summary").select("*").maybeSingle(),
    supabaseAdmin.from("v_metrics_feedback_ratings").select("rating, count"),
    supabaseAdmin
      .from("site_feedback")
      .select("id, message, rating, email, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_FEEDBACK_LIMIT),
  ]);

  if (summary.error || !summary.data) return null;
  const total = n(summary.data.total);
  if (total === 0) return null;

  return {
    total,
    last30d: n(summary.data.last_30d),
    unread: n(summary.data.unread),
    avgRating:
      summary.data.avg_rating === null ? null : n(summary.data.avg_rating),
    ratingCounts: (ratings.data ?? []).map((r) => ({
      rating: n(r.rating),
      count: n(r.count),
    })),
    recent: (recent.data ?? []).map((r) => ({
      id: String(r.id),
      message: String(r.message ?? ""),
      rating: r.rating === null ? null : n(r.rating),
      email: r.email ? String(r.email) : null,
      createdAt: String(r.created_at),
    })),
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const demo = buildDemoData();

  try {
    const [
      daily,
      revenueMix,
      latestIssue,
      funnel,
      personalization,
      leaderboard,
      genres,
      platforms,
      feedback,
    ] = await Promise.all([
      fetchDaily(),
      fetchRevenueMix(),
      fetchLatestIssue(),
      fetchFunnel(),
      fetchPersonalization(),
      fetchLeaderboard(),
      fetchGenres(),
      fetchPlatforms(),
      fetchFeedback(),
    ]);

    const overviewLive = Boolean(daily);

    // The click section is only meaningful once a real issue has been sent:
    // every other click view (funnel, leaderboard, platforms) is keyed to an
    // issue, and v_metrics_genres returns rows from `preferences` alone. Gate
    // the whole section on a real issue so a single populated view can never
    // put a "live" label on demo rows — a half-real dashboard is worse than an
    // honestly-labelled sample one.
    const clicksLive = Boolean(latestIssue);

    // The leaderboard is sourced from weekly_picks, which send-picks writes on
    // every broadcast, so it stands on its own — it does not need an
    // email_issues row the way the funnel and per-slot views do.
    const leaderboardLive = Boolean(leaderboard);

    if (!overviewLive && !clicksLive && !leaderboardLive && !revenueMix) {
      return demo;
    }

    const clicks = clicksLive
      ? {
          latestIssue: latestIssue!,
          leaderboard: leaderboard ?? [],
          genres: genres ?? [],
          platforms: platforms ?? [],
          funnel: funnel ?? [],
          // Stays null until email_sends records a variant — see the type.
          personalization,
        }
      : {
          latestIssue: demo.latestIssue,
          leaderboard: demo.leaderboard,
          genres: demo.genres,
          platforms: demo.platforms,
          funnel: demo.funnel,
          personalization: demo.personalization,
        };

    return {
      overviewSource: overviewLive ? "live" : "sample",
      clicksSource: clicksLive ? "live" : "sample",
      leaderboardSource: leaderboardLive ? "live" : "sample",
      daily: daily ?? demo.daily,
      revenueMix: revenueMix ?? demo.revenueMix,
      ...clicks,
      // weekly_picks stands apart from the email_issues-keyed views above.
      leaderboard: leaderboard ?? demo.leaderboard,
      // Real messages from real people — never substitute demo copy here.
      feedback,
    };
  } catch (error) {
    console.error("[metrics] getDashboardData failed:", error);
    return demo;
  }
}
