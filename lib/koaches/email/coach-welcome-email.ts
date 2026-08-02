import {
  EMAIL_BRAND,
  emailBrandHeader,
  emailCtaButton,
  escapeEmailHtml,
  wrapEmailDocument,
} from "@/lib/koaches/email/brand";
import { coachFirstName } from "@/lib/koaches/person-name";
import { SITE_NAME, SITE_URL } from "@/lib/koaches/site-metadata";

export type CoachWelcomeEmailInput = {
  coachName: string;
  loginEmail: string;
  temporaryPassword: string;
  slug: string;
};

function coachLoginUrl(): string {
  return `${SITE_URL.replace(/\/$/, "")}/coach/login`;
}

function coachProfileUrl(slug: string): string {
  return `${SITE_URL.replace(/\/$/, "")}/coach/${encodeURIComponent(slug)}`;
}

export function buildCoachWelcomeEmailSubject(coachName: string): string {
  const first = coachFirstName({ name: coachName }) || "Coach";
  return `Welcome to ${SITE_NAME}, Coach ${first}!`;
}

export function buildCoachWelcomeEmailHtml(input: CoachWelcomeEmailInput): string {
  const B = EMAIL_BRAND;
  const first = coachFirstName({ name: input.coachName }) || "Coach";
  const loginUrl = coachLoginUrl();
  const profileUrl = coachProfileUrl(input.slug);
  const subject = buildCoachWelcomeEmailSubject(input.coachName);

  const bodyHtml = `
    ${emailBrandHeader()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFFFFF;border-radius:20px;border:1px solid ${B.grayBorder};overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 20px;text-align:center;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${B.green};">You're in</p>
          <h1 style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;line-height:1.2;color:${B.text};">Welcome, Coach ${escapeEmailHtml(first)}</h1>
          <p style="margin:10px 0 0;font-size:14px;line-height:1.55;color:${B.gray};">
            Your application was approved. Sign in with the details below to open your coach portal.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding:18px 16px;border-radius:16px;background:${B.blueLight};border:1px solid ${B.blueBorder};text-align:center;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:700;line-height:1.3;color:${B.greenDark};">Your login details</p>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:${B.gray};">
                  You can change your password anytime in Settings after you sign in.
                </p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
            <tr>
              <td style="padding:14px 16px;border-radius:16px;background:${B.greenLight};border:1px solid ${B.greenBorder};">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#166534;">Email</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:${B.text};">${escapeEmailHtml(input.loginEmail)}</p>
                <p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#166534;">Temporary password</p>
                <p style="margin:4px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:16px;font-weight:700;letter-spacing:0.04em;color:${B.text};">${escapeEmailHtml(input.temporaryPassword)}</p>
                <p style="margin:12px 0 0;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#166534;">Public profile</p>
                <p style="margin:4px 0 0;font-size:13px;color:#374151;word-break:break-all;">
                  <a href="${profileUrl}" style="color:${B.green};text-decoration:none;">${escapeEmailHtml(profileUrl)}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  const ctaHtml = `
    ${emailCtaButton(loginUrl, "Open coach portal")}
    <p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:${B.muted};">
      <a href="${loginUrl}" style="color:${B.green};word-break:break-all;">${escapeEmailHtml(loginUrl)}</a>
    </p>`;

  return wrapEmailDocument({
    title: subject,
    greetingHtml: `Hi Coach ${escapeEmailHtml(first)}, welcome to ${escapeEmailHtml(SITE_NAME)}.`,
    bodyHtml,
    ctaHtml,
  });
}

export function buildCoachWelcomeEmailText(input: CoachWelcomeEmailInput): string {
  const first = coachFirstName({ name: input.coachName }) || "Coach";
  const loginUrl = coachLoginUrl();
  const profileUrl = coachProfileUrl(input.slug);

  return [
    `Hi Coach ${first},`,
    "",
    `Welcome to ${SITE_NAME}! Your coach application was approved.`,
    "",
    "Your login details:",
    `Email: ${input.loginEmail}`,
    `Temporary password: ${input.temporaryPassword}`,
    "",
    `Sign in: ${loginUrl}`,
    `Public profile: ${profileUrl}`,
    "",
    "You can change your password anytime in Settings after you sign in.",
    "",
    `— ${SITE_NAME}`,
  ].join("\n");
}
