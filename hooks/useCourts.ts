"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourtsAction, fetchCourtsForCoachAction } from "@/lib/koaches/actions/courts";
import { coachKeys } from "@/lib/koaches/queries/keys";
import type { Court } from "@/lib/koaches/types";

export function useCourts() {
  const query = useQuery({
    queryKey: [...coachKeys.all, "courts"] as const,
    queryFn: fetchCourtsAction,
  });

  const lookup = useMemo(() => {
    const map = new Map<string, Court>();
    for (const court of query.data ?? []) map.set(court.id, court);
    return map;
  }, [query.data]);

  return {
    courts: query.data ?? [],
    lookup,
    loading: query.isPending,
  };
}

export function useCoachCourts(coachId: string) {
  const query = useQuery({
    queryKey: [...coachKeys.all, "courts", coachId] as const,
    queryFn: () => fetchCourtsForCoachAction(coachId),
    enabled: !!coachId,
  });

  return {
    courts: query.data ?? [],
    loading: query.isPending,
  };
}

export function courtNameFromLookup(lookup: Map<string, Court>, courtId: string) {
  return lookup.get(courtId)?.name ?? "Court TBD";
}
