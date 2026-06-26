"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCoachAchievementsAction,
  saveCoachAchievementsAction,
} from "@/lib/koaches/actions/achievements";
import { coachKeys } from "@/lib/koaches/queries/keys";
import type { CoachAchievement } from "@/lib/koaches/types";

export function useCoachAchievements(coachId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...coachKeys.all, "achievements", coachId] as const,
    queryFn: () => fetchCoachAchievementsAction(coachId),
    enabled: !!coachId,
  });

  const setAchievements = useCallback(
    async (achievements: CoachAchievement[]) => {
      await saveCoachAchievementsAction(coachId, achievements);
      void queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "achievements", coachId] });
    },
    [coachId, queryClient]
  );

  return {
    achievements: query.data ?? [],
    loading: query.isPending,
    setAchievements,
    refresh: () => query.refetch(),
  };
}
