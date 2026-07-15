import type {
  DailyMetric,
  DashboardData,
  RevenueMixPoint,
} from "./types";

// Deterministic sample data so the dashboard is fully visible before the
// metrics schema ships. Seeded PRNG keeps every reload identical.
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAYS = 90;

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function lastFriday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const offset = (d.getDay() + 2) % 7; // days since last Friday
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function buildDaily(): DailyMetric[] {
  const rand = mulberry32(20260715);
  const rows: DailyMetric[] = [];
  for (let i = 0; i < DAYS; i++) {
    const p = i / (DAYS - 1);
    const total = Math.round(2400 + 1700 * p + (rand() - 0.5) * 60);
    const mrrStarted = p > 0.35;
    const mrrP = mrrStarted ? (p - 0.35) / 0.65 : 0;
    const liftStarted = p > 0.5;
    const liftP = liftStarted ? (p - 0.5) / 0.5 : 0;
    rows.push({
      day: isoDaysAgo(DAYS - 1 - i),
      total_subs: total,
      engaged_subs: Math.round(total * (0.3 + 0.06 * p) + (rand() - 0.5) * 40),
      net_growth: Math.round(8 + 20 * p + (rand() - 0.5) * 10),
      open_rate: 0.36 + 0.04 * p + (rand() - 0.5) * 0.03,
      click_rate: 0.038 + 0.012 * p + (rand() - 0.5) * 0.006,
      feedback_ratio: 0.009 + 0.004 * p + (rand() - 0.5) * 0.002,
      inbox_rate: Math.min(0.97, 0.9 + 0.05 * p + (rand() - 0.5) * 0.012),
      hard_bounce_rate: Math.max(0.002, 0.012 - 0.007 * p + (rand() - 0.5) * 0.002),
      complaint_rate: Math.max(0.0002, 0.0009 - 0.0004 * p),
      mrr_ngn: Math.round(mrrP * 185000 + (mrrStarted ? rand() * 4000 : 0)),
      conv_pct: mrrStarted ? 0.6 + 1.5 * mrrP + (rand() - 0.5) * 0.15 : 0,
      rec_lift: liftStarted ? 0.004 + 0.013 * liftP + (rand() - 0.5) * 0.002 : 0,
    });
  }
  return rows;
}

function buildRevenueMix(daily: DailyMetric[]): RevenueMixPoint[] {
  const rand = mulberry32(42);
  return daily.map((row, i) => {
    const p = i / (DAYS - 1);
    const sponsored = (i >= 30 && i < 38) || (i >= 65 && i < 73);
    return {
      day: row.day,
      adsense: Math.round(2600 + 2400 * p + (rand() - 0.5) * 900),
      affiliate: Math.round(300 + 1100 * p + (rand() - 0.5) * 350),
      sponsorship: sponsored ? Math.round(14000 + (rand() - 0.5) * 2500) : 0,
      premium: Math.round(row.mrr_ngn / 30),
    };
  });
}

export function buildDemoData(): DashboardData {
  const daily = buildDaily();
  const issueDate = lastFriday();
  return {
    overviewSource: "sample",
    clicksSource: "sample",
    leaderboardSource: "sample",
    daily,
    revenueMix: buildRevenueMix(daily),
    latestIssue: {
      slug: `friday-${issueDate}`,
      sentAt: issueDate,
      delivered: 3120,
      uniqueClickers: 396,
      trailerCtr: 0.081,
      watchIntentRate: 0.054,
      perSlot: [
        { slot: 1, title: "The Night Agent", watchIntentRate: 0.072 },
        { slot: 2, title: "Dune: Part Two", watchIntentRate: 0.061 },
        { slot: 3, title: "Jagun Jagun", watchIntentRate: 0.049 },
        { slot: 4, title: "Anatomy of a Fall", watchIntentRate: 0.058 },
        { slot: 5, title: "The Black Book", watchIntentRate: 0.031 },
      ],
    },
    leaderboard: [
      { title: "Anatomy of a Fall", slot: 4, impressions: 3120, trailerCtr: 0.074, watchIntentRate: 0.058, slotAdjustedLift: 1.61, ups: 96, downs: 11, saves: 44 },
      { title: "Rebel Ridge", slot: 3, impressions: 2980, trailerCtr: 0.069, watchIntentRate: 0.055, slotAdjustedLift: 1.44, ups: 88, downs: 15, saves: 39 },
      { title: "Jagun Jagun", slot: 3, impressions: 3120, trailerCtr: 0.081, watchIntentRate: 0.049, slotAdjustedLift: 1.28, ups: 102, downs: 9, saves: 51 },
      { title: "Dune: Part Two", slot: 2, impressions: 3120, trailerCtr: 0.09, watchIntentRate: 0.061, slotAdjustedLift: 1.12, ups: 84, downs: 18, saves: 36 },
      { title: "The Night Agent", slot: 1, impressions: 3120, trailerCtr: 0.095, watchIntentRate: 0.072, slotAdjustedLift: 1.08, ups: 91, downs: 14, saves: 33 },
      { title: "Oppenheimer", slot: 2, impressions: 2980, trailerCtr: 0.062, watchIntentRate: 0.05, slotAdjustedLift: 0.92, ups: 61, downs: 22, saves: 28 },
      { title: "The Gentlemen", slot: 4, impressions: 2980, trailerCtr: 0.048, watchIntentRate: 0.031, slotAdjustedLift: 0.86, ups: 47, downs: 19, saves: 17 },
      { title: "The Black Book", slot: 5, impressions: 3120, trailerCtr: 0.052, watchIntentRate: 0.031, slotAdjustedLift: 0.83, ups: 55, downs: 12, saves: 24 },
    ],
    genres: [
      { genre: "Action", statedPct: 0.41, revealedRate: 0.055 },
      { genre: "Drama", statedPct: 0.38, revealedRate: 0.036 },
      { genre: "Thriller", statedPct: 0.34, revealedRate: 0.062 },
      { genre: "Documentary", statedPct: 0.31, revealedRate: 0.014 },
      { genre: "Comedy", statedPct: 0.29, revealedRate: 0.041 },
      { genre: "Sci-Fi", statedPct: 0.22, revealedRate: 0.048 },
      { genre: "Romance", statedPct: 0.18, revealedRate: 0.027 },
      { genre: "Horror", statedPct: 0.12, revealedRate: 0.033 },
    ],
    platforms: [
      { platform: "Netflix", watchClicks: 512, pctMonetizable: 0, hasAffiliate: false },
      { platform: "Prime Video", watchClicks: 296, pctMonetizable: 41, hasAffiliate: true },
      { platform: "Showmax", watchClicks: 118, pctMonetizable: 0, hasAffiliate: true },
      { platform: "Apple TV+", watchClicks: 74, pctMonetizable: 63, hasAffiliate: false },
      { platform: "YouTube", watchClicks: 51, pctMonetizable: 78, hasAffiliate: false },
    ],
    funnel: [
      { stage: "Delivered", value: 3120 },
      { stage: "Trailer clickers", value: 254 },
      { stage: "Watch clickers", value: 168 },
    ],
    personalization: {
      personalizedRate: 0.058,
      controlRate: 0.041,
      personalizedRecipients: 2810,
      controlRecipients: 310,
    },
    // Deliberately never sampled: invented quotes attributed to real readers
    // would be indistinguishable from genuine ones on the page.
    feedback: null,
  };
}
