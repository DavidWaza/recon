import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransporter } from "@/lib/nodemailer";

export async function POST(req: Request) {
  // Protect the route with a secret key
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { picks } = await req.json();

  if (!picks || picks.length === 0) {
    return NextResponse.json({ error: "No picks provided" }, { status: 400 });
  }

  // 1. Save picks to Supabase
  const { data: savedPicks, error: picksError } = await supabaseAdmin
    .from("weekly_picks")
    .insert(picks)
    .select();

  if (picksError) {
    console.error("Supabase picks error:", picksError);
    return NextResponse.json({ error: picksError.message }, { status: 500 });
  }

  // 2. Fetch all subscribers
  const { data: subscribers, error: subError } = await supabaseAdmin
    .from("subscribers")
    .select("email");

  if (subError) {
    console.error("Supabase subscribers error:", subError);
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({
      success: true,
      sent: 0,
      message: "No active subscribers",
    });
  }

  const senderEmail =
    process.env.RESEND_FROM_EMAIL ?? "moviereconn@gmail.com";

  // 3. Send emails in batches (nodemailer rate limit)
  const BATCH_SIZE = 50;
  let totalSent = 0;
  let totalFailed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emailPromises = batch.map(({ email }) =>
      getTransporter().sendMail({
        from: `recon <${senderEmail}>`,
        to: email,
        subject: `🎬 This week's top Netflix picks are here!`,
        html: weeklyPicksEmailTemplate(email, picks),
      })
    );

    const results = await Promise.allSettled(emailPromises);
    results.forEach((r) => {
      if (r.status === "fulfilled") totalSent++;
      else {
        totalFailed++;
        console.error("Email failed:", r.reason);
      }
    });
  }

  // 4. Mark picks as sent
  await supabaseAdmin
    .from("weekly_picks")
    .update({ sent_at: new Date().toISOString() })
    .in(
      "id",
      savedPicks.map((p: any) => p.id),
    );

  return NextResponse.json({
    success: true,
    sent: totalSent,
    failed: totalFailed,
  });
}

function weeklyPicksEmailTemplate(email: string, picks: any[]) {
  const filmHoles = Array(22)
    .fill(
      `<div style="width:18px;height:16px;background:#111118;border-radius:3px;flex-shrink:0;"></div>`
    )
    .join("");

  const filmStrip = `
    <div style="background:#0a0a0a;height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;overflow:hidden;">
      ${filmHoles}
    </div>`;

  const ticketDivider = `
    <div style="display:flex;align-items:center;margin:0 0 20px;">
      <div style="flex:1;height:1px;background:repeating-linear-gradient(90deg,#2a2a2a 0,#2a2a2a 6px,transparent 6px,transparent 12px);"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#0a0a0a;border:1px solid #2a2a2a;flex-shrink:0;margin:0 -1px;"></div>
      <div style="flex:1;height:1px;background:repeating-linear-gradient(90deg,#2a2a2a 0,#2a2a2a 6px,transparent 6px,transparent 12px);"></div>
    </div>`;

  const clapperboardSVG = `
    <svg width="44" height="36" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:16px;">
      <rect x="0" y="10" width="44" height="26" rx="3" fill="#1f1f2e" stroke="#333" stroke-width="1"/>
      <rect x="0" y="10" width="44" height="8" rx="2" fill="#E50914"/>
      <line x1="8" y1="10" x2="4" y2="18" stroke="#0a0a0a" stroke-width="3"/>
      <line x1="16" y1="10" x2="12" y2="18" stroke="#0a0a0a" stroke-width="3"/>
      <line x1="24" y1="10" x2="20" y2="18" stroke="#0a0a0a" stroke-width="3"/>
      <line x1="32" y1="10" x2="28" y2="18" stroke="#0a0a0a" stroke-width="3"/>
      <line x1="40" y1="10" x2="36" y2="18" stroke="#0a0a0a" stroke-width="3"/>
      <rect x="2" y="2" width="40" height="10" rx="2" fill="#E50914" transform="rotate(-8 22 7)"/>
      <line x1="10" y1="0" x2="6" y2="10" stroke="#0a0a0a" stroke-width="3" transform="rotate(-8 22 7)"/>
      <line x1="18" y1="0" x2="14" y2="10" stroke="#0a0a0a" stroke-width="3" transform="rotate(-8 22 7)"/>
      <line x1="26" y1="0" x2="22" y2="10" stroke="#0a0a0a" stroke-width="3" transform="rotate(-8 22 7)"/>
      <line x1="34" y1="0" x2="30" y2="10" stroke="#0a0a0a" stroke-width="3" transform="rotate(-8 22 7)"/>
    </svg>`;

  // Inline SVG icons (no external font dependency — works in all email clients)
  const playIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;margin-right:5px;"><polygon points="5,3 19,12 5,21"/></svg>`;
  const watchIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:inline-block;vertical-align:middle;margin-right:5px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
  const starIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15" style="display:inline-block;vertical-align:middle;margin-right:4px;"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;

  const pickCards = picks
    .map(
      (pick, i) => `
    ${i > 0 ? ticketDivider : ""}
    <div style="margin-bottom:0;border:1px solid #262626;border-radius:12px;overflow:hidden;background:#1a1a1a;position:relative;">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#E50914;border-radius:0;"></div>
      <div class="pick-inner" style="display:flex;flex-direction:row;">
        <div class="pick-poster" style="flex-shrink:0;width:110px;">
          ${
            pick.poster_url
              ? `<img src="${pick.poster_url}" alt="${pick.title}"
                  style="display:block;width:110px;height:100%;min-height:160px;object-fit:cover;" />`
              : `<div style="width:110px;min-height:160px;background:#111;display:flex;align-items:center;justify-content:center;">
                  <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="#333" stroke-width="1.5"/>
                    <polygon points="16,13 30,20 16,27" fill="#E50914"/>
                  </svg>
                </div>`
          }
        </div>
        <div style="padding:16px 16px 16px 20px;flex:1;min-width:0;">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E50914;">
            ${pick.genre ?? "Featured"}
          </p>
          <h3 style="margin:0 0 8px;font-size:17px;font-weight:700;color:#ffffff;line-height:1.3;">
            ${pick.title}
          </h3>
          <p style="margin:0 0 12px;font-size:13px;color:#8a8a8a;line-height:1.55;">
            ${pick.description ?? ""}
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            <span style="background:#222;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:700;color:#facc15;white-space:nowrap;">
              ${starIcon}${pick.imdb_rating} IMDb
            </span>
            ${
              pick.trailer_youtube_id
                ? `<a href="https://www.youtube.com/watch?v=${pick.trailer_youtube_id}"
                    style="display:inline-flex;align-items:center;background:#1a1a1a;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:4px 12px;border-radius:6px;border:1px solid #444;">
                    ${playIcon}Trailer
                  </a>`
                : ""
            }
            ${
              pick.netflix_url
                ? `<a href="${pick.netflix_url}"
                    style="display:inline-flex;align-items:center;background:#E50914;color:#ffffff;text-decoration:none;font-size:12px;font-weight:700;padding:4px 12px;border-radius:6px;">
                    ${watchIcon}Click to Watch
                  </a>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @media (max-width: 600px) {
          .pick-inner {
            flex-direction: column !important;
          }
          /* ~30% wider than desktop 110px → 143px on mobile */
          .pick-poster,
          .pick-poster img,
          .pick-poster > div {
            width: 100% !important;
            height: 180px !important;
            min-height: unset !important;
          }
          .pick-poster img {
            object-fit: cover !important;
          }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;">

              <!-- Film strip top -->
              <tr><td style="background:#0a0a0a;padding:0;">${filmStrip}</td></tr>

              <!-- Header -->
              <tr>
                <td style="background:#111118;padding:32px 40px;">
                  ${clapperboardSVG}
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:bottom;">
                        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Weekly Newsletter</p>
                        <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">This Week's Top Picks</h1>
                      </td>
                      <td style="vertical-align:bottom;text-align:right;white-space:nowrap;">
                        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);letter-spacing:1px;">
                          ${new Date()
                            .toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                            .toUpperCase()}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Film strip bottom of header -->
              <tr><td style="background:#111118;padding:0;">${filmStrip}</td></tr>

              <!-- Picks -->
              <tr>
                <td style="background-color:#141414;padding:32px;">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
                    <svg width="12" height="18" viewBox="0 0 14 20" fill="none">
                      <polygon points="7,0 14,8 10,8 10,20 4,20 4,8 0,8" fill="#E50914"/>
                    </svg>
                    <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#E50914;">Now Screening</p>
                  </div>
                  ${pickCards}
                </td>
              </tr>

              <!-- Footer tear line + content -->
              <tr>
                <td style="background:#0f0f0f;padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="20"><div style="width:20px;height:20px;border-radius:50%;background:#0a0a0a;margin-left:-10px;"></div></td>
                      <td style="background:repeating-linear-gradient(90deg,#2a2a2a 0,#2a2a2a 8px,transparent 8px,transparent 16px);height:1px;"></td>
                      <td width="20" style="text-align:right;"><div style="width:20px;height:20px;border-radius:50%;background:#0a0a0a;margin-right:-10px;"></div></td>
                    </tr>
                  </table>
                  <div style="padding:20px 40px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;color:#3a3a3a;text-align:center;">
                      You're receiving this because you subscribed at <strong style="color:#555;">recon.com.ng</strong>
                    </p>
                    <p style="margin:0;font-size:11px;text-align:center;">
                      <a href="#" style="color:#3a3a3a;text-decoration:none;">Unsubscribe</a>
                      <span style="color:#222;margin:0 8px;">·</span>
                      <a href="#" style="color:#3a3a3a;text-decoration:none;">View in browser</a>
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