import type { DuprLevel, SkillCategory, SkillDefinition, SkillRubricId } from "./types";

/** @deprecated Use SkillRubricId */
export type SkillTemplateId = SkillRubricId | "all-around";

export const BRAND_NAME = "PickleKoach";
export const SITE_DOMAIN = "picklekoach.com";
export const SITE_TAGLINE = "Coach smarter.";

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
  "login",
  "reports",
  "api",
  "_next",
]);

export const DUPR_LEVELS: { level: DuprLevel; label: string; description: string }[] = [
  { level: "2.0", label: "Beginner", description: "Just learning rules, basic strokes unreliable" },
  { level: "2.5", label: "Advanced Beginner", description: "Basic consistency developing, limited strategy" },
  { level: "3.0", label: "Intermediate", description: "Can rally, understands positioning, learning third shot" },
  { level: "3.5", label: "Solid Intermediate", description: "Developing drops, dinking with control, basic strategy" },
  { level: "4.0", label: "Advanced Intermediate", description: "Strong shot control, tactical awareness, resets" },
  { level: "4.5+", label: "Advanced / Expert", description: "Tournament-level, elite strategy and consistency" },
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  fundamentals: "Fundamentals",
  "serve-return": "Serve & Return",
  "third-shot": "Third Shot",
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
  "kitchen",
  "volleys",
  "movement",
  "game-iq",
  "mental",
];

export const DEFAULT_SKILLS: SkillDefinition[] = [
  { id: "fund-grip", name: "Grip & ready position", category: "fundamentals" },
  { id: "fund-stance", name: "Stance and footwork basics", category: "fundamentals" },
  { id: "fund-court", name: "Court awareness & positioning", category: "fundamentals" },
  { id: "fund-rules", name: "Scoring & rules knowledge", category: "fundamentals" },
  { id: "serve-consistency", name: "Serve consistency (legal, in-court)", category: "serve-return" },
  { id: "serve-placement", name: "Serve placement (depth, direction)", category: "serve-return" },
  { id: "return-depth", name: "Return of serve depth", category: "serve-return" },
  { id: "return-placement", name: "Return of serve placement", category: "serve-return" },
  { id: "third-drop-consistency", name: "Third shot drop consistency", category: "third-shot" },
  { id: "third-drop-placement", name: "Third shot drop placement", category: "third-shot" },
  { id: "third-drive", name: "Third shot drive (as change-up)", category: "third-shot" },
  { id: "third-transition", name: "Transition movement after third shot", category: "third-shot" },
  { id: "kitchen-dink-consistency", name: "Dinking consistency (cross-court and straight)", category: "kitchen" },
  { id: "kitchen-dink-placement", name: "Dink placement & control", category: "kitchen" },
  { id: "kitchen-positioning", name: "Kitchen line positioning", category: "kitchen" },
  { id: "kitchen-patience", name: "Patience in dink rallies", category: "kitchen" },
  { id: "kitchen-reset", name: "Reset ability (neutralizing fast balls)", category: "kitchen" },
  { id: "volley-fh", name: "Forehand volley control", category: "volleys" },
  { id: "volley-bh", name: "Backhand volley control", category: "volleys" },
  { id: "volley-speedup", name: "Speed-up / punch volley", category: "volleys" },
  { id: "volley-overhead", name: "Overhead smash", category: "volleys" },
  { id: "move-split", name: "Split step timing", category: "movement" },
  { id: "move-transition", name: "Transition (baseline to kitchen)", category: "movement" },
  { id: "move-lateral", name: "Lateral movement & recovery", category: "movement" },
  { id: "move-partner", name: "Partner coordination (doubles)", category: "movement" },
  { id: "iq-selection", name: "Shot selection under pressure", category: "game-iq" },
  { id: "iq-stacking", name: "Stacking & switching (doubles)", category: "game-iq" },
  { id: "iq-targeting", name: "Identifying & targeting opponent weaknesses", category: "game-iq" },
  { id: "iq-strategy", name: "Serve & return strategy", category: "game-iq" },
  { id: "mental-consistency", name: "Consistency under pressure", category: "mental" },
  { id: "mental-recovery", name: "Error recovery & reset mindset", category: "mental" },
  { id: "mental-closing", name: "Closing out tight games", category: "mental" },
  { id: "mental-communication", name: "Communication with partner", category: "mental" },
];

export const SKILL_RUBRICS_META: Record<Exclude<SkillRubricId, "custom">, { name: string; categories: SkillCategory[] }> = {
  beginner: {
    name: "Beginner (2.0–2.5)",
    categories: ["fundamentals", "serve-return", "movement"],
  },
  intermediate: {
    name: "Intermediate (3.0–3.5)",
    categories: ["third-shot", "kitchen", "volleys", "movement"],
  },
  advanced: {
    name: "Advanced (3.5+)",
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
