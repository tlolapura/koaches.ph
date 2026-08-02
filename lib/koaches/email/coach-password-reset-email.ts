import {
  EMAIL_BRAND,
  emailBrandHeader,
  emailCtaButton,
  escapeEmailHtml,
  wrapEmailDocument,
} from "@/lib/koaches/email/brand";
import { coachFirstName } from "@/lib/koaches/person-name";
import { SITE_NAME, SITE_URL } from "@/lib/koaches/site-metadata";

export type CoachPasswordResetEmailInput = {
  coachName: string;
  loginEmail: string;
  temporaryPassword: string;
};

function coachLoginUrl(): string {
  return `${SITE_URL.replace(/\/$/, "")}/coach/login`;
}

export function buildCoachPasswordResetEmailSubject(): string {
  return `Your new ${SITE_NAME} password`;
}

export function buildCoachPasswordResetEmailHtml(input: CoachPasswordResetEmailInput): string {
  const B = EMAIL_BRAND;
  const first = coachFirstName({ name: input.coachName }) || "Coach";
  const loginUrl = coachLoginUrl();
  const subject = buildCoachPasswordResetEmailSubject();

  const bodyHtml = `
    ${emailBrandHeader()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:20px;border:1px solid ${B.grayBorder};overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 20px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${B.green};">Password reset</p>
          <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;line-height:1.2;color:${B.text};">Here&rsquo;s a new password</h1>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:${B.gray};">
            Hi Coach ${escapeEmailHtml(first)}, we generated a temporary password for your coach portal.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:14px 16px;border-radius:16px;background:${B.greenLight};border:1px solid ${B.greenBorder};">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#166534;">Email</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:${B.text};">${escapeEmailHtml(input.loginEmail)}</p>
                <p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#166534;">Temporary password</p>
                <p style="margin:4px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:16px;font-weight:700;letter-spacing:0.04em;color:${B.text};">${escapeEmailHtml(input.temporaryPassword)}</p>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:${B.gray};text-align:center;">
            You can change this anytime in Settings after you sign in.
          </p>
        </td>
      </tr>
    </table>`;

  const ctaHtml = `
    ${emailCtaButton(loginUrl, "Open coach portal")}
    <p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:${B.muted};">
      If you didn&rsquo;t ask for this, sign in and change your password in Settings.<br />
      <a href="${loginUrl}" style="color:${B.green};word-break:break-all;">${escapeEmailHtml(loginUrl)}</a>
    </p>`;

  return wrapEmailDocument({
    title: subject,
    greetingHtml: `Hi Coach ${escapeEmailHtml(first)}, here is a temporary password for ${escapeEmailHtml(SITE_NAME)}.`,
    bodyHtml,
    ctaHtml,
  });
}

export function buildCoachPasswordResetEmailText(input: CoachPasswordResetEmailInput): string {
  const first = coachFirstName({ name: input.coachName }) || "Coach";
  const loginUrl = coachLoginUrl();

  return [
    `Hi Coach ${first},`,
    "",
    `Here is a temporary password for your ${SITE_NAME} coach portal:`,
    "",
    `Email: ${input.loginEmail}`,
    `Temporary password: ${input.temporaryPassword}`,
    "",
    `Sign in: ${loginUrl}`,
    "",
    "You can change this anytime in Settings after you sign in.",
    "If you didn't ask for this, sign in and change your password in Settings.",
    "",
    `— ${SITE_NAME}`,
  ].join("\n");
}
