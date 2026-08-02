/** Shared PickleKoach email branding (progress cards, coach welcome, etc.) */

import { SITE_NAME } from "@/lib/koaches/site-metadata";

export const EMAIL_BRAND = {
  green: "#16A34A",
  greenDark: "#14532D",
  greenLight: "#F0FDF4",
  greenBorder: "#BBF7D0",
  blue: "#4F8FF7",
  blueLight: "#EFF6FF",
  blueBorder: "#DBEAFE",
  gray: "#6B7280",
  grayBorder: "#E5E7EB",
  red: "#B91C1C",
  redLight: "#FFFBFB",
  redBorder: "#FECACA",
  text: "#111827",
  muted: "#9CA3AF",
  pageBg: "#F3F4F6",
} as const;

export function escapeEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailBrandHeader(): string {
  const B = EMAIL_BRAND;
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center" style="padding:0 0 20px;">
          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:24px;font-weight:700;line-height:1;letter-spacing:-0.02em;">
            <span style="color:${B.green};">Pickle</span><span style="color:${B.blue};">Koach</span>
          </span>
        </td>
      </tr>
    </table>`;
}

export function emailCtaButton(href: string, label: string): string {
  const B = EMAIL_BRAND;
  return `<a href="${href}" style="display:inline-block;padding:12px 22px;border-radius:999px;background:${B.green};color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;">${escapeEmailHtml(label)}</a>`;
}

export function wrapEmailDocument(options: {
  title: string;
  greetingHtml: string;
  bodyHtml: string;
  ctaHtml?: string;
  footerNote?: string;
}): string {
  const B = EMAIL_BRAND;
  const ctaBlock = options.ctaHtml
    ? `<tr><td style="padding:24px 8px 8px;text-align:center;">${options.ctaHtml}</td></tr>`
    : "";
  const footerNote = options.footerNote
    ? `<tr><td style="padding:8px 8px 0;text-align:center;font-size:12px;line-height:1.5;color:${B.muted};">${options.footerNote}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeEmailHtml(options.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${B.pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${B.text};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${B.pageBg};padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.5;color:${B.gray};text-align:center;">
                ${options.greetingHtml}
              </td>
            </tr>
            <tr>
              <td>${options.bodyHtml}</td>
            </tr>
            ${ctaBlock}
            ${footerNote}
            <tr>
              <td style="padding:16px 8px 0;text-align:center;font-size:12px;font-weight:600;color:${B.muted};">
                Powered by ${escapeEmailHtml(SITE_NAME)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
