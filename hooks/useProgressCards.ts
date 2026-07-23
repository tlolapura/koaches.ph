"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchProgressCardsAction,
  saveProgressCardAction,
} from "@/lib/koaches/actions/progress-cards";
import {
  listProgressCardCandidates,
  PROGRESS_CARDS_UPDATED_EVENT,
} from "@/lib/koaches/progress-cards";
import { coachKeys } from "@/lib/koaches/queries/keys";
import type { ProgressCard } from "@/lib/koaches/types";
import { useEffect } from "react";
import { useCoachSessions } from "@/hooks/useCoachSessions";

export function useProgressCards(coachId: string) {
  const queryClient = useQueryClient();
  const { sessions } = useCoachSessions(coachId);

  const cardsQuery = useQuery({
    queryKey: [...coachKeys.all, "progress-cards", coachId] as const,
    queryFn: () => fetchProgressCardsAction(coachId),
    enabled: !!coachId,
    staleTime: 60_000,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "progress-cards", coachId] });
    void queryClient.invalidateQueries({ queryKey: coachKeys.sessions(coachId) });
  }, [coachId, queryClient]);

  useEffect(() => {
    const bump = () => refresh();
    window.addEventListener(PROGRESS_CARDS_UPDATED_EVENT, bump);
    return () => window.removeEventListener(PROGRESS_CARDS_UPDATED_EVENT, bump);
  }, [refresh]);

  const cards = cardsQuery.data ?? [];
  const candidates = listProgressCardCandidates(coachId, cards, sessions);

  const saveCard = useCallback(
    async (card: ProgressCard) => {
      const result = await saveProgressCardAction(card);
      if (!result.ok) {
        throw new Error(result.error);
      }
      window.dispatchEvent(new Event(PROGRESS_CARDS_UPDATED_EVENT));
      refresh();
      return result.id;
    },
    [refresh]
  );

  return {
    cards,
    candidates,
    loading: !!coachId && cardsQuery.isPending && cards.length === 0,
    error: cardsQuery.error ?? null,
    refresh,
    saveCard,
  };
}
