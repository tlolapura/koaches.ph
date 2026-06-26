"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCoachAuth } from "@/components/koaches/coach/CoachAuthProvider";
import { coachNotificationsAction } from "@/lib/koaches/actions/nav-badges";
import { PROGRESS_CARDS_UPDATED_EVENT } from "@/lib/koaches/progress-cards";
import { coachKeys } from "@/lib/koaches/queries/keys";

const EMPTY_COUNTS = {
  pendingIntakes: 0,
  progressReady: 0,
  unpaidSessionsToday: 0,
  billingAttention: 0,
} as const;

export function useCoachNavBadges() {
  const { coachId, loading: authLoading } = useCoachAuth();

  const query = useQuery({
    queryKey: [...coachKeys.all, "notifications", coachId] as const,
    queryFn: () => coachNotificationsAction(),
    enabled: !!coachId && !authLoading,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!coachId || authLoading) return;

    const refresh = () => {
      void query.refetch();
    };

    window.addEventListener("koaches-intake-updated", refresh);
    window.addEventListener(PROGRESS_CARDS_UPDATED_EVENT, refresh);
    window.addEventListener("koaches-sessions-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("koaches-intake-updated", refresh);
      window.removeEventListener(PROGRESS_CARDS_UPDATED_EVENT, refresh);
      window.removeEventListener("koaches-sessions-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [authLoading, coachId, query]);

  return {
    counts: query.data?.counts ?? EMPTY_COUNTS,
    items: query.data?.items ?? [],
    loading: query.isPending,
    refresh: () => query.refetch(),
  };
}
