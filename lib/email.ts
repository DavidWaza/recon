import { getTransporter } from "@/lib/nodemailer";
import { SITE_URL, unsubscribeUrl, feedbackUrl } from "@/lib/urls";

/**
 * Single sending funnel (guide Phase 0.2).
 *
 * Every email in the app goes through `sendEmail`. The moment we own a domain
 * and move to Resend/Postmark (Phase 0.4), only this file changes — every
 * caller stays untouched.
 */

// Re-exported so existing importers of "@/lib/email" keep working.
export { SITE_URL, unsubscribeUrl, feedbackUrl };

const FROM_EMAIL = process.env.GMAIL_USER ?? "moviereconn@gmail.com";
const FROM = `recon <${FROM_EMAIL}>`;

/** Rough text/plain fallback so every email is multipart/alternative. */
function htmlToText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|tr|h1|h2|h3|table)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&rarr;/g, "→")
    .replace(/&copy;/g, "©")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  unsubscribeToken?: string,
  text?: string,
) {
  return getTransporter().sendMail({
    from: FROM,
    to,
    subject,
    html,
    text: text ?? htmlToText(html),
    headers: unsubscribeToken
      ? {
          // Gmail/Outlook surface this as a native one-click unsubscribe.
          "List-Unsubscribe": `<${unsubscribeUrl(unsubscribeToken)}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined,
  });
}
