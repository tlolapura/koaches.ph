import type { ProgramPreset, ProgramPresetId, SkillRubric, SkillRubricId } from "./types";
import {
  ALL_SKILL_CATEGORIES,
  DEFAULT_SKILLS,
  SKILL_CATEGORY_LABELS,
  getSkillsForRubric,
} from "./constants";

/** Base rubrics — Google Form-style skill questionnaires by player level */
export const SKILL_RUBRICS: Record<Exclude<SkillRubricId, "custom">, SkillRubric> = {
  beginner: {
    id: "beginner",
    name: "Beginner",
    subtitle: "2.0 – 2.5 DUPR",
    duprRange: "2.0 – 2.5",
    description:
      "Foundation rubric for new players. Covers grip, rules, serve & return basics, and court movement — the essentials before open play.",
    categories: ["fundamentals", "serve-return", "movement"],
  },
  intermediate: {
    id: "intermediate",
    name: "Intermediate",
    subtitle: "3.0 – 3.5 DUPR",
    duprRange: "3.0 – 3.5",
    description:
      "Core competitive skills rubric. Third shot, kitchen game, volleys, and athletic movement — the shots that separate recreational from solid intermediate play.",
    categories: ["third-shot", "kitchen", "volleys", "movement"],
  },
  advanced: {
    id: "advanced",
    name: "Advanced",
    subtitle: "3.5+ DUPR",
    duprRange: "3.5+",
    description:
      "Full assessment across all 8 PCI / USA Pickleball categories including game IQ and mental game — for tournament-ready and competitive players.",
    categories: ALL_SKILL_CATEGORIES,
  },
};

/** Ready-made program templates coaches can adopt and customize */
export const PROGRAM_PRESETS: ProgramPreset[] = [
  {
    id: "open-play-ready",
    name: "Open Play Ready",
    tagline: "Join open play with confidence",
    icon: "users",
    description: "Get comfortable on the court and join open play confidently. Perfect for players who know the rules but need consistency.",
    rubricId: "beginner",
    sessionCount: 4,
    price: 2500,
    targetLevel: "2.0 to 3.0",
  },
  {
    id: "first-paddle",
    name: "First Paddle",
    tagline: "Brand new to pickleball",
    icon: "target",
    description: "Gentle intro for absolute beginners. Learn scoring, grip, and your first rallies in a structured 4-session path.",
    rubricId: "beginner",
    sessionCount: 4,
    price: 2200,
    targetLevel: "2.0 to 2.5",
  },
  {
    id: "tournament-ready",
    name: "Tournament Ready",
    tagline: "Compete with confidence",
    icon: "trophy",
    description: "Build real game skills, strategy, and mental readiness to compete. Third shots, dinking, and match play under pressure.",
    rubricId: "intermediate",
    sessionCount: 12,
    price: 7000,
    targetLevel: "3.0 to 3.5+",
  },
  {
    id: "kitchen-mastery",
    name: "Kitchen Mastery",
    tagline: "Own the NVZ",
    icon: "kitchen",
    description: "8 sessions focused on dinking, resets, and kitchen positioning. For players who rally well but lose points at the net.",
    rubricId: "intermediate",
    sessionCount: 8,
    price: 4800,
    targetLevel: "3.0 to 3.5",
  },
  {
    id: "competitive-doubles",
    name: "Competitive Doubles",
    tagline: "Tournament doubles prep",
    icon: "zap",
    description: "Full advanced rubric with stacking, partner communication, and targeting weaknesses. For players chasing podiums.",
    rubricId: "advanced",
    sessionCount: 12,
    price: 9000,
    targetLevel: "3.5 to 4.5+",
  },
];

export function getProgramPreset(id: ProgramPresetId) {
  return PROGRAM_PRESETS.find((p) => p.id === id);
}

export function getRubric(id: SkillRubricId): SkillRubric | null {
  if (id === "custom") return null;
  return SKILL_RUBRICS[id];
}

export function getRubricSkillCount(rubricId: SkillRubricId, customSkillIds?: string[]) {
  if (rubricId === "custom" && customSkillIds?.length) return customSkillIds.length;
  if (rubricId === "custom") return DEFAULT_SKILLS.length;
  return getSkillsForRubric(rubricId).length;
}

export function getRubricCategoryBreakdown(rubricId: SkillRubricId, customSkillIds?: string[]) {
  const skills =
    rubricId === "custom" && customSkillIds?.length
      ? DEFAULT_SKILLS.filter((s) => customSkillIds.includes(s.id))
      : rubricId === "custom"
        ? DEFAULT_SKILLS
        : getSkillsForRubric(rubricId);

  const map = new Map<string, string[]>();
  for (const s of skills) {
    const label = SKILL_CATEGORY_LABELS[s.category];
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(s.name);
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
}

export function resolveProgramRubric(program: {
  rubricId?: SkillRubricId;
  skillTemplateId?: SkillRubricId;
}): SkillRubricId {
  return program.rubricId ?? program.skillTemplateId ?? "intermediate";
}

export type ProgramDraft = {
  source: "preset" | "rubric" | "custom";
  presetId?: ProgramPresetId;
  rubricId: SkillRubricId;
  name: string;
  description: string;
  price: number;
  sessionCount: number;
  targetLevel: string;
  customSkillIds?: string[];
};

export function draftFromPreset(presetId: ProgramPresetId): ProgramDraft {
  const preset = getProgramPreset(presetId)!;
  return {
    source: "preset",
    presetId,
    rubricId: preset.rubricId,
    name: preset.name,
    description: preset.description,
    price: preset.price,
    sessionCount: preset.sessionCount,
    targetLevel: preset.targetLevel,
  };
}

export function draftFromRubric(rubricId: Exclude<SkillRubricId, "custom">): ProgramDraft {
  const rubric = SKILL_RUBRICS[rubricId];
  return {
    source: "rubric",
    rubricId,
    name: `${rubric.name} Program`,
    description: rubric.description,
    price: rubricId === "beginner" ? 2500 : rubricId === "intermediate" ? 5000 : 8000,
    sessionCount: rubricId === "beginner" ? 4 : rubricId === "intermediate" ? 8 : 12,
    targetLevel: rubric.duprRange,
  };
}

export function draftCustom(): ProgramDraft {
  const beginnerSkills = getSkillsForRubric("beginner").map((s) => s.id);
  return {
    source: "custom",
    rubricId: "custom",
    name: "",
    description: "",
    price: 3000,
    sessionCount: 4,
    targetLevel: "2.0 to 3.0",
    customSkillIds: beginnerSkills,
  };
}
