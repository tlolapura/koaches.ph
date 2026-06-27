"use client";

import { useEffect } from "react";
import { useCoachAuth } from "@/components/koaches/coach/CoachAuthProvider";
import { fetchCoachProfileAction } from "@/lib/koaches/actions/coach-profile";
import { fetchProgressCardsAction } from "@/lib/koaches/actions/progress-cards";
import { fetchProgramsAction } from "@/lib/koaches/actions/programs";
import { coachNavMetaAction } from "@/lib/koaches/actions/nav-badges";
import { fetchSessionsAction } from "@/lib/koaches/actions/sessions";
import { fetchStudentsAction } from "@/lib/koaches/actions/students";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { getQueryClient } from "@/lib/koaches/queries/client";

/** Warm shared React Query cache after auth — speeds up first navigation. */
export function CoachPortalPrefetch() {
  const { coachId, loading } = useCoachAuth();

  useEffect(() => {
    if (loading || !coachId) return;

    const qc = getQueryClient();
    void Promise.all([
      qc.prefetchQuery({
        queryKey: coachKeys.sessions(coachId),
        queryFn: () => fetchSessionsAction(coachId),
      }),
      qc.prefetchQuery({
        queryKey: [...coachKeys.all, "profile", coachId] as const,
        queryFn: () => fetchCoachProfileAction(coachId),
      }),
      qc.prefetchQuery({
        queryKey: coachKeys.programs(coachId),
        queryFn: () => fetchProgramsAction(coachId),
      }),
      qc.prefetchQuery({
        queryKey: coachKeys.students(coachId),
        queryFn: () => fetchStudentsAction(coachId),
      }),
      qc.prefetchQuery({
        queryKey: [...coachKeys.all, "progress-cards", coachId] as const,
        queryFn: () => fetchProgressCardsAction(coachId),
      }),
      qc.prefetchQuery({
        queryKey: [...coachKeys.all, "nav-meta", coachId] as const,
        queryFn: () => coachNavMetaAction(),
      }),
    ]);
  }, [coachId, loading]);

  return null;
}
