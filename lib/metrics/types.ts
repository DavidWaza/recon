// Shared shapes for the admin metrics dashboard.
// Mirrors the planned `metrics_daily` snapshot table plus the click-analytics
// aggregates — safe to import from client components (types only).

export interface DailyMetric {
  day: string; // ISO yyyy-mm-dd
  engaged_subs: number;
  total_subs: number;
  net_growth: number;
  open_rate: number;
  click_rate: number;
  feedback_ratio: number;
  inbox_rate: number;
  hard_bounce_rate: number;
  complaint_rate: number;
  mrr_ngn: number;
  conv_pct: number;
  rec_lift: number;
}

export interface RevenueMixPoint {
  day: string;
  adsense: number;
  affiliate: number;
  sponsorship: number;
  premium: number;
}

export interface SlotStat {
  slot: number;
  title: string;
  watchIntentRate: number;
}

export interface IssueSummary {
  slug: string;
  sentAt: string;
  delivered: number;
  uniqueClickers: number;
  trailerCtr: number;
  watchIntentRate: number;
  perSlot: SlotStat[];
}

export interface MovieRow {
  title: string;
  slot: number;
  impressions: number;
  trailerCtr: number;
  watchIntentRate: number;
  slotAdjustedLift: number;
  ups: number;
  downs: number;
  saves: number;
}

export interface GenreRow {
  genre: string;
  statedPct: number; // share of subscribers who stated liking this genre
  revealedRate: number; // watch-intent rate when the genre was in the issue
}

export interface PlatformRow {
  platform: string;
  watchClicks: number;
  pctMonetizable: number;
  hasAffiliate: boolean;
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface PersonalizationSplit {
  personalizedRate: number;
  controlRate: number;
  personalizedRecipients: number;
  controlRecipients: number;
}

export interface FeedbackNote {
  id: string;
  message: string;
  rating: number | null;
  email: string | null;
  createdAt: string;
}

export interface FeedbackSummary {
  total: number;
  last30d: number;
  unread: number;
  avgRating: number | null;
  ratingCounts: { rating: number; count: number }[];
  /** Capped — the card shows recent notes, not the whole archive. */
  recent: FeedbackNote[];
}

export type DataSource = "live" | "sample";

export interface DashboardData {
  overviewSource: DataSource;
  clicksSource: DataSource;
  /**
   * The leaderboard reads `weekly_picks`, which the admin send path actually
   * writes — so it can be live while the rest of the click section (keyed to
   * email_issues) is still sample.
   */
  leaderboardSource: DataSource;
  daily: DailyMetric[];
  revenueMix: RevenueMixPoint[];
  latestIssue: IssueSummary;
  leaderboard: MovieRow[];
  genres: GenreRow[];
  platforms: PlatformRow[];
  funnel: FunnelStage[];
  /**
   * Null when no control holdout exists yet. That is different from a 0.0
   * lift, which would claim we measured no difference — so the UI must say
   * "not measured" rather than render a zero.
   */
  personalization: PersonalizationSplit | null;
  /** Null when the site_feedback table has no rows yet. */
  feedback: FeedbackSummary | null;
}
