import type { SkillCategory, SkillRating } from "./types";

export type SkillScore = 0 | 1 | 2 | 3 | 4 | 5;

export const SKILL_SCORE_LABELS: Record<SkillScore, string> = {
  0: "Not introduced yet",
  1: "Starting out",
  2: "Learning",
  3: "Consistent",
  4: "Strong",
  5: "Competition-ready",
};

const CATEGORY_SCORE_LABELS: Record<SkillCategory, Record<SkillScore, string>> = {
  fundamentals: {
    0: "Not introduced yet",
    1: "Needs full coach guidance each rep",
    2: "Understands basics, execution still inconsistent",
    3: "Executes fundamentals in normal drills",
    4: "Reliable fundamentals under game pace",
    5: "Automatic fundamentals even under pressure",
  },
  "serve-return": {
    0: "Not introduced yet",
    1: "Serve/return often misses or sits up",
    2: "Gets ball in play with limited depth/placement",
    3: "Consistently in play with usable depth",
    4: "Intentional placement creates weak replies",
    5: "Controls serve/return patterns strategically",
  },
  "third-shot": {
    0: "Not introduced yet",
    1: "Rarely attempts effective third-shot decision",
    2: "Attempts drop/drive with mixed outcomes",
    3: "Can execute chosen third shot with consistency",
    4: "Uses drop/drive intentionally by ball quality",
    5: "Third-shot choices consistently win transition",
  },
  kitchen: {
    0: "Not introduced yet",
    1: "Dinks/resets break down quickly",
    2: "Sustains short dink/reset exchanges",
    3: "Keeps control in medium rallies at kitchen",
    4: "Moves opponents with placement and patience",
    5: "Dictates kitchen exchanges with intent",
  },
  volleys: {
    0: "Not introduced yet",
    1: "Volley timing/contact often unstable",
    2: "Can block medium pace with variable control",
    3: "Controls forehand/backhand volleys reliably",
    4: "Blocks, punches, and put-aways with purpose",
    5: "Executes advanced volley choices consistently",
  },
  movement: {
    0: "Not introduced yet",
    1: "Footwork and recovery frequently late",
    2: "Reaches position but balance varies",
    3: "Moves and recovers well in standard patterns",
    4: "Efficient transitions under faster tempo",
    5: "Elite movement and court coverage consistency",
  },
  "game-iq": {
    0: "Not introduced yet",
    1: "Limited tactical decision-making awareness",
    2: "Recognizes obvious high/low percentage choices",
    3: "Makes generally sound shot decisions",
    4: "Adapts tactics to opponents and score",
    5: "Advanced strategic control point-to-point",
  },
  mental: {
    0: "Not introduced yet",
    1: "Focus/confidence drops after errors",
    2: "Recovers mentally with coach prompting",
    3: "Maintains composure through normal pressure",
    4: "Stays composed and communicates proactively",
    5: "High resilience and leadership under pressure",
  },
};

const SCORE_OVERRIDE_PREFIX = "__score__:";

export function scoreOverrideKey(skillId: string, score: SkillScore): string {
  return `${SCORE_OVERRIDE_PREFIX}${skillId}:${score}`;
}

export function scoreOverridesForSkill(
  skillId: string,
  overrides?: Record<string, string>
): Partial<Record<SkillScore, string>> {
  const result: Partial<Record<SkillScore, string>> = {};
  if (!overrides) return result;
  for (const score of [0, 1, 2, 3, 4, 5] as const) {
    const value = overrides[scoreOverrideKey(skillId, score)]?.trim();
    if (value) result[score] = value;
  }
  return result;
}

export function scoreLabelsForSkill(
  skillId: string,
  category?: SkillCategory,
  overrides?: Record<string, string>
): Record<SkillScore, string> {
  const custom = scoreOverridesForSkill(skillId, overrides);
  const base = category ? CATEGORY_SCORE_LABELS[category] : SKILL_SCORE_LABELS;
  return {
    0: custom[0] ?? base[0],
    1: custom[1] ?? base[1],
    2: custom[2] ?? base[2],
    3: custom[3] ?? base[3],
    4: custom[4] ?? base[4],
    5: custom[5] ?? base[5],
  };
}

export function scoreLabel(
  score: number,
  labels: Record<SkillScore, string> = SKILL_SCORE_LABELS
): string {
  const rounded = Math.min(5, Math.max(0, Math.round(score))) as SkillScore;
  return labels[rounded];
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
    .filter((b) => b.skipped === false)
    .map((b) => {
      const a = after.find((x) => x.skillId === b.skillId);
      if (a?.skipped !== false) return null;
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
