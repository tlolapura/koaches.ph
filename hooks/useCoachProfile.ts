"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCoachProfileAction } from "@/lib/koaches/actions/coach-profile";
import { coachKeys } from "@/lib/koaches/queries/keys";

export function useCoachProfile(coachId: string) {
  const query = useQuery({
    queryKey: [...coachKeys.all, "profile", coachId] as const,
    queryFn: () => fetchCoachProfileAction(coachId),
    enabled: !!coachId,
  });

  return {
    coach: query.data,
    loading: query.isPending,
    error: query.error ?? null,
    refresh: () => query.refetch(),
  };
}
