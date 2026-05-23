import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransporter } from "@/lib/nodemailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Insert into subscribers
  const { data, error } = await supabaseAdmin
    .from("subscribers")
    .insert([{ email}])
    .select()
    .single();

  if (error) {
    console.error("Supabase error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email
  try {
    await getTransporter().sendMail({
      from: "recon <moviereconn@gmail.com>",
      to: email,
      subject: "🎬 You're on the list — first picks land Friday!",
      html: subscriberEmailTemplate(email),
    });
  } catch (emailError) {
    console.error("Email error:", emailError);
  }

  return NextResponse.json({
    success: true,
    emailSent: true,
    data,
  });
}

function subscriberEmailTemplate(email: string) {
  const filmHoles = Array(22)
    .fill(null)
    .map(() => `<div style="width:18px;height:16px;background:#0a0a0a;border-radius:3px;flex-shrink:0;"></div>`)
    .join("");

  const filmStripTop = `
    <div style="background:#111118;height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;overflow:hidden;">
      ${filmHoles}
    </div>`;

  const filmStripBottom = `
    <div style="background:#0a0a0a;height:28px;display:flex;align-items:center;gap:6px;padding:0 8px;overflow:hidden;">
      ${Array(22).fill(`<div style="width:18px;height:16px;background:#111118;border-radius:3px;flex-shrink:0;"></div>`).join("")}
    </div>`;

  const ticketDivider = `
    <div style="display:flex;align-items:center;margin:0;">
      <div style="flex:1;height:1px;background:repeating-linear-gradient(90deg,#2a2a2a 0,#2a2a2a 6px,transparent 6px,transparent 12px);"></div>
      <div style="width:16px;height:16px;border-radius:50%;background:#141414;border:1px solid #2a2a2a;flex-shrink:0;margin:0 -1px;"></div>
      <div style="flex:1;height:1px;background:repeating-linear-gradient(90deg,#2a2a2a 0,#2a2a2a 6px,transparent 6px,transparent 12px);"></div>
    </div>`;

  const clapperSVG = `
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

  const spotlightLabel = (text: string) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <svg width="12" height="18" viewBox="0 0 14 20" fill="none">
        <polygon points="7,0 14,8 10,8 10,20 4,20 4,8 0,8" fill="#E50914"/>
      </svg>
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#E50914;">${text}</p>
    </div>`;

  const iconBox = (svg: string) => `
    <div style="flex-shrink:0;width:36px;height:36px;background:#2a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;">
      ${svg}
    </div>`;

  const starSVG = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E50914" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`;

  const calendarSVG = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E50914" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>`;

  const peopleSVG = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E50914" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`;

  const featureCard = (
    icon: string,
    label: string,
    body: string,
    radius: string
  ) => `
    <div style="border:1px solid #262626;border-radius:${radius};overflow:hidden;background:#1a1a1a;position:relative;">
      <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#E50914;border-radius:0;"></div>
      <div style="padding:16px 16px 16px 20px;display:flex;align-items:flex-start;gap:14px;">
        ${iconBox(icon)}
        <div>
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E50914;">${label}</p>
          <p style="margin:0;font-size:13px;color:#8a8a8a;line-height:1.55;">${body}</p>
        </div>
      </div>
    </div>`;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to recon</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          h1 { font-size: 24px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 16px;">
        <tr>
          <td align="center">
            <table class="container" width="600" cellpadding="0" cellspacing="0"
              style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f;">

              <!-- Film strip top -->
              <tr><td style="padding:0;">${filmStripTop}</td></tr>

              <!-- Header -->
              <tr>
                <td style="background:#111118;padding:36px 40px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:bottom;">
                        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">
                          Welcome to recon
                        </p>
                        <h1 style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
                          You're on the list.
                        </h1>
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
              <tr><td style="padding:0;">${filmStripBottom}</td></tr>

              <!-- Body -->
              <tr>
                <td style="background:#141414;padding:32px 40px;">

                  <p style="margin:0 0 10px;font-size:15px;color:#cccccc;line-height:1.6;">
                    Hi ${email},
                  </p>
                  <p style="margin:0 0 32px;font-size:14px;color:#8a8a8a;line-height:1.8;">
                    Welcome aboard. Every Friday we hand-pick the highest-rated movies on Netflix so you never waste time scrolling again. Your first picks land this Friday.
                  </p>

                  ${spotlightLabel("What to expect")}

                  ${featureCard(
                    starSVG,
                    "Top-rated only",
                    "Only movies rated 7.0+ on IMDb make the cut. No filler, no fluff.",
                    "12px 12px 0 0"
                  )}
                  ${ticketDivider}
                  ${featureCard(
                    calendarSVG,
                    "Every Friday, no spam",
                    "One email a week. That's it. Unsubscribe anytime, no questions asked.",
                    "0"
                  )}
                  ${ticketDivider}
                  ${featureCard(
                    peopleSVG,
                    "Curated, not algorithmic",
                    "Human-reviewed so every pick is worth your Friday night.",
                    "0 0 12px 12px"
                  )}

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                    <tr>
                      <td align="center">
                        <a href="https://recon.com.ng"
                          style="display:inline-block;background:#E50914;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
                          Browse This Week's Picks &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer tear line -->
              <tr>
                <td style="background:#0f0f0f;padding:0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="20">
                        <div style="width:20px;height:20px;border-radius:50%;background:#141414;margin-left:-10px;"></div>
                      </td>
                      <td style="background:repeating-linear-gradient(90deg,#2a2a2a 0,#2a2a2a 8px,transparent 8px,transparent 16px);height:1px;"></td>
                      <td width="20" style="text-align:right;">
                        <div style="width:20px;height:20px;border-radius:50%;background:#141414;margin-right:-10px;"></div>
                      </td>
                    </tr>
                  </table>
                  <div style="padding:20px 40px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;color:#3a3a3a;text-align:center;">
                      &copy; 2026 recon. All rights reserved.
                    </p>
                    <p style="margin:0;font-size:11px;color:#3a3a3a;text-align:center;">
                      You're receiving this because you subscribed at <strong style="color:#555;">recon.com.ng</strong>
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