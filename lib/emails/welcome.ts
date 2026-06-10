import { SITE_URL, unsubscribeUrl } from "@/lib/urls";

/**
 * Welcome / confirmation email.
 *
 * Built table-first for email clients: NO flexbox and NO inline <svg> (Gmail
 * and Outlook strip both — that's what broke the icons and the layout). Icons
 * are emoji, layout is nested tables, decoration is CSS gradients that degrade
 * to a solid colour where unsupported.
 *
 * Multi-platform positioning (not Netflix-only) and a real one-click
 * unsubscribe link (guide Phase 0.5). Pass the subscriber's `unsubscribe_token`
 * so the footer link — and the List-Unsubscribe header set in `sendEmail` —
 * point at the same opaque token.
 */
export function welcomeEmailHtml(email: string, unsubscribeToken?: string) {
  const accent = "#6366f1";
  const accentDeep = "#4f46e5";

  // Sprocket-hole film strip via a repeating gradient (no flexbox).
  const filmStrip = (bg: string, hole: string) => `
    <div style="height:24px;background-color:${bg};background-image:repeating-linear-gradient(90deg, ${hole} 0, ${hole} 18px, transparent 18px, transparent 30px);"></div>`;

  const ticketDivider = `
    <div style="height:14px;line-height:14px;font-size:0;border-bottom:1px dashed #2a2a2a;">&nbsp;</div>
    <div style="height:14px;font-size:0;">&nbsp;</div>`;

  const featureCard = (emoji: string, label: string, body: string) => `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="border:1px solid #262626;border-radius:12px;background-color:#1a1a1a;">
      <tr>
        <td width="40" valign="top" style="padding:16px 0 16px 18px;">
          <div style="width:40px;height:40px;background-color:#1c1c2e;border-radius:10px;text-align:center;font-size:20px;line-height:40px;">${emoji}</div>
        </td>
        <td valign="top" style="padding:16px 18px 16px 14px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};">${label}</p>
          <p style="margin:0;font-size:13px;color:#8a8a8a;line-height:1.55;">${body}</p>
        </td>
      </tr>
    </table>`;

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  const unsubHref = unsubscribeToken
    ? unsubscribeUrl(unsubscribeToken)
    : `${SITE_URL}/api/unsubscribe`;
  const preferencesHref = unsubscribeToken
    ? `${SITE_URL}/preferences?token=${encodeURIComponent(unsubscribeToken)}`
    : `${SITE_URL}/preferences`;

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
          .h1 { font-size: 24px !important; }
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
                <td style="background-color:#111118;padding:34px 40px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td valign="bottom">
                        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.45);">
                          Welcome to recon
                        </p>
                        <h1 class="h1" style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
                          You're on the list.
                        </h1>
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

              <!-- Body -->
              <tr>
                <td style="background-color:#141414;padding:32px 40px;">

                  <p style="margin:0 0 10px;font-size:15px;color:#cccccc;line-height:1.6;">
                    Hi ${email},
                  </p>
                  <p style="margin:0 0 18px;font-size:14px;color:#8a8a8a;line-height:1.8;">
                    Welcome aboard. Every Friday we hand-pick the highest-rated movies streaming right now &mdash; across Netflix, Prime Video, Max, Apple TV+ and more &mdash; and tell you exactly where to watch each one. No more scrolling. Your first picks land this Friday.
                  </p>

                  <p style="margin:0 0 28px;font-size:12px;color:#7a7a96;line-height:1.6;background-color:#15151f;border:1px solid #262640;border-radius:8px;padding:12px 14px;">
                    &#128161; Quick tip: drag this email to your <strong style="color:#a5a5c4;">Primary</strong> tab and add us to your contacts &mdash; that keeps your Friday picks out of Promotions.
                  </p>

                  <p style="margin:0 0 18px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accent};">
                    What to expect
                  </p>

                  ${featureCard(
                    "&#11088;",
                    "Top-rated only",
                    "Only movies rated 7.0+ on IMDb make the cut. No filler, no fluff.",
                  )}
                  ${ticketDivider}
                  ${featureCard(
                    "&#128250;",
                    "Across every service",
                    "We tell you where each pick is streaming, so you watch in one tap.",
                  )}
                  ${ticketDivider}
                  ${featureCard(
                    "&#128197;",
                    "Every Friday, no spam",
                    "One email a week. That's it. Unsubscribe anytime, no questions asked.",
                  )}

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:32px;">
                    <tr>
                      <td align="center">
                        <a href="${SITE_URL}"
                          style="display:inline-block;background-color:${accentDeep};color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
                          Browse This Week's Picks &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#0f0f0f;padding:0;">
                  <div style="height:1px;border-top:1px dashed #2a2a2a;font-size:0;line-height:0;">&nbsp;</div>
                  <div style="padding:20px 40px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;color:#3a3a3a;">
                      &copy; 2026 recon. You're receiving this because you subscribed at <strong style="color:#555;">recon.com.ng</strong>
                    </p>
                    <p style="margin:0;font-size:11px;">
                      <a href="${preferencesHref}" style="color:#6b6b6b;text-decoration:underline;">Set your preferences</a>
                      <span style="color:#333;margin:0 6px;">&middot;</span>
                      <a href="${unsubHref}" style="color:#6b6b6b;text-decoration:underline;">Unsubscribe</a>
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
