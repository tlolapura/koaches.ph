"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { fetchSessionsAction } from "@/lib/koaches/actions/sessions";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";
import type { Session } from "@/lib/koaches/types";

export function useCoachSessions(coachId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: coachKeys.sessions(coachId),
    queryFn: () => fetchSessionsAction(coachId),
    enabled: !!coachId,
    placeholderData: keepPreviousData,
  });

  const refresh = useCallback(() => {
    invalidateCoachSessions(coachId);
  }, [coachId]);

  useEffect(() => {
    const bump = () => {
      void queryClient.invalidateQueries({ queryKey: coachKeys.sessions(coachId) });
    };
    window.addEventListener("koaches-sessions-updated", bump);
    return () => window.removeEventListener("koaches-sessions-updated", bump);
  }, [coachId, queryClient]);

  const sessions: Session[] = query.data ?? [];

  return {
    sessions,
    loading: query.isPending && sessions.length === 0,
    refresh,
  };
}

export function useStudentSessions(coachId: string, studentId: string) {
  const { sessions, loading, refresh } = useCoachSessions(coachId);
  const filtered = sessions.filter(
    (s) => s.studentId === studentId || s.participants.some((p) => p.studentId === studentId)
  );
  return { sessions: filtered, loading, refresh };
}

export function notifySessionsUpdated(coachId: string) {
  invalidateCoachSessions(coachId);
}
