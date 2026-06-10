import { SITE_URL } from "@/lib/urls";
import {
  RECON_EMAIL,
  escapeHtml,
  reconEmailShell,
  titleWithAccent,
} from "@/lib/emails/shell";

export type NewsEmailStep = {
  title: string;
  description: string;
};

export type NewsEmailInput = {
  /** Main headline. Wrap text in **double asterisks** for orange accent. */
  title: string;
  /** Small eyebrow above the headline, e.g. "A QUICK FAVOR". */
  kicker?: string;
  /** Plain-text body. Blank lines become paragraphs; single newlines become breaks. */
  body: string;
  /** Public image URLs (e.g. Cloudinary) rendered full-width, in order. */
  images?: string[];
  /** Optional numbered cards (title + description per item). */
  steps?: NewsEmailStep[];
  ctaText?: string;
  ctaUrl?: string;
  /** Small print below the CTA button. Supports **Privacy Policy** link via [Privacy Policy](url). */
  disclaimer?: string;
  unsubscribeToken?: string;
};

function bodyToParagraphs(body: string) {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const inner = escapeHtml(block).replace(/\n/g, "<br/>");
      return `<p style="margin:0 0 20px;font-size:15px;color:${RECON_EMAIL.text};line-height:1.75;text-align:center;">${inner}</p>`;
    })
    .join("");
}

function disclaimerHtml(disclaimer: string) {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let html = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(disclaimer)) !== null) {
    html += escapeHtml(disclaimer.slice(lastIndex, match.index));
    html += `<a href="${escapeHtml(match[2])}" style="color:${RECON_EMAIL.orange};text-decoration:underline;">${escapeHtml(match[1])}</a>`;
    lastIndex = match.index + match[0].length;
  }

  html += escapeHtml(disclaimer.slice(lastIndex));

  return `<p style="margin:24px 0 0;font-size:12px;color:${RECON_EMAIL.muted};line-height:1.7;text-align:center;">${html}</p>`;
}

function numberedSteps(steps: NewsEmailStep[]) {
  return steps
    .filter((step) => step.title.trim())
    .map((step, index) => {
      const num = index + 1;
      return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
        style="margin-bottom:14px;border-radius:14px;background-color:${RECON_EMAIL.navyCard};">
        <tr>
          <td width="64" valign="top" style="padding:22px 0 22px 22px;">
            <div style="width:40px;height:40px;border-radius:50%;background-color:${RECON_EMAIL.navyDeep};text-align:center;line-height:40px;font-size:20px;font-weight:800;color:${RECON_EMAIL.orange};">
              ${num}
            </div>
          </td>
          <td valign="top" style="padding:22px 22px 22px 8px;">
            <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:${RECON_EMAIL.white};line-height:1.35;">
              ${escapeHtml(step.title)}
            </p>
            <p style="margin:0;font-size:14px;color:${RECON_EMAIL.muted};line-height:1.65;">
              ${escapeHtml(step.description)}
            </p>
          </td>
        </tr>
      </table>`;
    })
    .join("");
}

function imageBlocks(images: string[]) {
  return images
    .filter(Boolean)
    .map(
      (url) => `
      <img src="${url}" alt=""
        style="display:block;width:100%;max-width:504px;height:auto;border-radius:14px;margin:0 auto 20px;border:1px solid ${RECON_EMAIL.divider};" />`,
    )
    .join("");
}

function ctaBlock(ctaText: string, ctaUrl: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:8px;">
      <tr>
        <td align="center" style="padding-top:8px;">
          <a href="${ctaUrl}"
            style="display:inline-block;background-color:${RECON_EMAIL.orange};color:${RECON_EMAIL.white};padding:16px 44px;text-decoration:none;border-radius:999px;font-weight:700;font-size:15px;letter-spacing:0.2px;">
            ${escapeHtml(ctaText)}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Build only the inner body HTML (for custom shells or previews). */
export function newsEmailBodyHtml({
  title,
  kicker,
  body,
  images = [],
  steps = [],
  ctaText,
  ctaUrl,
  disclaimer,
}: Omit<NewsEmailInput, "unsubscribeToken">) {
  const kickerBlock = kicker?.trim()
    ? `<p style="margin:0 0 18px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${RECON_EMAIL.orange};text-align:center;">
        &mdash; ${escapeHtml(kicker.trim())} &mdash;
      </p>`
    : "";

  const titleBlock = `
    <h1 class="shell-h1" style="margin:0 0 28px;font-size:34px;font-weight:800;color:${RECON_EMAIL.white};line-height:1.2;text-align:center;letter-spacing:-0.5px;">
      ${titleWithAccent(title)}
    </h1>`;

  const stepsBlock =
    steps.length > 0
      ? `<div style="margin:8px 0 24px;">${numberedSteps(steps)}</div>`
      : "";

  const cta =
    ctaText && ctaUrl ? ctaBlock(ctaText, ctaUrl) : "";

  const disclaimerBlock =
    disclaimer && disclaimer.trim()
      ? disclaimerHtml(disclaimer.trim())
      : "";

  return `
    ${kickerBlock}
    ${titleBlock}
    ${imageBlocks(images)}
    ${bodyToParagraphs(body)}
    ${stepsBlock}
    ${cta}
    ${disclaimerBlock}`;
}

/**
 * News & updates broadcast email.
 *
 * Uses the static RECON shell (logo header + footer) with a dynamic body you
 * can fill from the admin send-message page or any server route.
 */
export function newsEmailHtml({
  title,
  kicker,
  body,
  images = [],
  steps = [],
  ctaText,
  ctaUrl,
  disclaimer,
  unsubscribeToken,
}: NewsEmailInput) {
  const resolvedDisclaimer =
    disclaimer !== undefined
      ? disclaimer
      : ctaText && ctaUrl
        ? `Your answers are private and only used to improve your recommendations. [Privacy Policy](${SITE_URL}/privacy)`
        : undefined;

  const bodyHtml = newsEmailBodyHtml({
    title,
    kicker,
    body,
    images,
    steps,
    ctaText,
    ctaUrl,
    disclaimer: resolvedDisclaimer,
  });

  return reconEmailShell({
    pageTitle: title,
    bodyHtml,
    unsubscribeToken,
  });
}

/** Parse admin "steps" textarea: blank line between steps, first line = title, rest = description. */
export function parseStepsFromText(raw: string): NewsEmailStep[] {
  return raw
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 0) return null;
      const [first, ...rest] = lines;
      return { title: first, description: rest.join(" ") };
    })
    .filter((step): step is NewsEmailStep => step !== null);
}
