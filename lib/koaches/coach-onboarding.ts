import type { CoachProfile } from "@/lib/koaches/types";
import { getStartingRate } from "@/lib/koaches/pricing";

export const COACH_ONBOARDING_KEY = "koaches-coach-onboarded";

export function isCoachProfileSetupComplete(coach: CoachProfile): boolean {
  return Boolean(
    coach.bio?.trim() &&
    coach.mobile?.trim() &&
    getStartingRate(coach.sessionPricing) > 0
  );
}

export function shouldShowCoachOnboarding(coach: CoachProfile): boolean {
  if (typeof window !== "undefined" && localStorage.getItem(COACH_ONBOARDING_KEY) === "1") {
    return false;
  }
  return !isCoachProfileSetupComplete(coach);
}

export function markCoachOnboardingComplete(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(COACH_ONBOARDING_KEY, "1");
  }
}
