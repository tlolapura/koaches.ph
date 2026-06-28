import type { CoachProfile } from "@/lib/koaches/types";
import { getStartingRate } from "@/lib/koaches/pricing";

export function isCoachProfileSetupComplete(coach: CoachProfile): boolean {
  return Boolean(
    coach.bio?.trim() &&
    coach.mobile?.trim() &&
    getStartingRate(coach.sessionPricing) > 0
  );
}

/** True until the coach finishes the required one-time setup wizard. */
export function needsCoachOnboarding(coach: CoachProfile): boolean {
  return !coach.onboardingCompletedAt;
}

export function shouldShowCoachOnboarding(coach: CoachProfile): boolean {
  return needsCoachOnboarding(coach);
}
