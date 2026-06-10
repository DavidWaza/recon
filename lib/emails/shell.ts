import { SITE_URL, unsubscribeUrl } from "@/lib/urls";

/** Brand palette for RECON broadcast emails (matches newsletter design). */
export const RECON_EMAIL = {
  navy: "#1B2240",
  navyCard: "#243055",
  navyDeep: "#151C34",
  orange: "#E8913A",
  orangeHover: "#D47E2A",
  white: "#FFFFFF",
  text: "#E8ECF4",
  muted: "#8B95AD",
  mutedDark: "#6B7590",
  divider: "#2A3658",
} as const;

export const RECON_LOGO_URL = `${SITE_URL}/logo.png`;

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Wrap **segments** in the brand orange accent colour. */
export function titleWithAccent(title: string) {
  const parts = escapeHtml(title).split(/\*\*(.+?)\*\*/g);
  return parts
    .map((part, index) =>
      index % 2 === 1
        ? `<span style="color:${RECON_EMAIL.orange};">${part}</span>`
        : part,
    )
    .join("");
}

export type ReconEmailShellInput = {
  /** Inbox / document title (not shown in body). */
  pageTitle: string;
  /** Inner body HTML — everything between the logo and footer. */
  bodyHtml: string;
  unsubscribeToken?: string;
};

/**
 * Static RECON email shell: orange top bar, logo header, dynamic body slot,
 * and standard footer. Use this whenever you need to send a one-off broadcast.
 */
export function reconEmailShell({
  pageTitle,
  bodyHtml,
  unsubscribeToken,
}: ReconEmailShellInput) {
  const unsubHref = unsubscribeToken
    ? unsubscribeUrl(unsubscribeToken)
    : `${SITE_URL}/api/unsubscribe`;
  const preferencesHref = SITE_URL;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${escapeHtml(pageTitle)}</title>
  <style>
    /* Opt in to dark mode so clients render our navy design as-authored
       instead of force-inverting it (which broke the white logo box). */
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    @media only screen and (max-width: 600px) {
      .shell-container { width: 100% !important; }
      .shell-body { padding-left: 24px !important; padding-right: 24px !important; }
      .shell-logo-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .shell-h1 { font-size: 26px !important; }
    }
    /* Lock the palette for clients that still force dark mode. */
    @media (prefers-color-scheme: dark) {
      .dm-bg { background-color: ${RECON_EMAIL.navy} !important; }
      .dm-logo-box { background-color: ${RECON_EMAIL.white} !important; }
      .dm-card { background-color: ${RECON_EMAIL.navyCard} !important; }
      .dm-white { color: ${RECON_EMAIL.white} !important; }
      .dm-text { color: ${RECON_EMAIL.text} !important; }
      .dm-muted { color: ${RECON_EMAIL.muted} !important; }
      .dm-muted-dark { color: ${RECON_EMAIL.mutedDark} !important; }
    }
    /* Outlook.com dark mode (ogsc = foreground, ogsb = background). */
    [data-ogsb] .dm-bg { background-color: ${RECON_EMAIL.navy} !important; }
    [data-ogsb] .dm-logo-box { background-color: ${RECON_EMAIL.white} !important; }
    [data-ogsb] .dm-card { background-color: ${RECON_EMAIL.navyCard} !important; }
    [data-ogsc] .dm-white { color: ${RECON_EMAIL.white} !important; }
    [data-ogsc] .dm-text { color: ${RECON_EMAIL.text} !important; }
    [data-ogsc] .dm-muted { color: ${RECON_EMAIL.muted} !important; }
    [data-ogsc] .dm-muted-dark { color: ${RECON_EMAIL.mutedDark} !important; }
  </style>
</head>
<body class="dm-bg" style="margin:0;padding:0;background-color:${RECON_EMAIL.navy};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="dm-bg" style="background-color:${RECON_EMAIL.navy};">
    <tr>
      <td align="center" style="padding:0;">

        <!-- Top accent bar -->
        <table class="shell-container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <tr>
            <td style="height:4px;background-color:${RECON_EMAIL.orange};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>

        <!-- Logo header -->
        <table class="shell-container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <tr>
            <td class="shell-logo-pad" align="center" style="padding:36px 40px 28px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td class="dm-logo-box" style="background-color:${RECON_EMAIL.white};border-radius:14px;padding:14px 32px;">
                    <img src="${RECON_LOGO_URL}" alt="RECON" width="168" height="auto"
                      style="display:block;border:0;outline:none;text-decoration:none;max-width:168px;height:auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Dynamic body -->
        <table class="shell-container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <tr>
            <td class="shell-body" style="padding:0 48px 40px;">
              ${bodyHtml}
            </td>
          </tr>
        </table>

        <!-- Static footer -->
        <table class="shell-container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
          <tr>
            <td style="padding:0 48px 40px;">
              <div style="height:1px;background-color:${RECON_EMAIL.divider};font-size:0;line-height:0;">&nbsp;</div>
              <div style="padding-top:28px;text-align:center;">
                <p class="dm-muted-dark" style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${RECON_EMAIL.mutedDark};">
                  RECON &middot; YOUR MOVIE COMPANION
                </p>
                <p class="dm-muted-dark" style="margin:0 0 14px;font-size:11px;color:${RECON_EMAIL.mutedDark};line-height:1.6;">
                  You&rsquo;re receiving this because you have a RECON account.
                </p>
                <p class="dm-muted-dark" style="margin:0;font-size:11px;color:${RECON_EMAIL.mutedDark};">
                  <a href="${unsubHref}" class="dm-muted" style="color:${RECON_EMAIL.muted};text-decoration:underline;">Unsubscribe</a>
                  &nbsp;&middot;&nbsp;
                  <a href="${preferencesHref}" class="dm-muted" style="color:${RECON_EMAIL.muted};text-decoration:underline;">Email preferences</a>
                </p>
              </div>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
