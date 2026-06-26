import type { CoachListing } from "./types";

export type ExperienceLevel = "brand-new" | "beginner" | "intermediate" | "advanced";

export type DiscoveryFilters = {
  search?: string;
  region?: string;
  city?: string;
  courtId?: string;
  level?: ExperienceLevel;
  maxRate?: number;
  freeTrialOnly?: boolean;
};

export type FinderAnswers = {
  region?: string;
  level?: ExperienceLevel;
  maxRate?: number;
};

export const REGIONS = [
  { id: "Metro Manila", label: "Metro Manila", hint: "BGC, QC, Marikina & more" },
  { id: "Cebu", label: "Cebu", hint: "Cebu City area" },
  { id: "Davao", label: "Davao", hint: "Davao City area" },
] as const;

export const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string; hint: string }[] = [
  { id: "brand-new", label: "Brand new", hint: "I've never played or just started" },
  { id: "beginner", label: "Beginner", hint: "I know the basics, still learning" },
  { id: "intermediate", label: "Intermediate", hint: "I play regularly, want to improve" },
  { id: "advanced", label: "Advanced", hint: "Tournament or competitive play" },
];

export const BUDGET_OPTIONS = [
  { id: "any", label: "Any budget", maxRate: undefined },
  { id: "low", label: "Under ₱700", maxRate: 700 },
  { id: "mid", label: "₱700 – ₱1,000", maxRate: 1000 },
  { id: "high", label: "₱1,000+", maxRate: undefined as number | undefined },
] as const;

const LEVEL_KEYWORDS: Record<ExperienceLevel, string[]> = {
  "brand-new": ["beginner", "first-time", "first time", "kids", "new players", "intro"],
  beginner: ["beginner", "beginner-friendly", "beginner & intermediate"],
  intermediate: ["intermediate", "all-around", "movement"],
  advanced: ["advanced", "competitive", "tournament", "doubles"],
};

function coachMatchesLevel(coach: CoachListing, level: ExperienceLevel): boolean {
  const text = `${coach.specialization} ${coach.bio}`.toLowerCase();
  const keywords = LEVEL_KEYWORDS[level];
  if (level === "brand-new" || level === "beginner") {
    return keywords.some((k) => text.includes(k)) || coach.ratePerSession <= 850;
  }
  if (level === "advanced") {
    return keywords.some((k) => text.includes(k));
  }
  return keywords.some((k) => text.includes(k)) || !text.includes("advanced");
}

export function filterCoaches(coaches: CoachListing[], filters: DiscoveryFilters): CoachListing[] {
  const q = filters.search?.trim().toLowerCase();

  return coaches.filter((coach) => {
    if (filters.region && !coach.courts.some((c) => c.region === filters.region)) return false;
    if (filters.city && !coach.courts.some((c) => c.city === filters.city)) return false;
    if (filters.courtId && !coach.courts.some((c) => c.id === filters.courtId)) return false;
    if (filters.level && !coachMatchesLevel(coach, filters.level)) return false;
    if (filters.maxRate && coach.ratePerSession > filters.maxRate) return false;
    if (filters.freeTrialOnly && !coach.freeTrialEnabled) return false;

    if (q) {
      const haystack = [
        coach.name,
        coach.specialization,
        coach.bio,
        ...coach.courts.flatMap((c) => [c.name, c.address, c.city, c.region]),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function recommendCoaches(
  coaches: CoachListing[],
  answers: FinderAnswers
): { coach: CoachListing; reasons: string[] }[] {
  const filtered = filterCoaches(coaches, {
    region: answers.region,
    level: answers.level,
    maxRate: answers.maxRate,
  });

  const scored = (filtered.length ? filtered : coaches).map((coach) => {
    const reasons: string[] = [];
    let score = 0;

    if (answers.region && coach.courts.some((c) => c.region === answers.region)) {
      score += 3;
      reasons.push(`Coaches in ${answers.region}`);
    }
    if (answers.level && coachMatchesLevel(coach, answers.level)) {
      score += 3;
      const label = EXPERIENCE_OPTIONS.find((o) => o.id === answers.level)?.label;
      if (label) reasons.push(`Good fit for ${label.toLowerCase()} players`);
    }
    if (answers.maxRate && coach.ratePerSession <= answers.maxRate) {
      score += 2;
      reasons.push(`Within your budget at ₱${coach.ratePerSession}/session`);
    }
    if (coach.freeTrialEnabled) {
      score += 1;
      reasons.push("Offers a free trial session");
    }
    if (coach.totalStudents >= 20) {
      score += 1;
      reasons.push(`${coach.totalStudents}+ students coached`);
    }

    if (reasons.length === 0) {
      reasons.push(coach.specialization);
      if (coach.courts[0]?.name) {
        reasons.push(`Sessions at ${coach.courts[0].name}`);
      }
    }

    return { coach, score, reasons: reasons.slice(0, 3) };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ coach, reasons }) => ({ coach, reasons }));
}
