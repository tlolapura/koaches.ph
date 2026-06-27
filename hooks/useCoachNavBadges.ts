"use client";

import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCoachAuth } from "@/components/koaches/coach/CoachAuthProvider";
import { coachNavMetaAction } from "@/lib/koaches/actions/nav-badges";
import { fetchProgressCardsAction } from "@/lib/koaches/actions/progress-cards";
import { fetchSessionsAction } from "@/lib/koaches/actions/sessions";
import {
  buildCoachNotifications,
  computeCoachNavBadgeCounts,
} from "@/lib/koaches/coach-nav-notifications";
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
  const queryClient = useQueryClient();
  const enabled = !!coachId && !authLoading;

  const sessionsQuery = useQuery({
    queryKey: coachKeys.sessions(coachId),
    queryFn: () => fetchSessionsAction(coachId),
    enabled,
  });

  const cardsQuery = useQuery({
    queryKey: [...coachKeys.all, "progress-cards", coachId] as const,
    queryFn: () => fetchProgressCardsAction(coachId),
    enabled,
  });

  const metaQuery = useQuery({
    queryKey: [...coachKeys.all, "nav-meta", coachId] as const,
    queryFn: () => coachNavMetaAction(),
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: coachKeys.sessions(coachId) });
      void queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "progress-cards", coachId] });
      void queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "nav-meta", coachId] });
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
  }, [enabled, coachId, queryClient]);

  const sessions = sessionsQuery.data ?? [];
  const cards = cardsQuery.data ?? [];
  const meta = metaQuery.data;

  const counts = useMemo(() => {
    if (!coachId || !meta) return EMPTY_COUNTS;
    return computeCoachNavBadgeCounts({
      coachId,
      sessions,
      cards,
      pendingIntakes: meta.pendingIntakes,
      billingStatus: meta.billingStatus,
    });
  }, [coachId, meta, sessions, cards]);

  const items = useMemo(() => {
    if (!meta) return [];
    return buildCoachNotifications(counts, meta.billingStatus, meta.billingLabel);
  }, [counts, meta]);

  const loading =
    authLoading ||
    (enabled &&
      (sessionsQuery.isPending || cardsQuery.isPending || metaQuery.isPending) &&
      !meta);

  return {
    counts,
    items,
    loading,
    refresh: () => {
      void sessionsQuery.refetch();
      void cardsQuery.refetch();
      void metaQuery.refetch();
    },
  };
}
