"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchCoachProfileAction } from "@/lib/koaches/actions/coach-profile";
import { coachKeys } from "@/lib/koaches/queries/keys";

export const COACH_PHOTO_UPDATED_EVENT = "koaches-coach-photo-updated";

export function useCoachProfile(coachId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...coachKeys.all, "profile", coachId] as const,
    queryFn: () => fetchCoachProfileAction(coachId),
    enabled: !!coachId,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!coachId) return;

    const refresh = (event: Event) => {
      const detail = (event as CustomEvent<{ coachId?: string }>).detail;
      if (detail?.coachId && detail.coachId !== coachId) return;
      void queryClient.invalidateQueries({
        queryKey: [...coachKeys.all, "profile", coachId],
      });
    };

    window.addEventListener(COACH_PHOTO_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(COACH_PHOTO_UPDATED_EVENT, refresh);
  }, [coachId, queryClient]);

  return {
    coach: query.data,
    loading: query.isPending && !query.data,
    error: query.error ?? null,
    refresh: () => query.refetch(),
  };
}
