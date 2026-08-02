import {
  buildCoachPasswordResetEmailHtml,
  buildCoachPasswordResetEmailSubject,
  buildCoachPasswordResetEmailText,
} from "@/lib/koaches/email/coach-password-reset-email";
import { getResendClient, getResendFromAddress } from "@/lib/koaches/email/resend";

export async function sendCoachPasswordResetEmail(input: {
  coachName: string;
  loginEmail: string;
  temporaryPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: input.loginEmail,
      subject: buildCoachPasswordResetEmailSubject(),
      html: buildCoachPasswordResetEmailHtml(input),
      text: buildCoachPasswordResetEmailText(input),
    });
    if (error) return { ok: false, error: error.message || "Could not send reset email." };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not send reset email.",
    };
  }
}
