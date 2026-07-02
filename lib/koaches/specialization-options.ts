/** Suggested coaching focus areas — tap to select instead of free-typing from scratch. */
export const SPECIALIZATION_SUGGESTIONS = [
  "Beginner fundamentals",
  "Intermediate strategy",
  "Advanced / tournament prep",
  "Kitchen & dinking",
  "Doubles strategy",
  "Singles",
  "Juniors & youth",
  "Seniors",
  "Private 1-on-1",
  "Group clinics",
] as const;

export type SpecializationSuggestion = (typeof SPECIALIZATION_SUGGESTIONS)[number];

const SUGGESTION_SET = new Set<string>(SPECIALIZATION_SUGGESTIONS);

export function joinSpecialization(parts: string[]): string {
  return parts.map((part) => part.trim()).filter(Boolean).join(" · ");
}

export function parseSpecialization(value: string): { suggestions: string[]; custom: string } {
  const trimmed = value.trim();
  if (!trimmed) return { suggestions: [], custom: "" };

  const parts = trimmed.split("·").map((part) => part.trim()).filter(Boolean);
  const suggestions: string[] = [];
  const customParts: string[] = [];

  for (const part of parts) {
    if (SUGGESTION_SET.has(part)) {
      suggestions.push(part);
    } else {
      customParts.push(part);
    }
  }

  return { suggestions, custom: customParts.join(" · ") };
}

export function buildSpecialization(suggestions: string[], custom: string): string {
  const customTrimmed = custom.trim();
  return joinSpecialization(customTrimmed ? [...suggestions, customTrimmed] : suggestions);
}

export const SPECIALIZATION_PICKER_HINT =
  "Tap what best describes your coaching. Pick up to 3, then add your own words if needed.";
