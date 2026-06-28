import type { DuprLevel } from "./types";
import { SITE_URL } from "./site-metadata";

export const INTAKE_WAIVER_TITLE = "Assumption of Risk & Liability Waiver";

export const INTAKE_WAIVER_BODY = `I understand that pickleball and related coaching activities involve physical exertion and inherent risks including, but not limited to, slips, falls, muscle strains, contact with equipment or other players, and heat-related illness.

I confirm that I am physically able to participate. I voluntarily assume all risks associated with training sessions organized by my coach through PickleKoach.

I release my coach, facility operators, and PickleKoach from liability for any injury, loss, or damage arising from my participation, except where caused by gross negligence or willful misconduct.

I agree to follow court rules, wear appropriate footwear, and disclose any medical conditions that may affect my participation.`;

export type IntakeFormPayload = {
  name: string;
  mobile: string;
  email: string;
  emergencyContact?: string;
  skillLevel: DuprLevel;
  notes?: string;
  signedName: string;
};

export function buildIntakeUrl(coachSlug: string, origin = SITE_URL) {
  const slug = coachSlug.trim().toLowerCase();
  return `${origin}/coach/${slug}/join`;
}

export function validateIntakePayload(
  payload: IntakeFormPayload,
  displayName: string
): string | null {
  if (!payload.name.trim()) return "Name is required.";
  if (!payload.mobile.trim()) return "Mobile number is required.";
  if (!payload.email.trim() || !payload.email.includes("@")) return "Valid email is required.";
  if (!payload.signedName.trim()) return "Please sign the waiver with your full name.";
  if (payload.signedName.trim().toLowerCase() !== displayName.trim().toLowerCase()) {
    return "Signature must match your full name.";
  }
  return null;
}
