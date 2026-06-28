"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { needsCoachOnboarding } from "@/lib/koaches/coach-onboarding";

export function CoachOnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const coachId = usePortalCoachId();
  const { coach, loading, fetching } = useCoachProfile(coachId);

  useEffect(() => {
    if (!coachId || loading || fetching || !coach) return;

    const onOnboarding = pathname.startsWith("/coach/onboarding");

    if (needsCoachOnboarding(coach) && !onOnboarding) {
      router.replace("/coach/onboarding");
      return;
    }

    if (!needsCoachOnboarding(coach) && onOnboarding) {
      router.replace("/coach/dashboard");
    }
  }, [coach, coachId, fetching, loading, pathname, router]);

  return null;
}
