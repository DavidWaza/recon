import { SITE_URL, feedbackUrl, unsubscribeUrl } from "@/lib/urls";

export type WeeklyPick = {
  id: string | number;
  title: string;
  genre?: string;
  description?: string;
  imdb_rating?: number | string;
  poster_url?: string;
  /** Full YouTube URL, or pass `trailer_youtube_id` instead. */
  trailer_url?: string;
  trailer_youtube_id?: string;
  /** Direct link to wherever it streams. `netflix_url` kept for back-compat. */
  watch_url?: string;
  netflix_url?: string;
};

/**
 * Weekly picks newsletter (multi-platform).
 *
 * Built email-safe: table layout, NO flexbox, NO inline <svg> (Gmail/Outlook
 * strip both). Icons are emoji. Wires in three guide rules that live in the
 * email:
 *  - Tracked feedback links per movie (Phase 1.3) — point at /api/feedback.
 *  - A clearly-labelled sponsor slot (Phase 6.2) — self-promo until sold.
 *  - A real one-click unsubscribe link driven by the subscriber token (Phase 0.5).
 */
export function weeklyPicksEmailHtml(
  email: string,
  picks: WeeklyPick[],
  unsubscribeToken?: string,
) {
  const accent = "#6366f1";
  const accentDeep = "#4f46e5";

  const filmStrip = (bg: string, hole: string) => `
    <div style="height:24px;background-color:${bg};background-image:repeating-linear-gradient(90deg, ${hole} 0, ${hole} 18px, transparent 18px, transparent 30px);"></div>`;

  // One row of tracked feedback links per movie (guide Phase 1.3).
  const feedbackRow = (id: string | number) => `
    <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #2a2a2a;">
      <span style="display:inline-block;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#555;margin-right:10px;">Rate this pick</span>
      <a href="${feedbackUrl(id, "up")}" style="display:inline-block;font-size:12px;font-weight:600;color:#a5b4fc;text-decoration:none;margin-right:12px;">&#128077; Love it</a>
      <a href="${feedbackUrl(id, "down")}" style="display:inline-block;font-size:12px;font-weight:600;color:#8a8a8a;text-decoration:none;margin-right:12px;">&#128078; Not for me</a>
      <a href="${feedbackUrl(id, "saved")}" style="display:inline-block;font-size:12px;font-weight:600;color:#8a8a8a;text-decoration:none;">&#128278; Save</a>
    </div>`;

  const pickCards = picks
    .map((pick) => {
      const watchHref = pick.watch_url ?? pick.netflix_url;
      const trailerHref =
        pick.trailer_url ??
        (pick.trailer_youtube_id
          ? `https://www.youtube.com/watch?v=${pick.trailer_youtube_id}`
          : undefined);

      const poster = pick.poster_url
        ? `<img src="${pick.poster_url}" alt="" width="110" class="pick-poster-img" style="display:block;width:110px;height:170px;object-fit:cover;border-radius:9px 0 0 9px;" />`
        : `<div class="pick-poster-ph" style="width:110px;height:170px;background-color:#111;border-radius:9px 0 0 9px;text-align:center;line-height:170px;font-size:28px;">&#127902;</div>`;

      return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="pick-card"
        style="border:1px solid #262626;border-left:3px solid ${accent};border-radius:12px;background-color:#1a1a1a;margin-bottom:16px;">
        <tr>
          <td width="110" valign="top" class="pick-poster" style="padding:0;">${poster}</td>
          <td valign="top" class="pick-content" style="padding:16px 18px;">
            <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};">
              ${pick.genre ?? "Featured"}
            </p>
            <h3 style="margin:0 0 8px;font-size:17px;font-weight:700;color:#ffffff;line-height:1.3;">
              ${pick.title}
            </h3>
            <p style="margin:0 0 12px;font-size:13px;color:#8a8a8a;line-height:1.55;">
              ${pick.description ?? ""}
            </p>
            <div>
              <span style="display:inline-block;background-color:#222;border-radius:6px;padding:5px 10px;font-size:12px;font-weight:700;color:#facc15;margin:0 6px 6px 0;">
                &#11088; ${pick.imdb_rating ?? "—"} IMDb
              </span>
              ${
                trailerHref
                  ? `<a href="${trailerHref}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:5px 12px;border-radius:6px;border:1px solid #444;margin:0 6px 6px 0;">&#9654; Trailer</a>`
                  : ""
              }
              ${
                watchHref
                  ? `<a href="${watchHref}" style="display:inline-block;background-color:${accentDeep};color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:5px 12px;border-radius:6px;margin:0 6px 6px 0;">Where to watch</a>`
                  : ""
              }
            </div>
            ${feedbackRow(pick.id)}
          </td>
        </tr>
      </table>`;
    })
    .join("");

  // Clearly-labelled sponsor slot — self-promo until sold (guide Phase 6.2).
  const sponsorSlot = `
    <div style="margin-top:8px;border:1px dashed #33334a;border-radius:12px;background-color:#15151f;padding:18px 20px;text-align:center;">
      <p style="margin:0 0 6px;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#55556e;">Sponsored</p>
      <p style="margin:0;font-size:13px;color:#9a9ab0;line-height:1.6;">
        This slot is open. Put your brand in front of thousands of movie lovers every Friday &mdash;
        <a href="mailto:moviereconn@gmail.com?subject=Sponsoring%20recon" style="color:${accent};text-decoration:underline;">get in touch</a>.
      </p>
    </div>`;

  const unsubHref = unsubscribeToken
    ? unsubscribeUrl(unsubscribeToken)
    : `${SITE_URL}/api/unsubscribe`;

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>This Week's Top Picks</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .h1 { font-size: 22px !important; }
          /* Stack each pick: poster on top (full width), details below. */
          .pick-card {
            border-left-width: 1px !important;
            border-top: 3px solid ${accent} !important;
          }
          .pick-poster, .pick-content {
            display: block !important;
            width: 100% !important;
          }
          .pick-content { padding: 16px 18px 18px !important; }
          .pick-poster-img {
            width: 100% !important;
            height: auto !important;
            border-radius: 9px 9px 0 0 !important;
          }
          .pick-poster-ph {
            width: 100% !important;
            border-radius: 9px 9px 0 0 !important;
          }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0a0a0a;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation"
              style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;background-color:#141414;">

              <!-- Film strip top -->
              <tr><td style="padding:0;line-height:0;font-size:0;">${filmStrip("#111118", "#0a0a0a")}</td></tr>

              <!-- Header -->
              <tr>
                <td style="background-color:#111118;padding:30px 40px;">
                  <div style="font-size:30px;line-height:1;margin-bottom:12px;">&#127916;</div>
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td valign="bottom">
                        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Weekly Newsletter</p>
                        <h1 class="h1" style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">This Week's Top Picks</h1>
                      </td>
                      <td valign="bottom" align="right" style="white-space:nowrap;">
                        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);letter-spacing:1px;">${today}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Film strip bottom of header -->
              <tr><td style="padding:0;line-height:0;font-size:0;">${filmStrip("#0a0a0a", "#111118")}</td></tr>

              <!-- Picks -->
              <tr>
                <td style="background-color:#141414;padding:30px 32px;">
                  <p style="margin:0 0 20px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accent};">
                    &#9656; Now Streaming
                  </p>
                  ${pickCards}
                  ${sponsorSlot}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#0f0f0f;padding:0;">
                  <div style="height:1px;border-top:1px dashed #2a2a2a;font-size:0;line-height:0;">&nbsp;</div>
                  <div style="padding:20px 40px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;color:#3a3a3a;">
                      You're receiving this because you subscribed at <strong style="color:#555;">recon.com.ng</strong>
                    </p>
                    <p style="margin:0 0 10px;font-size:11px;">
                      <a href="${unsubHref}" style="color:#6b6b6b;text-decoration:underline;">Unsubscribe</a>
                      <span style="color:#222;margin:0 8px;">&middot;</span>
                      <a href="${SITE_URL}" style="color:#6b6b6b;text-decoration:underline;">View in browser</a>
                    </p>
                    <p style="margin:0;font-size:10px;color:#2f2f2f;line-height:1.5;">
                      Movie data and posters provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
