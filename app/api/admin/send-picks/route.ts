import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { transporter } from "@/lib/nodemailer";

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
      transporter.sendMail({
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
  const pickCards = picks
    .map(
      (pick) => `
    <div class="pick-card" style="margin-bottom: 24px; border: 1px solid #1f1f1f; border-radius: 12px; overflow: hidden; background-color: #1a1a1a;">
      <div class="pick-inner" style="display: flex; flex-direction: row;">
        ${
          pick.poster_url
            ? `
        <div class="pick-poster" style="flex-shrink: 0; width: 320px;">
          <img src="${pick.poster_url}" alt="${pick.title}" width="120"
            style="display: block; width: 120px; height: 100%; min-height: 160px; object-fit: cover;" />
        </div>`
            : ""
        }
        <div class="pick-body" style="padding: 16px; flex: 1; min-width: 0;">
          <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #E50914;">
            ${pick.genre ?? "Featured"}
          </p>
          <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #ffffff;">
            ${pick.title}
          </h3>
          <p style="margin: 0 0 10px; font-size: 13px; color: #a3a3a3; line-height: 1.5;">
            ${pick.description ?? ""}
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <span style="background-color: #2a2a2a; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: #facc15;">
              ⭐ ${pick.imdb_rating} IMDb
            </span>
            ${
              pick.netflix_url
                ? `
            <a href="${pick.netflix_url}"
              style="display: inline-block; background-color: #E50914; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 6px;">
              Watch on Netflix →
            </a>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `,
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
          .pick-poster img {
            width: 320px !important;
            height: 200px !important;
          }
          .pick-poster {
            width: 100% !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 16px; overflow: hidden; border: 1px solid #1f1f1f;">

              <!-- Header -->
              <tr>
                <td style="background-color: #1b1f3b; padding: 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align: middle; padding-right: 20px;">
                        <p style="margin: 0 0 8px; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.75);">
                          Weekly Newsletter
                        </p>
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; line-height: 1.2;">
                          🎬 This Week's Top Picks
                        </h1>
                      </td>
                      <td style="vertical-align: middle; text-align: right; white-space: nowrap;">
                        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.7);">
                          ${new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Picks -->
              <tr>
                <td style="background-color: #141414; padding: 32px;">
                  <p style="margin: 0 0 24px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #E50914;">
                    This week's picks
                  </p>
                  ${pickCards}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0f0f0f; padding: 24px 40px; border-top: 1px solid #1f1f1f;">
                  <p style="margin: 0 0 8px; font-size: 12px; color: #4a4a4a; text-align: center;">
                    You're receiving this because you subscribed at <strong style="color: #6a6a6a;">recon.com.ng</strong>
                  </p>
                  <p style="margin: 0; font-size: 12px; text-align: center;">
                    <a href="#" style="color: #4a4a4a;">Unsubscribe</a>
                    <span style="color: #2a2a2a; margin: 0 8px;">|</span>
                    <a href="#" style="color: #4a4a4a;">View in browser</a>
                  </p>
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
