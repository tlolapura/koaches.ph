import type { CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";
import type { SubmitApplicationInput } from "@/lib/koaches/actions/applications";
import { DEFAULT_SESSION_PRICING } from "@/lib/koaches/pricing";
import { SKILL_RUBRICS } from "@/lib/koaches/program-templates";

/** Player levels coaches can select on the apply form (maps to platform rubrics). */
export type CoachingLevelId = Exclude<SkillRubricId, "custom">;

export const COACHING_LEVEL_OPTIONS: {
  id: CoachingLevelId;
  label: string;
  dupr: string;
}[] = [
  { id: "beginner", label: "Beginner", dupr: SKILL_RUBRICS.beginner.duprRange },
  { id: "intermediate", label: "Intermediate", dupr: SKILL_RUBRICS.intermediate.duprRange },
  { id: "advanced", label: "Advanced", dupr: SKILL_RUBRICS.advanced.duprRange },
];

export type ApplicationDraft = {
  fullName: string;
  mobile: string;
  email: string;
  specialization: string;
  bio: string;
  instagram: string;
  facebook: string;
  preferredSlug: string;
  students: string;
  coachingLevels: CoachingLevelId[];
};

export const EMPTY_APPLICATION_DRAFT: ApplicationDraft = {
  fullName: "",
  mobile: "",
  email: "",
  specialization: "",
  bio: "",
  instagram: "",
  facebook: "",
  preferredSlug: "",
  students: "",
  coachingLevels: [],
};

/** Default progress rubric when a coach works with multiple levels — highest selected wins. */
export function primarySkillTemplateFromLevels(levels: CoachingLevelId[]): SkillRubricId {
  const order: CoachingLevelId[] = ["advanced", "intermediate", "beginner"];
  for (const id of order) {
    if (levels.includes(id)) return id;
  }
  return "intermediate";
}

export function formatCoachingLevelsLabel(levels: CoachingLevelId[]): string {
  if (levels.length === 0) return "—";
  return levels
    .map((id) => COACHING_LEVEL_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}

export function draftToSubmitInput(draft: ApplicationDraft): SubmitApplicationInput {
  return {
    fullName: draft.fullName.trim(),
    mobile: draft.mobile.trim(),
    email: draft.email.trim(),
    bio: draft.bio.trim(),
    specialization: draft.specialization.trim(),
    instagram: draft.instagram.trim() || undefined,
    facebook: draft.facebook.trim() || undefined,
    coachingLevels: draft.coachingLevels,
    skillTemplateId: primarySkillTemplateFromLevels(draft.coachingLevels),
    sessionPricing: DEFAULT_SESSION_PRICING,
    preferredSlug: draft.preferredSlug.trim() || undefined,
    currentStudentCount: Number(draft.students) || 0,
  };
}

export function validateIdentityStep(draft: ApplicationDraft): string | null {
  if (!draft.fullName.trim()) return "Please enter your full name.";
  if (!draft.mobile.trim()) return "Please enter your mobile number.";
  if (!draft.email.trim()) return "Please enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return "Please enter a valid email.";
  return null;
}

export function validateCoachingStep(draft: ApplicationDraft): string | null {
  if (!draft.specialization.trim()) return "Please add your specialization.";
  if (!draft.bio.trim()) return "Please tell us about your coaching.";
  return null;
}

export function validateBusinessStep(draft: ApplicationDraft): string | null {
  const slug = draft.preferredSlug.trim();
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Profile URL can only use lowercase letters, numbers, and hyphens.";
  }
  if (draft.coachingLevels.length === 0) {
    return "Select at least one player level you coach.";
  }
  return null;
}

export function toggleCoachingLevel(
  levels: CoachingLevelId[],
  id: CoachingLevelId
): CoachingLevelId[] {
  return levels.includes(id) ? levels.filter((l) => l !== id) : [...levels, id];
}
