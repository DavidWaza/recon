# Building a Personalized Movie Recommendation Product

A step-by-step guide to evolve your curated newsletter into a personalized recommendation engine with monetization built in.

**Stack:** Next.js (App Router) · Supabase (Postgres) · Nodemailer + Gmail SMTP (email) · TMDB (movie data) · Anthropic API (recommendations) · Vercel Cron (scheduling) · Stripe (premium tier)

**Guiding principle:** the value is the *data loop* — learn what each user likes, get better at predicting it. Build that first; everything else (automation, monetization) sits on top of it. Each phase is shippable on its own.

---

## Phase 0 — Fix the foundations (½ day)

Do this before adding features. You're sending through **Nodemailer + Gmail SMTP** for now (no domain required), which is fine to launch with — just know the ceiling and plan to migrate when you have a domain (see 0.4).

### 0.1 Set up a Gmail App Password
You can't use your normal Gmail password over SMTP. You need an **App Password**:
1. Turn on 2-Step Verification for the Google account (required before App Passwords appear).
2. Go to Google Account → Security → App Passwords, generate one, and copy the 16-character value.
3. Put it in your env file — never commit it:
```bash
# .env.local
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
```

### 0.2 Nodemailer transport
```bash
npm install nodemailer
```
```ts
// lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeToken: string
) {
  return transporter.sendMail({
    from: `"Picks" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    headers: {
      // One-click unsubscribe — Gmail/Outlook surface this in the UI
      "List-Unsubscribe": `<https://yourdomain.com/api/unsubscribe?token=${unsubscribeToken}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
```

### 0.3 Know your sending limits (this is the real constraint)
Gmail SMTP caps how many recipients you can send to per rolling 24 hours:
- **Free Gmail:** ~500 recipients/day.
- **Google Workspace:** ~2,000 recipients/day.

For a weekly newsletter that means roughly your list size as a hard ceiling on send day — fine while you're small, but you'll hit a wall once your list grows past a few hundred. To stay safe:
- **Throttle.** Send in small batches with a short delay between them rather than blasting all at once, or Google may temporarily block the account.
- **Spread the send** across the day if you're near the cap.
- Deliverability is also weaker than a domain-authenticated sender — expect some picks to land in Promotions/Spam. Keep emails text-light and avoid spammy subject lines.

### 0.4 Plan the migration (later, not now)
The moment you own a domain, switching to a real email service (Resend, Postmark, SendGrid) gets you proper SPF/DKIM/DMARC, far higher limits, and bounce handling. Because all sending goes through the single `sendEmail` function in `lib/email.ts`, that migration is a one-file change — you swap the transport internals and leave every caller untouched. Build everything else against `sendEmail` and you won't have to refactor later.

### 0.5 Unsubscribe handling (legally required)
Every email needs a working one-click unsubscribe. Generate a random opaque token per subscriber (the `unsubscribe_token` column you added in Phase 1), pass it into `sendEmail`, and expose `/api/unsubscribe?token=...` that flips the `subscribed` flag. Never put the email address itself in the URL.

---

## Phase 1 — Close the feedback loop (the core) (2–3 days)

This is the phase that actually turns a newsletter into an engine. You start collecting preference signal passively, every week.

### 1.1 Database schema
Run this in the Supabase SQL editor:

```sql
-- Subscribers
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  subscribed boolean default true,
  unsubscribe_token uuid default gen_random_uuid(),
  tier text default 'free',            -- 'free' | 'premium'
  created_at timestamptz default now()
);

-- Stated preferences (from signup quiz)
create table preferences (
  subscriber_id uuid references subscribers(id) on delete cascade,
  favorite_genres text[],              -- e.g. {'Action','Sci-Fi'}
  disliked_genres text[],
  liked_movies text[],                 -- free-text or TMDB ids
  updated_at timestamptz default now(),
  primary key (subscriber_id)
);

-- Movie catalogue (filled from TMDB in Phase 2)
create table movies (
  id bigint primary key,               -- TMDB id
  title text not null,
  overview text,
  genres text[],
  poster_url text,
  release_year int,
  tmdb_rating numeric,
  watch_providers jsonb,               -- where to stream, by region
  created_at timestamptz default now()
);

-- Each individual recommendation we send (one row per movie per user per send)
create table recommendations (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid references subscribers(id) on delete cascade,
  movie_id bigint references movies(id),
  reason text,                         -- "because you liked X"
  sent_at timestamptz default now(),
  feedback text                        -- null | 'up' | 'down' | 'saved'
);

-- Index for fast per-user history lookups
create index on recommendations (subscriber_id, sent_at desc);
```

The `recommendations` row id doubles as your **opaque tracking token** — that's what goes in the email links, so you never expose emails or user ids in URLs.

### 1.2 Signup preference quiz
After email capture, show a 4–5 question quiz (favorite genres, a few movies they love, mood). Write it to the `preferences` table. Even rough data here is what powers segmentation. Keep it skippable so it doesn't hurt conversion.

### 1.3 Tracked feedback links
In every recommendation email, render three links per movie pointing at a route handler:

```ts
// app/api/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // server-only key
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("r");      // recommendation id
  const action = req.nextUrl.searchParams.get("a");  // 'up' | 'down' | 'saved'

  if (!id || !["up", "down", "saved"].includes(action ?? "")) {
    return NextResponse.redirect("https://yourdomain.com");
  }

  await supabase.from("recommendations").update({ feedback: action }).eq("id", id);

  // Send them somewhere nice afterward
  return NextResponse.redirect("https://yourdomain.com/thanks");
}
```

Link format in the email: `https://yourdomain.com/api/feedback?r=<recommendation_id>&a=up`

That's it — every Friday you now accumulate labelled preference data with zero extra work from the user. **Ship here and let data collect for a couple of weeks before Phase 3.**

---

## Phase 2 — Automate content with TMDB (1–2 days)

Stop manually hunting for movies, and make the emails look good.

### 2.1 Get a TMDB API key
Free at themoviedb.org → Settings → API. Read their attribution requirements (you must credit TMDB).

### 2.2 Fetch and cache movies
```ts
// lib/tmdb.ts
const BASE = "https://api.themoviedb.org/3";
const opts = { headers: { Authorization: `Bearer ${process.env.TMDB_TOKEN}` } };

export async function getTrending() {
  const res = await fetch(`${BASE}/trending/movie/week`, opts);
  const { results } = await res.json();
  return results;
}

export async function getWatchProviders(movieId: number) {
  const res = await fetch(`${BASE}/movie/${movieId}/watch/providers`, opts);
  return (await res.json()).results;   // keyed by country code
}
```

Poster URLs are built as `https://image.tmdb.org/t/p/w500${poster_path}`.

### 2.3 Sync job
Write a small script (or an admin button) that pulls trending + a few genre `discover` queries, enriches each with watch providers, and upserts into your `movies` table. Run it weekly. Telling users *where to stream* a pick is one of the most useful things you can add, and it sets up affiliate revenue later.

---

## Phase 3 — Personalized recommendations (2–4 days)

Now you have signal (Phase 1) and a catalogue (Phase 2). Turn them into per-user picks.

### Option A — LLM-based (start here; cheapest to build)
For each user, pass their stated preferences + their thumbs-up/down history + a candidate list from your `movies` table, and ask for ranked picks *with reasons*.

```ts
// lib/recommend.ts
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function recommendFor(profile: {
  favorite_genres: string[];
  liked: string[];
  disliked: string[];
}, candidates: { id: number; title: string; genres: string[]; overview: string }[]) {

  const msg = await client.messages.create({
    model: "claude-haiku-4-5",     // fast + cheap; use a Sonnet model for higher quality
    max_tokens: 1024,
    system:
      "You are a film recommender. Given a user profile and candidate movies, " +
      "return the 5 best matches. Respond with ONLY a JSON array of " +
      "{id, reason} objects — no prose, no markdown. The reason must be one " +
      "sentence starting with 'Because you'.",
    messages: [{
      role: "user",
      content: JSON.stringify({ profile, candidates }),
    }],
  });

  const text = msg.content.find((b) => b.type === "text")?.text ?? "[]";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}
```

The "Because you liked X" reason is doing a lot of work — it makes the product *feel* personal, which is most of the perceived value. Cost is tiny on Haiku 4.5 (fractions of a cent per user per week). Check current pricing at https://docs.claude.com/en/docs/about-claude/pricing.

> **Note on accuracy:** model names and pricing change. `claude-haiku-4-5` is the current cheap/fast tier as of June 2026; verify the latest at https://docs.claude.com/en/docs/about-claude/models/overview before launch.

### Option B — Embeddings + pgvector (the durable engine)
When you outgrow Option A, this becomes a real recommendation system that fits Supabase natively:

```sql
create extension if not exists vector;
alter table movies add column embedding vector(1536);
```
1. Embed each movie's title + overview + genres, store in the `embedding` column.
2. Build a per-user "taste vector" by averaging the embeddings of movies they thumbed up.
3. Recommend via cosine similarity:
```sql
select id, title, 1 - (embedding <=> $1) as score
from movies
where id not in (select movie_id from recommendations where subscriber_id = $2)
order by embedding <=> $1
limit 5;
```
This costs ~nothing per query, improves automatically as feedback accumulates, and is yours — no per-call LLM dependency. Start with A, graduate to B.

---

## Phase 4 — Automate delivery (1 day)

### 4.1 Build the send route
`app/api/cron/weekly/route.ts`: pull all `subscribed` users → for each, get candidates + run `recommendFor` → render email with posters and feedback links → insert `recommendations` rows → send via your `sendEmail` helper (pass each subscriber's `unsubscribe_token`).

**Throttle hard, because of Gmail's limits (Phase 0.3).** Don't fire all sends at once — loop with a short delay (e.g. ~1–2s between messages) and stop before you hit the daily cap (~500 free / ~2,000 Workspace). Sending too fast can get the Gmail account temporarily blocked. A simple sequential loop with `await new Promise(r => setTimeout(r, 1500))` between sends is enough while your list is small. Once the list outgrows the cap, that's your signal to get a domain and switch the transport in `lib/email.ts` (Phase 0.4) — no other code changes.

> **Vercel timeout note:** serverless functions have an execution time limit, so a slow throttled loop over a large list can time out. While small you're fine; as you grow, move the send to a background queue or split the batch across several cron invocations.

### 4.2 Schedule it with Vercel Cron
```json
// vercel.json
{
  "crons": [{ "path": "/api/cron/weekly", "schedule": "0 14 * * 5" }]
}
```
That fires every Friday at 14:00 UTC. **Protect the route** so only the cron can trigger it:
```ts
if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response("Unauthorized", { status: 401 });
}
```
Your Fridays are now free.

---

## Phase 5 — A web surface for stickiness (3–5 days)

Email is great for re-engagement but weak for daily habit. Add a thin web app to generate more signal and give people a reason to return:

- **Watchlist** — a "🔖 save" that writes to the recommendations/feedback data and shows up in their account.
- **"What should I watch tonight?"** button — one tap returns an instant personalized pick using the same `recommendFor` logic. This is your most viral, most demo-able feature, and it generates feedback in real time.
- **Account page** — edit preferences, see history. Use Supabase Auth (magic links pair nicely with an email-first audience).

---

## Phase 6 — Monetization (sequence it, don't rush it)

Revenue scales with *engaged* list size. Grow the loop to a few thousand active subscribers first, then layer these from easiest to hardest:

### 6.1 Affiliate links — start now, free money
You already surface "where to watch" (Phase 2). Wrap rental/purchase links (Amazon Prime Video, Apple TV) with your affiliate tags. Small per-click revenue, but zero ongoing effort once wired in.

### 6.2 Newsletter sponsorships — the main earner
An engaged audience of movie-watchers is genuinely attractive to advertisers — streaming services, entertainment brands, and especially **studios promoting new releases**. Practical steps:
- Add a clearly-labelled sponsor slot to your email template now (leave it empty / self-promo until sold).
- Track and publish your open rate and click rate — sponsors buy on engagement, not raw list size.
- Once you're at a few thousand engaged readers, list on a newsletter sponsorship marketplace or pitch studios' digital marketing teams directly.

### 6.3 Premium tier (freemium) — highest ceiling
Only works once the paid experience is *clearly* better, which the personalization engine gives you:

| Free | Premium |
|------|---------|
| Weekly picks | Daily picks |
| Basic personalization | Full personalization + "watch tonight" tool |
| Ads/sponsors | Ad-free |
| — | Full archive + advanced filters |

Implement with **Stripe Checkout** + webhook that flips `subscribers.tier` to `'premium'`, then gate features on that flag.
```bash
npm install stripe
```
Use a Stripe webhook (`checkout.session.completed`, `customer.subscription.deleted`) to keep the `tier` column in sync. Gate premium routes/features server-side on `tier === 'premium'`.

---

## Two things to decide early

1. **Naming / trademark.** "Netflix recommendation engine" is a trademark risk and boxes you into one service. A multi-platform pitch — *"what to watch tonight, across everything you're subscribed to"* — is stronger, more defensible, and TMDB's watch-provider data already supports it.
2. **Privacy basics.** A privacy policy, explicit consent at signup, and honoring unsubscribes aren't optional once you're collecting preference data and (later) taking payments.

---

## Suggested order of operations

1. Phase 0 (deliverability) — do immediately.
2. Phase 1 (feedback loop) — ship and let data collect ~2 weeks.
3. Phase 2 (TMDB) — better-looking, automated content.
4. Phase 3 Option A (LLM recs) — turn signal into personalized picks.
5. Phase 4 (cron) — stop sending manually.
6. Phase 5 (web surface) — stickiness + more signal.
7. Phase 6.1 → 6.2 → 6.3 (monetization), once engagement is real.
8. Phase 3 Option B (pgvector) — when you want a durable engine you own.
