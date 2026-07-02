import type { CoachProfile } from "@/lib/koaches/types";
import { getSubscriptionBillingInfo } from "@/lib/koaches/subscription-billing";

/** Routes a restricted coach may still access (billing, account, sign out). */
export const COACH_RESTRICTED_ALLOWED_PREFIXES = [
  "/coach/settings",
  "/coach/billing",
  "/coach/profile",
  "/coach/more",
  "/coach/onboarding",
] as const;

export function isCoachRestrictedPathAllowed(pathname: string): boolean {
  return COACH_RESTRICTED_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function coachPortalIsRestricted(
  coach: Pick<CoachProfile, "isActive" | "subscriptionExpiry" | "subscriptionPlan">
): boolean {
  if (!coach.isActive) return true;
  const billing = getSubscriptionBillingInfo(coach);
  return billing.status === "lapsed";
}
