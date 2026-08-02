import {
  buildCoachWelcomeEmailHtml,
  buildCoachWelcomeEmailSubject,
  buildCoachWelcomeEmailText,
} from "@/lib/koaches/email/coach-welcome-email";
import { getResendClient, getResendFromAddress } from "@/lib/koaches/email/resend";

export async function sendCoachWelcomeEmail(input: {
  coachName: string;
  loginEmail: string;
  temporaryPassword: string;
  slug: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: input.loginEmail,
      subject: buildCoachWelcomeEmailSubject(input.coachName),
      html: buildCoachWelcomeEmailHtml(input),
      text: buildCoachWelcomeEmailText(input),
    });
    if (error) return { ok: false, error: error.message || "Could not send welcome email." };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not send welcome email.",
    };
  }
}
