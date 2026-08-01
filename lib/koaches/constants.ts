import type { DuprLevel, SkillCategory, SkillDefinition, SkillRubricId } from "./types";

/** @deprecated Use SkillRubricId */
export type SkillTemplateId = SkillRubricId | "all-around";

export const BRAND_NAME = "PickleKoach";
export const SITE_DOMAIN = "picklekoach.com";
export const SITE_TAGLINE = "Coach smarter.";

/** Official PickleKoach social profiles (public site footers, etc.) */
export const BRAND_SOCIAL = {
  facebook: {
    handle: "picklekoach",
    href: "https://www.facebook.com/picklekoach",
    label: "Facebook",
  },
  instagram: {
    handle: "picklekoach",
    href: "https://www.instagram.com/picklekoach",
    label: "Instagram",
  },
} as const;

export const RESERVED_SLUGS = new Set([
  "coach",
  "admin",
  "progress",
  "certificate",
  "apply",
  "join",
  "coaches",
  "for-coaches",
  "about",
  "proposal",
  "proposal-to-sarah",
  "proposal-to-sarazas",
  "proposal-to-jaysteel",
  "instagram-soft-launch",
  "instagram-posts",
  "terms",
  "privacy",
  "refund-policy",
  "settings",
  "login",
  "reports",
  "clinics",
  "api",
  "_next",
]);

/** USA Pickleball half-point skill labels (self-assessment scale clubs/tournaments use). */
export const DUPR_LEVELS: {
  level: DuprLevel;
  label: string;
  /** Rating band shown in picks (half-point levels are the band). */
  range: string;
  description: string;
}[] = [
  {
    level: "2.0",
    label: "True Beginner",
    range: "2.0",
    description: "New to the game; learning rules, contact, and short rallies",
  },
  {
    level: "2.5",
    label: "Beginner",
    range: "2.5",
    description: "Sustains short rallies; basic serve, return, and scorekeeping",
  },
  {
    level: "3.0",
    label: "Advanced Beginner",
    range: "3.0",
    description: "Medium-paced shots; developing dinks and court position",
  },
  {
    level: "3.5",
    label: "Intermediate",
    range: "3.5",
    description: "Soft game emerging; purposeful kitchen play and shot choice",
  },
  {
    level: "4.0",
    label: "Advanced Intermediate",
    range: "4.0",
    description: "Soft and hard game; strategy, anticipation, and resets",
  },
  {
    level: "4.5+",
    label: "Advanced",
    range: "4.5+",
    description: "Tournament-ready consistency, placement, and tactics",
  },
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  fundamentals: "Fundamentals",
  "serve-return": "Serve & Return",
  "third-shot": "Third Shot",
  groundstrokes: "Drives & Groundstrokes",
  kitchen: "Kitchen Game / Dinking",
  volleys: "Volleys",
  movement: "Movement & Athleticism",
  "game-iq": "Game IQ & Strategy",
  mental: "Mental Game",
};

export const ALL_SKILL_CATEGORIES: SkillCategory[] = [
  "fundamentals",
  "serve-return",
  "third-shot",
  "groundstrokes",
  "kitchen",
  "volleys",
  "movement",
  "game-iq",
  "mental",
];

export const DEFAULT_SKILLS: SkillDefinition[] = [
  // Fundamentals
  { id: "fund-grip", name: "Grip & ready position", category: "fundamentals" },
  { id: "fund-stance", name: "Stance and footwork basics", category: "fundamentals" },
  { id: "fund-court", name: "Court awareness & positioning", category: "fundamentals" },
  { id: "fund-rules", name: "Scoring & rules knowledge", category: "fundamentals" },

  // Serve & return
  { id: "serve-consistency", name: "Serve consistency", category: "serve-return" },
  { id: "serve-placement", name: "Serve placement", category: "serve-return" },
  { id: "serve-spin", name: "Serve spin & variety", category: "serve-return" },
  { id: "return-depth", name: "Return depth", category: "serve-return" },
  { id: "return-placement", name: "Return placement", category: "serve-return" },

  // Third shot
  { id: "third-drop-consistency", name: "Third shot drop consistency", category: "third-shot" },
  { id: "third-drop-placement", name: "Third shot drop placement", category: "third-shot" },
  { id: "third-drive", name: "Third shot drive", category: "third-shot" },
  { id: "drop-transition", name: "Transition-zone drop", category: "third-shot" },

  // Groundstrokes
  { id: "drive-fh", name: "Forehand drive", category: "groundstrokes" },
  { id: "drive-bh", name: "Backhand drive", category: "groundstrokes" },
  { id: "drive-spin", name: "Groundstroke spin (topspin, slice, sidespin)", category: "groundstrokes" },
  { id: "half-volley", name: "Half-volley", category: "groundstrokes" },
  { id: "lob-offensive", name: "Offensive lob", category: "groundstrokes" },
  { id: "lob-defensive", name: "Defensive lob", category: "groundstrokes" },
  { id: "atp", name: "Around the post (ATP)", category: "groundstrokes" },

  // Kitchen
  { id: "kitchen-dink-fh", name: "Forehand dink", category: "kitchen" },
  { id: "kitchen-dink-bh", name: "Backhand dink", category: "kitchen" },
  { id: "kitchen-dink-placement", name: "Dink placement & control", category: "kitchen" },
  { id: "kitchen-flick", name: "Dink flick (speed-up)", category: "kitchen" },
  { id: "kitchen-counter", name: "Counter to a speed-up", category: "kitchen" },
  { id: "kitchen-reset", name: "Reset", category: "kitchen" },
  { id: "kitchen-positioning", name: "Kitchen-line positioning", category: "kitchen" },
  { id: "kitchen-patience", name: "Patience in dink rallies", category: "kitchen" },
  { id: "kitchen-erne", name: "Erne", category: "kitchen" },
  { id: "kitchen-bert", name: "Bert", category: "kitchen" },

  // Volleys
  { id: "volley-fh", name: "Forehand volley", category: "volleys" },
  { id: "volley-bh", name: "Backhand volley", category: "volleys" },
  { id: "volley-punch", name: "Punch volley", category: "volleys" },
  { id: "volley-block", name: "Block volley", category: "volleys" },
  { id: "volley-drop", name: "Drop volley", category: "volleys" },
  { id: "volley-roll", name: "Roll volley", category: "volleys" },
  { id: "volley-speedup", name: "Speed-up volley", category: "volleys" },
  { id: "volley-overhead", name: "Overhead smash", category: "volleys" },

  // Movement
  { id: "move-split", name: "Split step", category: "movement" },
  { id: "move-transition", name: "Transition (baseline to kitchen)", category: "movement" },
  { id: "move-lateral", name: "Lateral movement & recovery", category: "movement" },
  { id: "move-partner", name: "Partner spacing & movement", category: "movement" },

  // Game IQ
  { id: "iq-selection", name: "Shot selection", category: "game-iq" },
  { id: "iq-stacking", name: "Stacking & switching", category: "game-iq" },
  { id: "iq-poach", name: "Poaching the middle", category: "game-iq" },
  { id: "iq-targeting", name: "Targeting opponent weaknesses", category: "game-iq" },
  { id: "iq-strategy", name: "Serve & return patterns", category: "game-iq" },

  // Mental
  { id: "mental-consistency", name: "Consistency under pressure", category: "mental" },
  { id: "mental-recovery", name: "Error recovery", category: "mental" },
  { id: "mental-closing", name: "Closing out games", category: "mental" },
  { id: "mental-communication", name: "Partner communication", category: "mental" },
];

export const SKILL_RUBRICS_META: Record<Exclude<SkillRubricId, "custom">, { name: string; categories: SkillCategory[] }> = {
  beginner: {
    name: "Beginner (2.0–2.5)",
    categories: ["fundamentals", "serve-return", "movement"],
  },
  intermediate: {
    name: "Intermediate (3.0–3.5)",
    categories: ["third-shot", "groundstrokes", "kitchen", "volleys", "movement"],
  },
  advanced: {
    name: "Advanced (4.0+)",
    categories: ALL_SKILL_CATEGORIES,
  },
};

export function normalizeRubricId(id: SkillRubricId | "all-around" | SkillTemplateId): SkillRubricId {
  if (id === "all-around") return "advanced";
  return id;
}

export function getSkillsForRubric(rubricId: SkillRubricId | "all-around", customSkillIds?: string[]): SkillDefinition[] {
  const id = normalizeRubricId(rubricId);
  if (id === "custom" && customSkillIds?.length) {
    return DEFAULT_SKILLS.filter((s) => customSkillIds.includes(s.id));
  }
  if (id === "custom") return DEFAULT_SKILLS;
  const cats = SKILL_RUBRICS_META[id].categories;
  return DEFAULT_SKILLS.filter((s) => cats.includes(s.category));
}

/**
 * Old catalog ids → current ids so saved coach skill lists still resolve
 * after cleanup / renames.
 */
export const SKILL_ID_ALIASES: Record<string, string> = {
  "serve-drop": "serve-spin",
  "serve-volley": "serve-consistency",
  "third-transition": "move-transition",
  "drive-topspin": "drive-spin",
  "drive-backspin": "drive-spin",
  "drive-sidespin": "drive-spin",
  "drive-bh-twohand": "drive-bh",
  lob: "lob-offensive",
  "kitchen-dink-consistency": "kitchen-dink-placement",
};

export function canonicalizeSkillId(skillId: string): string {
  return SKILL_ID_ALIASES[skillId] ?? skillId;
}

export type SkillRubricConfig = {
  rubricId: SkillRubricId;
  customSkillIds?: string[];
  customSkills?: SkillDefinition[];
  skillLabelOverrides?: Record<string, string>;
};

export function isCoachCustomSkillId(id: string): boolean {
  return id.startsWith("custom-");
}

export function newCustomSkillId(): string {
  return `custom-${crypto.randomUUID().slice(0, 8)}`;
}

/** Resolve the skill list for ratings — catalog picks, coach-owned skills, and label overrides */
export function resolveSkills(config: SkillRubricConfig): SkillDefinition[] {
  const effectiveRubricId =
    config.rubricId === "custom" || config.customSkillIds?.length ? "custom" : config.rubricId;

  const selectedIds =
    config.customSkillIds?.length
      ? config.customSkillIds
      : getSkillsForRubric(effectiveRubricId).map((skill) => skill.id);

  const customById = new Map((config.customSkills ?? []).map((skill) => [skill.id, skill]));
  const overrides = config.skillLabelOverrides ?? {};

  const canonicalIds = [
    ...new Set(selectedIds.map((id) => (customById.has(id) ? id : canonicalizeSkillId(id)))),
  ];

  return canonicalIds
    .map((id) => {
      const owned = customById.get(id);
      if (owned) return owned;

      const catalog = DEFAULT_SKILLS.find((skill) => skill.id === id);
      if (!catalog) return null;

      const label = overrides[id]?.trim();
      return label ? { ...catalog, name: label } : catalog;
    })
    .filter((skill): skill is SkillDefinition => skill !== null);
}

export function resolveSkillDefinition(
  skillId: string,
  config: Pick<SkillRubricConfig, "customSkills" | "skillLabelOverrides">
): SkillDefinition | undefined {
  const owned = config.customSkills?.find((skill) => skill.id === skillId);
  if (owned) return owned;

  const canonicalId = canonicalizeSkillId(skillId);
  const catalog = DEFAULT_SKILLS.find((skill) => skill.id === canonicalId);
  if (!catalog) return undefined;

  const label =
    config.skillLabelOverrides?.[skillId]?.trim() ||
    config.skillLabelOverrides?.[canonicalId]?.trim();
  return label ? { ...catalog, name: label } : catalog;
}

export function categoryAverages(ratings: { category: SkillCategory; score: number }[]) {
  const sums: Partial<Record<SkillCategory, { total: number; count: number }>> = {};
  for (const r of ratings) {
    if (!sums[r.category]) sums[r.category] = { total: 0, count: 0 };
    sums[r.category]!.total += r.score;
    sums[r.category]!.count += 1;
  }
  return ALL_SKILL_CATEGORIES.map((cat) => ({
    category: cat,
    label: SKILL_CATEGORY_LABELS[cat],
    score: sums[cat] ? sums[cat]!.total / sums[cat]!.count : 0,
  })).filter((c) => (sums[c.category]?.count ?? 0) > 0);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
