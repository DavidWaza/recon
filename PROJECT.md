# Recon — Full Project Documentation

> **Recon** is a multi-platform movie recommendation newsletter. Every Friday it delivers hand-curated, high-IMDb-rated films from Netflix, Prime Video, Max, Apple TV+, and more — with trailer links and where-to-watch links — straight to the subscriber’s inbox.

| | |
|---|---|
| **Product name** | Recon |
| **Primary domain** | `https://recon.com.ng` (override with `NEXT_PUBLIC_SITE_URL`) |
| **Repo** | `recon-app` |
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase · Nodemailer (Gmail) · Framer Motion · Sonner · Cloudinary · Google AdSense |
| **Version** | `0.1.0` |

This document describes the **entire** codebase as it exists today — every route, component, service, table, email template, admin surface, env var, and third-party integration. Nothing is left out. Companion roadmap: [`recommendation-engine-build-guide_1.md`](./recommendation-engine-build-guide_1.md).

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Tech stack & scripts](#2-tech-stack--scripts)
3. [Repository layout](#3-repository-layout)
4. [Architecture](#4-architecture)
5. [Getting started](#5-getting-started)
6. [Environment variables](#6-environment-variables)
7. [Pages (App Router)](#7-pages-app-router)
8. [API routes](#8-api-routes)
9. [Components](#9-components)
10. [Library (`lib/`)](#10-library-lib)
11. [Client services (`services/`)](#11-client-services-services)
12. [Data & genres](#12-data--genres)
13. [Database (Supabase)](#13-database-supabase)
14. [Email system](#14-email-system)
15. [Admin surfaces](#15-admin-surfaces)
16. [Auth & security](#16-auth--security)
17. [Design system](#17-design-system)
18. [AdSense](#18-adsense)
19. [Cloudinary](#19-cloudinary)
20. [Third-party integrations](#20-third-party-integrations)
21. [Config files](#21-config-files)
22. [Static / legacy assets](#22-static--legacy-assets)
23. [Related documentation](#23-related-documentation)
24. [Roadmap status](#24-roadmap-status)
25. [Known gaps & inconsistencies](#25-known-gaps--inconsistencies)

---

## 1. Product overview

### What Recon does today

1. **Landing page** — cinematic hero with rotating picks, subscribe CTA, featured picks grid, how-it-works, why Recon, FAQ, footer.
2. **Subscribe flow** — email → Supabase `subscribers` → welcome email → optional preference quiz.
3. **Weekly picks admin** — compose this week’s films (title, genres, IMDb, poster, trailer, watch link) → save to `weekly_picks` → batch-email active subscribers.
4. **News / updates admin** — branded broadcast emails with optional images (Cloudinary), numbered steps, and CTA toggle.
5. **Feedback loop (email links)** — Love / Not for me / Save → `recommendations.feedback` → `/thanks`.
6. **Unsubscribe** — one-click via opaque token.
7. **Preferences page** — `/preferences?token=…` for genre likes/dislikes and liked movies.
8. **AdSense** — site-wide script + optional display units on the homepage.

### What is not built yet

Personalization engine (TMDB catalogue sync, LLM/pgvector recs, Vercel cron automation, Stripe premium). See [§24](#24-roadmap-status).

---

## 2. Tech stack & scripts

### Runtime

| Package | Role |
|---------|------|
| `next@16.2.6` | App Router framework |
| `react` / `react-dom@19.2.4` | UI |
| `@supabase/supabase-js` | Database |
| `nodemailer` | SMTP email (Gmail) |
| `axios` | Client HTTP to `/api/*` |
| `framer-motion` | Landing / quiz animations |
| `sonner` | Toast notifications |
| `resend` | Installed — **not used** by the send path |
| `@react-email/components` + `render` | Installed — **unused**; templates are HTML strings |

### Dev

| Package | Role |
|---------|------|
| `typescript@5` | Types |
| `tailwindcss@4` + `@tailwindcss/postcss` | Styling |
| `eslint` + `eslint-config-next` | Lint |

### Scripts (`package.json`)

```bash
npm run dev    # next dev
npm run build  # next build
npm run start  # next start
npm run lint   # eslint
```

---

## 3. Repository layout

```
recon-app/
├── app/                          # Next.js App Router — pages, layout, API
│   ├── api/                      # HTTP API routes
│   │   ├── admin/
│   │   │   ├── send-picks/       # Weekly picks broadcast
│   │   │   └── send-to-waitlist/ # News broadcast (to subscribers)
│   │   ├── subscribe/
│   │   ├── unsubscribe/
│   │   ├── waitlist/
│   │   ├── preferences/
│   │   ├── feedback/
│   │   └── send-random-email/
│   ├── lock-waza-secret/         # Admin UI (obscure path)
│   │   └── send-message/
│   ├── dashboard/
│   ├── preferences/
│   ├── preview/
│   ├── privacy/
│   ├── terms/
│   ├── thanks/
│   ├── unsubscribed/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Home / landing
├── components/
│   ├── admin/                    # GenrePicker
│   ├── ads/                      # AdSense script + banners
│   ├── dashboard/
│   ├── email/
│   ├── landing/
│   ├── layout/                   # Navbar, Hero, Sidebar
│   ├── movie/
│   ├── preferences/
│   ├── providers/
│   └── ui/
├── lib/
│   ├── data/                     # movies.ts, genres.ts
│   ├── emails/                   # welcome, weekly-picks, news, shell
│   ├── adsense.ts
│   ├── api.ts
│   ├── email.ts                  # Canonical sendEmail()
│   ├── nodemailer.ts
│   ├── resend.ts                 # Stub (unused)
│   ├── supabase.ts
│   ├── types.ts
│   └── urls.ts
├── services/                     # Client wrappers + Cloudinary
├── public/                       # logo.png, icons, SVGs
├── _news.cjs                     # Legacy CommonJS news HTML
├── news-preview.html
├── weekly-picks-preview.html
├── AGENTS.md / CLAUDE.md
├── README.md                     # Stock create-next-app (outdated vs product)
├── recommendation-engine-build-guide_1.md
├── PROJECT.md                    # ← this file
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
└── package.json
```

Excluded from docs focus: `node_modules/`, `.next/`, `.git/`, `.env.local` (secrets — never commit).

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Marketing site                          │
│  /  → LandingPage (hero, featured picks from weekly_picks ISR)  │
│  AdSense script (root layout) + optional AdBanner units         │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST /api/subscribe
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  subscribers table  →  welcome email (Gmail SMTP)               │
│  PreferenceQuiz modal → POST /api/preferences                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Admin: /lock-waza-secret                                       │
│    → POST /api/admin/send-picks (Bearer ADMIN_SECRET_KEY)       │
│    → insert/update weekly_picks + batch weekly picks emails     │
│  Admin: /lock-waza-secret/send-message                          │
│    → Cloudinary uploads → POST /api/admin/send-to-waitlist      │
│    → news emails to all subscribed=true                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Email deep links                                               │
│    Unsubscribe  → GET/POST /api/unsubscribe?token=…             │
│    Feedback     → GET /api/feedback?r=…&a=up|down|saved         │
│    Preferences  → /preferences?token=…                          │
└─────────────────────────────────────────────────────────────────┘
```

**Home data loading:** `app/page.tsx` queries `weekly_picks` ordered by `sent_at`, keeps the latest batch, maps to `Movie[]`. `revalidate = 60` (ISR). If Supabase fails or returns empty, falls back to static data in `lib/data/movies.ts`.

---

## 5. Getting started

```bash
# Install
npm install

# Create .env.local (see §6)
# Then:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin (local):

- Weekly picks: [http://localhost:3000/lock-waza-secret](http://localhost:3000/lock-waza-secret)
- News: [http://localhost:3000/lock-waza-secret/send-message](http://localhost:3000/lock-waza-secret/send-message)

> **Agent note:** This Next.js version may differ from older training data. Prefer guides under `node_modules/next/dist/docs/` when APIs look unfamiliar (`AGENTS.md` / `CLAUDE.md`).

---

## 6. Environment variables

Create `.env.local` in the project root. Never commit it.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Fallback if service role missing |
| `SUPABASE_SERVICE_ROLE_KEY` | Strongly recommended | Server admin client for inserts/updates |
| `GMAIL_USER` | Yes (for email) | SMTP From / auth user |
| `GMAIL_APP_PASSWORD` | Yes (for email) | Gmail app password |
| `ADMIN_SECRET_KEY` | Yes (for admin APIs) | Server-side Bearer check |
| `NEXT_PUBLIC_ADMIN_SECRET_KEY` | Yes (for admin UI) | Client sends this as `Authorization` — **visible in the browser bundle** |
| `NEXT_PUBLIC_SITE_URL` | Optional | Defaults to `https://recon.com.ng` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For news image uploads | Cloudinary cloud |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For news image uploads | Unsigned upload preset |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID` | Optional | Mid-page display unit |
| `NEXT_PUBLIC_ADSENSE_SLOT` | Optional | Fallback slot for mid-page |
| `NEXT_PUBLIC_ADSENSE_SLOT_HOME_FOOTER` | Optional | Lower landing display unit |
| `RESEND_API_KEY` | No | Present in some envs / stub file — **sending uses Gmail**, not Resend |

\*Code falls back to anon key if service role is unset (with a console warning). Prefer service role on the server.

**Guide-only (not wired in app code yet):** `TMDB_TOKEN`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, Stripe keys.

---

## 7. Pages (App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing. ISR 60s. Loads latest `weekly_picks` for hero + featured section. |
| `/dashboard` | `app/dashboard/page.tsx` | Client dashboard over **static** movie data (favorites/local UI state). |
| `/preferences` | `app/preferences/page.tsx` | Preference UI; accepts `?token=` from emails. |
| `/preview` | `app/preview/page.tsx` | Visual mock of a weekly newsletter in-browser. |
| `/thanks` | `app/thanks/page.tsx` | Post-feedback thank-you (`?a=up\|down\|saved`). |
| `/unsubscribed` | `app/unsubscribed/page.tsx` | Confirmation after unsubscribe. |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy. |
| `/terms` | `app/terms/page.tsx` | Terms of service. |
| `/lock-waza-secret` | `app/lock-waza-secret/page.tsx` | **Admin** — weekly picks composer + test/broadcast. |
| `/lock-waza-secret/send-message` | `app/lock-waza-secret/send-message/page.tsx` | **Admin** — news/announcement composer. |

### Root layout (`app/layout.tsx`)

- Font: **Inter** via `next/font/google`
- Global CSS tokens
- Site metadata (title, description, OG)
- `<AdSenseScript />` (site-wide)
- `<ToastProvider />` (Sonner)

---

## 8. API routes

### Public / token-based

| Method | Path | Body / query | Behavior |
|--------|------|--------------|----------|
| `POST` | `/api/subscribe` | `{ email }` | Insert `subscribers`, send welcome email. Duplicate → 409. |
| `POST` | `/api/send-random-email` | `{ email }` | Same pattern as subscribe (alternate endpoint). |
| `POST` | `/api/waitlist` | `{ email }` | Insert `waitlist`, optional confirmation email, return queue position. |
| `GET`/`POST` | `/api/unsubscribe` | `token` or `id` | Set `subscribed = false`. GET redirects to `/unsubscribed`. |
| `GET`/`POST` | `/api/preferences` | token + genres / movies | Load or upsert `preferences` for a subscriber. |
| `GET` | `/api/feedback` | `r` (rec id), `a` (`up`\|`down`\|`saved`) | Update `recommendations.feedback`, redirect `/thanks`. |

### Admin (Bearer `ADMIN_SECRET_KEY`)

| Method | Path | Behavior |
|--------|------|----------|
| `POST` | `/api/admin/send-picks` | Modes: `test` / `all`. Saves picks to `weekly_picks`, emails weekly picks HTML. Batches of 50. |
| `POST` | `/api/admin/send-to-waitlist` | Modes: `test` / `all`. News HTML to **active subscribers** (name is historical). Batches of 10 + 500ms delay. Accepts subject, kicker, title, body, stepsText, images, ctaText/ctaUrl. |

Unauthorized admin calls → `401`.

---

## 9. Components

### `components/admin/`

| File | Purpose |
|------|---------|
| `GenrePicker.tsx` | Searchable chip UI for picking genres on weekly picks admin (quick picks + full list). |

### `components/ads/`

| File | Purpose |
|------|---------|
| `AdSenseScript.tsx` | Next.js `<Script>` loader for `adsbygoogle.js` with publisher ID. |
| `AdBanner.tsx` | Responsive display unit; no-ops if slot ID empty. |

### `components/dashboard/`

| File | Purpose |
|------|---------|
| `DashboardClient.tsx` | Tabs (home / weekly / favorites / settings), filters, local favorites, static data. |

### `components/email/`

| File | Purpose |
|------|---------|
| `WaitlistForm.tsx` | Email form → `/api/waitlist`. |
| `EmailPreviewCard.tsx` | Movie row for `/preview`. |
| `welcome.tsx` | React mock welcome UI (legacy styling; **not** the production send template). |

### `components/landing/`

| File | Purpose |
|------|---------|
| `LandingPage.tsx` | Composes Navbar, Hero, Featured, AdBanners, HowItWorks, WhyRecon, FAQ, Footer, PreferenceQuiz. |
| `HowItWorks.tsx` | Three-step explainer. |
| `WhyRecon.tsx` | Value props. |
| `FAQ.tsx` | Accordion FAQ. |
| `Footer.tsx` | Footer, logo, legal links. |
| `PreferenceQuiz.tsx` | Post-subscribe modal quiz → save preferences. |

### `components/layout/`

| File | Purpose |
|------|---------|
| `Navbar.tsx` | Top navigation. |
| `HeroSection.tsx` | Full-bleed rotating hero + subscribe CTA; exports **`HeroPreviewSection`** (Featured picks cards with Watch Trailer / Where to Watch). |
| `Sidebar.tsx` | Dashboard sidebar. |

### `components/movie/`

| File | Purpose |
|------|---------|
| `MovieCard.tsx` | Poster card, genres, trailer button, optional favorite. |
| `MovieCardSkeleton.tsx` | Loading placeholder. |
| `MovieGrid.tsx` | Grid layout of cards. |
| `GenreTag.tsx` | Genre chip. |
| `RatingBadge.tsx` | IMDb-style rating. |

### `components/preferences/`

| File | Purpose |
|------|---------|
| `PreferencesClient.tsx` | Standalone preferences page UI (token / email lookup). |

### `components/providers/`

| File | Purpose |
|------|---------|
| `ToastProvider.tsx` | Sonner toaster. |

### `components/ui/`

| File | Purpose |
|------|---------|
| `CTAButton.tsx` | Primary / secondary / ghost CTA button. |
| `ConfirmDialog.tsx` | Confirm/cancel modal (admin broadcast safety). |
| `EmptyState.tsx` | Empty favorites / empty filter results. |

---

## 10. Library (`lib/`)

| File | Purpose |
|------|---------|
| `supabase.ts` | Server-only `supabaseAdmin` client. Prefers `SUPABASE_SERVICE_ROLE_KEY`, falls back to anon. |
| `email.ts` | **`sendEmail(to, subject, html, unsubscribeToken?)`** — Nodemailer + List-Unsubscribe headers. |
| `nodemailer.ts` | Gmail transport factory (`GMAIL_USER` / `GMAIL_APP_PASSWORD`). |
| `resend.ts` | Resend client init — **not imported by routes**. |
| `urls.ts` | `SITE_URL`, `unsubscribeUrl(token)`, `feedbackUrl(id, action)`. |
| `adsense.ts` | Publisher ID `ca-pub-7801685874493098` + slot env mapping. |
| `api.ts` | Axios instance `baseURL: "/api"`. |
| `types.ts` | `Movie`, `SortOption`, `ViewMode`. |
| `data/movies.ts` | Static catalogue + `weeklyPicks`, `trendingPicks`, hero slices, `allGenres` (merged with `ALL_GENRES`). |
| `data/genres.ts` | Canonical genre / sub-genre list (`ALL_GENRES` / `GENRE_OPTIONS`). |
| `emails/shell.ts` | Reusable RECON navy/orange email shell (logo header + footer). |
| `emails/welcome.ts` | Welcome HTML. |
| `emails/weekly-picks.ts` | Friday picks HTML + feedback buttons. |
| `emails/news.ts` | News body builder + `newsEmailHtml` + `parseStepsFromText`. |

---

## 11. Client services (`services/`)

| File | Calls | Purpose |
|------|-------|---------|
| `subscribe.ts` | `POST /api/subscribe` | Hero / landing subscribe. |
| `waitlist.ts` | `POST /api/waitlist` | Waitlist form. |
| `send-email.ts` | `/api/send-random-email` (+ thin admin helper) | Alternate send helpers. |
| `preferences.ts` | `/api/preferences` | Save / load prefs from quiz & preferences page. |
| `cloudinary.ts` | Cloudinary unsigned upload | News admin image uploads; exposes `cloudinaryConfigured`. |

---

## 12. Data & genres

### Static movies (`lib/data/movies.ts`)

Hard-coded `Movie[]` used for:

- Fallback when Supabase weekly picks are empty
- Dashboard / preview demos
- Exports: `weeklyPicks`, `trendingPicks`, `previewMovies`, `heroPreviewMovies`, `heroCarouselMovies`, `allGenres`

Posters often hosted on Cloudinary (`res.cloudinary.com/dgbl43ljm/…`) or other CDNs allowed in `next.config.ts`.

### Genres (`lib/data/genres.ts`)

Single source of truth for admin GenrePicker, preference quiz chips, and dashboard filters. Includes core genres (Action, Drama, Horror, …) and many sub-genres (Whodunnit, Buddy Comedy, Korean, Dark Romance, Dystopian, Political Drama, Desert, Psychological Thriller, etc.).

**To add a genre:** edit `ALL_GENRES` only — UI surfaces pick it up automatically.

---

## 13. Database (Supabase)

All DB access goes through **`supabaseAdmin`** on the server. There is no Supabase Auth / browser client for user sessions.

### Tables used in code

| Table | Operations | Notable columns |
|-------|------------|-----------------|
| `subscribers` | insert, select, update | `id`, `email`, `subscribed`, `unsubscribe_token`, `created_at` |
| `waitlist` | insert, count | `email`, `created_at` |
| `weekly_picks` | insert, select, update `sent_at` | `title`, `description`, `genre`, `imdb_rating`, `poster_url`, `trailer_url`, `netflix_url`, `sent_at`, `id` |
| `preferences` | select, upsert on `subscriber_id` | `favorite_genres`, `disliked_genres`, `liked_movies`, `updated_at` |
| `recommendations` | update `feedback` | `id`, `feedback` (`up` / `down` / `saved`) |

Schema sketches and future tables (`movies` catalogue, richer recommendation inserts, `tier`) live in `recommendation-engine-build-guide_1.md`.

### Important query patterns

- **Home ISR:** latest `sent_at` batch from `weekly_picks`.
- **Broadcasts:** `subscribed = true` (with fallback select if `unsubscribe_token` column missing).
- **Unsubscribe:** match `unsubscribe_token`, else `id`.

---

## 14. Email system

### Delivery

Almost every production send uses:

```
lib/email.ts → sendEmail() → lib/nodemailer.ts (Gmail SMTP)
```

**Exception:** `/api/waitlist` calls the transporter directly with inline HTML.

Headers set when a token is available: `List-Unsubscribe`, `List-Unsubscribe-Post`.

### Templates

| Template | Module | Trigger |
|----------|--------|---------|
| Welcome | `lib/emails/welcome.ts` | Subscribe / send-random-email |
| Weekly picks | `lib/emails/weekly-picks.ts` | Admin send-picks |
| News / updates | `lib/emails/news.ts` + `shell.ts` | Admin send-to-waitlist |
| Waitlist confirm | Inline in waitlist route | Waitlist POST |

### News / shell brand

Static chrome (always the same):

- Orange top bar
- RECON logo in white rounded box (`${SITE_URL}/logo.png`)
- Footer: `RECON · YOUR MOVIE COMPANION`, unsubscribe + preferences links

Dynamic body: eyebrow (kicker), headline (supports `**orange accent**`), paragraphs, images, numbered steps, optional CTA pill, disclaimer with `[Privacy Policy](url)` links.

### Batching

| Broadcast | Batch size | Throttle |
|-----------|------------|----------|
| Weekly picks | 50 | — |
| News | 10 | 500ms between batches |

### Offline HTML previews

- `news-preview.html`
- `weekly-picks-preview.html`
- `_news.cjs` — older indigo-themed CommonJS news helper

---

## 15. Admin surfaces

### Weekly picks — `/lock-waza-secret`

- Multi-pick form: title, IMDb select, description, **GenrePicker**, trailer URL, poster URL, watch link.
- Draft persisted in `localStorage` key `recon-admin-picks`.
- Live iframe preview of weekly picks email.
- **Send test to myself** (no broadcast).
- **Save & send to all** → confirmation modal → `/api/admin/send-picks`.

### News — `/lock-waza-secret/send-message`

- Subject, eyebrow, headline (`**accent**`), message, numbered steps textarea, Cloudinary images, optional CTA toggle.
- Live preview via `newsEmailHtml`.
- Test send + broadcast with confirmation modal.
- Posts to `/api/admin/send-to-waitlist`.

### Auth on admin APIs

```
Authorization: Bearer ${ADMIN_SECRET_KEY}
```

UI uses `NEXT_PUBLIC_ADMIN_SECRET_KEY` (must match server secret).

There is **no login page**. Path obscurity + shared secret only. See [§16](#16-auth--security).

---

## 16. Auth & security

| Mechanism | Scope |
|-----------|--------|
| Public | Marketing pages, dashboard, legal |
| Opaque URL tokens | Unsubscribe, preferences, feedback |
| Bearer `ADMIN_SECRET_KEY` | `/api/admin/*` only |
| No `middleware.ts` | — |
| No user sessions / Supabase Auth | Email identity = subscriber row + token |
| Duplicate email | Postgres unique → HTTP 409 |

**Risks to be aware of:**

1. Admin UI embeds the secret as `NEXT_PUBLIC_*` — extractable from client JS.
2. Admin paths are guessable if the secret leaks; treat the secret as a password and rotate if exposed.
3. Prefer moving admin auth to server-only cookies / Supabase auth for production hardening.

---

## 17. Design system

### Site (`app/globals.css`)

| Token | Approx value | Use |
|-------|--------------|-----|
| `--background` | `#1b1f3b` | Page background |
| `--card` | `#11162a` | Cards / panels |
| `--border` | `#2a2f4a` | Borders |
| `--accent` | `#4f46e5` | Primary CTA (indigo) |
| `--accent-hover` | `#6366f1` | Hover |
| `--success` | `#22c55e` | Success states |
| `--foreground` | `#ffffff` | Body text |
| `--muted` | `#a1a1aa` | Secondary text |

**Font:** Inter (`--font-inter`). Dark navy UI, indigo accents, Framer Motion on landing.

### News email brand (`RECON_EMAIL` in `lib/emails/shell.ts`)

Navy `#1B2240` / `#243055` / `#151C34`, orange `#E8913A`, text `#E8ECF4`, muted `#8B95AD`.

Welcome / weekly-picks emails use indigo film-strip styling (separate from the news navy/orange shell).

---

## 18. AdSense

| Item | Value |
|------|-------|
| Publisher ID | `ca-pub-7801685874493098` (`lib/adsense.ts`) |
| Script | Loaded in root layout via `AdSenseScript` (`afterInteractive`) |
| Homepage mid | After Featured picks, before How it works (`ADSENSE_SLOTS.homeMid`) |
| Homepage lower | After Why Recon, before FAQ (`ADSENSE_SLOTS.homeFooter`) |

Equivalent script:

```html
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7801685874493098"
  crossorigin="anonymous"></script>
```

Display units render only when slot env vars are set. Auto ads can still run from the global script if enabled in the AdSense dashboard.

---

## 19. Cloudinary

Used for **unsigned client uploads** on the news admin page (`services/cloudinary.ts`).

Required env:

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

Returned `secure_url` values are embedded in the news email HTML.

Many static movie posters in `lib/data/movies.ts` also live on Cloudinary.

---

## 20. Third-party integrations

| Service | Status | Role |
|---------|--------|------|
| Supabase | Active | Database |
| Gmail / Nodemailer | Active | All real email |
| Cloudinary | Active | Admin uploads + many poster URLs |
| Google AdSense | Active | Ads script + optional banners |
| TMDB CDN | Images only | Allowed remote patterns; no TMDB API client in repo |
| Resend | Installed / unused | Stub only |
| React Email | Installed / unused | Templates are plain HTML |
| Framer Motion | Active | Motion on landing |
| Sonner | Active | Toasts |
| Axios | Active | Client → API |
| Anthropic / Stripe / Vercel Cron | Roadmap only | Not implemented |
| Vercel | Implied host | No `vercel.json` in repo |

`next.config.ts` `images.remotePatterns` allow:

- `image.tmdb.org`, `media.themoviedb.org`
- `people.com`, `th.bing.com`, `www.imdb.com`, `www.netflix.com`
- `res.cloudinary.com`, `www.res.cloudinary.com`

---

## 21. Config files

| File | Notes |
|------|-------|
| `package.json` | Scripts + deps (see §2) |
| `tsconfig.json` | Path alias `@/*` → project root |
| `next.config.ts` | Remote image hosts |
| `postcss.config.mjs` | Tailwind 4 PostCSS plugin |
| `eslint.config.mjs` | `eslint-config-next` (core-web-vitals + TS) |
| `.vscode/settings.json` | Editor settings |
| `.gitignore` | Ignores `.env*`, `.next`, `node_modules`, etc. |

---

## 22. Static / legacy assets

### `public/`

- `logo.png` — RECON popcorn brand mark (email header + footer UI)
- `icon.png`, `favicon.ico`
- `netflix-logo.png`
- Assorted SVGs (`file.svg`, `globe.svg`, `next.svg`, `window.svg`)

### App icons

- `app/icon.png`, `app/apple-icon.png`

### Legacy / offline

- `_news.cjs` — older news HTML builder
- `news-preview.html`, `weekly-picks-preview.html` — open in a browser for design checks without the app

---

## 23. Related documentation

| File | What it covers |
|------|----------------|
| `PROJECT.md` | **This file** — complete current-state reference |
| `recommendation-engine-build-guide_1.md` | Phased product roadmap (schema, TMDB, LLM, cron, monetization) |
| `AGENTS.md` / `CLAUDE.md` | Coding-agent guidance for this Next.js version |
| `README.md` | Stock Next.js starter text (not product-specific) |

---

## 24. Roadmap status

Mapped from `recommendation-engine-build-guide_1.md`:

| Phase | Theme | Status in repo |
|-------|--------|----------------|
| 0 | Email foundations (SMTP, unsubscribe, welcome) | **Done** (Gmail path) |
| 1 | Feedback loop, preferences table, preference quiz | **Mostly done** (feedback needs recommendation rows on send) |
| 2 | TMDB catalogue | **Not started** |
| 3 | LLM / vector recommendations | **Not started** |
| 4 | Vercel cron automated Friday send | **Not started** (manual admin send) |
| 5 | Web stickiness / rich dashboard | **Partial** (UI mock, not personalized) |
| 6 | Monetization (affiliate, AdSense, Stripe) | **AdSense started**; Stripe / affiliate not started |

---

## 25. Known gaps & inconsistencies

1. **Privacy copy** may still mention Resend / no ads while delivery is Gmail and AdSense is installed — keep legal pages in sync.
2. **`/api/admin/send-to-waitlist`** emails **subscribers**, not the `waitlist` table (historical name).
3. **Dual list systems:** `subscribers` (main) and `waitlist` (WaitlistForm still present on hero area).
4. **Dual subscribe APIs:** `/api/subscribe` and `/api/send-random-email` overlap.
5. **Admin secret** exposed via `NEXT_PUBLIC_ADMIN_SECRET_KEY`.
6. **Dashboard** is mostly static mock; preference + feedback tables exist for a future engine.
7. **`@react-email` / `resend`** dependencies are unused by the live send path.
8. **Recommendation inserts** on weekly send may be incomplete relative to Phase 1 of the build guide — feedback links need real `recommendations` rows.

---

## Quick reference — “where do I…?”

| Task | Where |
|------|--------|
| Change homepage hero / featured UI | `components/layout/HeroSection.tsx`, `components/landing/LandingPage.tsx` |
| Change genres list | `lib/data/genres.ts` |
| Change welcome email HTML | `lib/emails/welcome.ts` |
| Change weekly picks email HTML | `lib/emails/weekly-picks.ts` |
| Change news email / brand shell | `lib/emails/news.ts`, `lib/emails/shell.ts` |
| Add API endpoint | `app/api/.../route.ts` |
| Change admin weekly picks UI | `app/lock-waza-secret/page.tsx`, `components/admin/GenrePicker.tsx` |
| Change news admin UI | `app/lock-waza-secret/send-message/page.tsx` |
| Change SMTP / From address | `lib/nodemailer.ts`, `lib/email.ts`, env |
| Change AdSense publisher / slots | `lib/adsense.ts`, env |
| Change site colors | `app/globals.css` |
| Change site URL used in emails | `NEXT_PUBLIC_SITE_URL` / `lib/urls.ts` |

---

*Generated as a living map of the Recon codebase. Update this file when you add routes, tables, or integrations.*
