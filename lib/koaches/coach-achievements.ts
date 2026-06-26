import type { CoachAchievement, CoachAchievementKind } from "./types";

export const ACHIEVEMENT_KIND_LABELS: Record<CoachAchievementKind, string> = {
  competition: "Competition",
  tournament: "Tournament",
  league: "League",
  certification: "Certification",
  education: "Education",
};

export const ACHIEVEMENT_KINDS: CoachAchievementKind[] = [
  "certification",
  "education",
  "tournament",
  "competition",
  "league",
];

export function createCoachAchievementId(): string {
  return `ach-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sortCoachAchievements(achievements: CoachAchievement[]): CoachAchievement[] {
  return [...achievements].sort((a, b) => {
    const yearA = parseInt(a.year ?? "0", 10);
    const yearB = parseInt(b.year ?? "0", 10);
    if (yearB !== yearA) return yearB - yearA;
    return a.title.localeCompare(b.title);
  });
}

export function validateCoachAchievement(
  achievement: Pick<CoachAchievement, "title" | "kind">
): string | null {
  if (!achievement.title.trim()) return "Title is required.";
  if (!ACHIEVEMENT_KINDS.includes(achievement.kind)) return "Choose a valid type.";
  return null;
}

export function formatAchievementSubtitle(achievement: CoachAchievement): string {
  const parts = [achievement.organization, achievement.year, achievement.detail].filter(Boolean);
  return parts.join(" · ");
}

export type CoachAchievementDraft = {
  id: string;
  kind: CoachAchievementKind;
  title: string;
  organization: string;
  year: string;
  detail: string;
};

export function achievementToDraft(achievement: CoachAchievement): CoachAchievementDraft {
  return {
    id: achievement.id,
    kind: achievement.kind,
    title: achievement.title,
    organization: achievement.organization ?? "",
    year: achievement.year ?? "",
    detail: achievement.detail ?? "",
  };
}

export function draftToAchievement(draft: CoachAchievementDraft): CoachAchievement {
  return {
    id: draft.id,
    kind: draft.kind,
    title: draft.title.trim(),
    organization: draft.organization.trim() || undefined,
    year: draft.year.trim() || undefined,
    detail: draft.detail.trim() || undefined,
  };
}

export function draftsToAchievements(drafts: CoachAchievementDraft[]): CoachAchievement[] {
  return drafts.map(draftToAchievement);
}
