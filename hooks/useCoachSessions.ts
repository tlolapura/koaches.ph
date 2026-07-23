"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchSessionByIdAction,
  fetchSessionsAction,
  fetchStudentSessionsWithProgressAction,
} from "@/lib/koaches/actions/sessions";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";
import type { Session } from "@/lib/koaches/types";

export function useCoachSessions(coachId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: coachKeys.sessions(coachId),
    queryFn: () => fetchSessionsAction(coachId),
    enabled: !!coachId,
    staleTime: 60_000,
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
    loading: !!coachId && query.isPending && sessions.length === 0,
    refresh,
  };
}

export function useCoachSession(sessionId: string) {
  const query = useQuery({
    queryKey: [...coachKeys.all, "session", sessionId] as const,
    queryFn: () => fetchSessionByIdAction(sessionId),
    enabled: !!sessionId,
    staleTime: 30_000,
  });

  return {
    session: query.data ?? null,
    loading: !!sessionId && query.isPending,
    refresh: () => query.refetch(),
  };
}

export function useStudentSessions(coachId: string, studentId: string) {
  const { sessions, loading, refresh } = useCoachSessions(coachId);
  const filtered = sessions.filter(
    (s) => s.studentId === studentId || s.participants.some((p) => p.studentId === studentId)
  );
  return { sessions: filtered, loading, refresh };
}

/** Done sessions with ratings for student progress UI. */
export function useStudentSessionsWithProgress(coachId: string, studentId: string) {
  const query = useQuery({
    queryKey: [...coachKeys.all, "student-sessions-progress", coachId, studentId] as const,
    queryFn: () => fetchStudentSessionsWithProgressAction(coachId, studentId),
    enabled: !!coachId && !!studentId,
    staleTime: 60_000,
  });

  return {
    sessions: query.data ?? [],
    loading: !!coachId && !!studentId && query.isPending,
  };
}

export function notifySessionsUpdated(coachId: string) {
  invalidateCoachSessions(coachId);
}
