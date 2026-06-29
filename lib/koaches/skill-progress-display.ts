import type { SkillRating } from "./types";

export const SKILL_SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Starting out",
  2: "Learning",
  3: "Consistent",
  4: "Strong",
  5: "Excellent",
};

export function scoreLabel(score: number): string {
  const rounded = Math.min(5, Math.max(1, Math.round(score))) as 1 | 2 | 3 | 4 | 5;
  return SKILL_SCORE_LABELS[rounded];
}

export type SkillChange = {
  skillId: string;
  skillName: string;
  category: SkillRating["category"];
  before: number;
  after: number;
  delta: number;
};

export function buildSkillChanges(before: SkillRating[], after: SkillRating[]): SkillChange[] {
  return before
    .filter((b) => !b.skipped)
    .map((b) => {
      const a = after.find((x) => x.skillId === b.skillId);
      if (a?.skipped) return null;
      const afterScore = a?.score ?? b.score;
      return {
        skillId: b.skillId,
        skillName: b.skillName,
        category: b.category,
        before: b.score,
        after: afterScore,
        delta: afterScore - b.score,
      };
    })
    .filter((change): change is SkillChange => change !== null)
    .sort((a, b) => b.delta - a.delta || a.skillName.localeCompare(b.skillName));
}

export function summarizeSkillChanges(changes: SkillChange[]) {
  const improved = changes.filter((c) => c.delta > 0);
  const same = changes.filter((c) => c.delta === 0);
  const slipped = changes.filter((c) => c.delta < 0);
  return { improved, same, slipped, improvedCount: improved.length };
}

export function sessionProgressHeadline(changes: SkillChange[]): string {
  const { improvedCount, slipped } = summarizeSkillChanges(changes);
  if (improvedCount === 0 && slipped.length === 0) {
    return "Held steady — good consistency";
  }
  if (improvedCount === 0) {
    return "Tough session — keep building";
  }
  if (improvedCount === 1) {
    return "1 skill leveled up";
  }
  return `${improvedCount} skills leveled up`;
}

export function journeyHeadline(
  sessionCount: number,
  overallBefore: SkillRating[],
  overallAfter: SkillRating[]
): string {
  const changes = buildSkillChanges(overallBefore, overallAfter);
  const { improvedCount } = summarizeSkillChanges(changes);
  if (improvedCount === 0) {
    return `${sessionCount} sessions — building a solid base`;
  }
  return `${improvedCount} skill${improvedCount !== 1 ? "s" : ""} stronger since day one`;
}
