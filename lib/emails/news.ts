import { SITE_URL, unsubscribeUrl } from "@/lib/urls";

export type NewsEmailInput = {
  /** Headline shown in the email header. */
  title: string;
  /** Plain-text body. Blank lines become paragraphs; single newlines become breaks. */
  body: string;
  /** Public image URLs (e.g. Cloudinary) rendered full-width, in order. */
  images?: string[];
  ctaText?: string;
  ctaUrl?: string;
  unsubscribeToken?: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Turn admin plain text into safe paragraphs. */
function bodyToParagraphs(body: string) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const inner = escapeHtml(block).replace(/\n/g, "<br/>");
      return `<p style="margin:0 0 18px;font-size:15px;color:#cccccc;line-height:1.8;">${inner}</p>`;
    })
    .join("");
}

/**
 * News & updates broadcast email.
 *
 * Built email-safe (table layout, no flexbox, no inline <svg>) and on-brand
 * (film-strip header, indigo accent) to match the welcome and weekly-picks
 * templates. Pure and dependency-light so it can also be imported into the
 * admin page for a live preview.
 */
export function newsEmailHtml({
  title,
  body,
  images = [],
  ctaText,
  ctaUrl,
  unsubscribeToken,
}: NewsEmailInput) {
  const accent = "#6366f1";
  const accentDeep = "#4f46e5";

  const filmStrip = (bg: string, hole: string) => `
    <div style="height:24px;background-color:${bg};background-image:repeating-linear-gradient(90deg, ${hole} 0, ${hole} 18px, transparent 18px, transparent 30px);"></div>`;

  const imageBlocks = images
    .filter(Boolean)
    .map(
      (url) => `
      <img src="${url}" alt="" style="display:block;width:100%;max-width:520px;height:auto;border-radius:12px;margin:0 auto 18px;border:1px solid #262626;" />`,
    )
    .join("");

  const ctaBlock =
    ctaText && ctaUrl
      ? `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:14px;">
        <tr>
          <td align="center">
            <a href="${ctaUrl}"
              style="display:inline-block;background-color:${accentDeep};color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.5px;">
              ${escapeHtml(ctaText)} &rarr;
            </a>
          </td>
        </tr>
      </table>`
      : "";

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

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
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
                        <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accent};">
                          News &amp; Updates
                        </p>
                        <h1 class="h1" style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">
                          ${escapeHtml(title)}
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
                  ${imageBlocks}
                  ${bodyToParagraphs(body)}
                  ${ctaBlock}
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
