import type { CoachProfile, CoachSessionPricing, DuprLevel, SkillRubricId } from "@/lib/koaches/types";
import type { SubmitApplicationInput } from "@/lib/koaches/actions/applications";
import { joinPersonName } from "@/lib/koaches/person-name";
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

const DUPR_TO_COACHING_LEVEL: Record<DuprLevel, CoachingLevelId> = {
  "2.0": "beginner",
  "2.5": "beginner",
  "3.0": "intermediate",
  "3.5": "intermediate",
  "4.0": "advanced",
  "4.5+": "advanced",
};

const COACHING_LEVEL_DEFAULT_DUPR: Record<CoachingLevelId, DuprLevel> = {
  beginner: "2.5",
  intermediate: "3.0",
  advanced: "4.0",
};

/** Map stored DUPR to beginner / intermediate / advanced bucket. */
export function coachingLevelFromDupr(level: DuprLevel): CoachingLevelId {
  return DUPR_TO_COACHING_LEVEL[level] ?? "intermediate";
}

/** Human label for a student's level (Beginner, Intermediate, Advanced). */
export function formatStudentCoachingLevelLabel(level: DuprLevel): string {
  const id = coachingLevelFromDupr(level);
  return COACHING_LEVEL_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

/** Primary level label + DUPR rating as secondary helper text. */
export function formatStudentLevelDisplay(level: DuprLevel): { label: string; helper: string } {
  return {
    label: formatStudentCoachingLevelLabel(level),
    helper: `${level} DUPR`,
  };
}

/** Inline text: "Intermediate · 3.0 DUPR" */
export function formatStudentLevelWithDuprHelper(level: DuprLevel): string {
  const { label, helper } = formatStudentLevelDisplay(level);
  return `${label} · ${helper}`;
}

/** Form select options — level first, DUPR range as helper. */
export const STUDENT_COACHING_LEVEL_SELECT_OPTIONS = COACHING_LEVEL_OPTIONS.map((o) => ({
  value: o.id,
  label: `${o.label} · ${o.dupr} DUPR`,
}));

/** Default DUPR stored when coach picks a coaching level bucket. */
export function defaultDuprForCoachingLevel(id: CoachingLevelId): DuprLevel {
  return COACHING_LEVEL_DEFAULT_DUPR[id];
}

export type ApplicationDraft = {
  firstName: string;
  lastName: string;
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
  firstName: "",
  lastName: "",
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

/** Read stored levels, or infer from legacy single rubric field. */
export function resolveCoachCoachingLevels(
  coach: Pick<CoachProfile, "coachingLevels" | "skillTemplateId">
): CoachingLevelId[] {
  if (coach.coachingLevels?.length) return coach.coachingLevels;
  const id = coach.skillTemplateId;
  if (id === "beginner" || id === "intermediate" || id === "advanced") return [id];
  return ["intermediate"];
}

export function formatCoachingLevelsLabel(levels: CoachingLevelId[]): string {
  if (levels.length === 0) return "-";
  return levels
    .map((id) => COACHING_LEVEL_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}

const COACHING_LEVEL_ORDER: CoachingLevelId[] = ["beginner", "intermediate", "advanced"];

const COACHING_LEVEL_DUPR_BOUNDS: Record<CoachingLevelId, { start: string; end: string }> = {
  beginner: { start: "2.0", end: "2.5" },
  intermediate: { start: "3.0", end: "3.5" },
  advanced: { start: "3.5+", end: "3.5+" },
};

/** Compact label + DUPR span for public coach profiles. */
export function formatPublicCoachingFocus(
  coach: Pick<CoachProfile, "coachingLevels" | "skillTemplateId">
): { levelsLabel: string; duprRange: string } {
  const selected = resolveCoachCoachingLevels(coach);
  const levels = COACHING_LEVEL_ORDER.filter((id) => selected.includes(id));
  const first = levels[0] ?? "intermediate";
  const last = levels[levels.length - 1] ?? first;

  const levelsLabel =
    levels.length === COACHING_LEVEL_OPTIONS.length
      ? "Beginner – Advanced"
      : levels.length === 1
        ? (COACHING_LEVEL_OPTIONS.find((o) => o.id === first)?.label ?? first)
        : `${COACHING_LEVEL_OPTIONS.find((o) => o.id === first)?.label} – ${COACHING_LEVEL_OPTIONS.find((o) => o.id === last)?.label}`;

  const start = COACHING_LEVEL_DUPR_BOUNDS[first].start;
  const end = COACHING_LEVEL_DUPR_BOUNDS[last].end;
  const duprRange = start === end ? start : `${start} – ${end}`;

  return { levelsLabel, duprRange };
}

export function draftToSubmitInput(draft: ApplicationDraft): SubmitApplicationInput {
  return {
    fullName: joinPersonName(draft.firstName, draft.lastName),
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
  if (!draft.firstName.trim()) return "Please enter your first name.";
  if (!draft.lastName.trim()) return "Please enter your last name.";
  if (!draft.mobile.trim()) return "Please enter your mobile number.";
  if (!draft.email.trim()) return "Please enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return "Please enter a valid email.";
  return null;
}

export function validateCoachingStep(draft: ApplicationDraft): string | null {
  if (!draft.specialization.trim()) return "Pick what you coach, or add your own.";
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
