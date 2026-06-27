"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchStudentByIdAction, fetchStudentsAction } from "@/lib/koaches/actions/students";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { invalidateCoachStudents } from "@/lib/koaches/queries/invalidate";
import type { Student } from "@/lib/koaches/types";

export function useCoachStudents(coachId: string, includeArchived = false) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: coachKeys.students(coachId, includeArchived),
    queryFn: () => fetchStudentsAction(coachId, includeArchived),
    enabled: !!coachId,
  });

  const refresh = useCallback(() => {
    invalidateCoachStudents(coachId);
  }, [coachId]);

  useEffect(() => {
    const bump = () => {
      void queryClient.invalidateQueries({ queryKey: coachKeys.students(coachId, includeArchived) });
    };
    window.addEventListener("koaches-roster-updated", bump);
    return () => window.removeEventListener("koaches-roster-updated", bump);
  }, [coachId, includeArchived, queryClient]);

  const students: Student[] = query.data ?? [];

  return {
    students,
    loading: !!coachId && query.isPending,
    error: query.error ?? null,
    refresh,
  };
}

export function useCoachStudent(studentId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: coachKeys.student(studentId),
    queryFn: () => fetchStudentByIdAction(studentId),
    enabled: !!studentId,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: coachKeys.student(studentId) });
  }, [queryClient, studentId]);

  useEffect(() => {
    const bump = () => refresh();
    window.addEventListener("koaches-roster-updated", bump);
    return () => window.removeEventListener("koaches-roster-updated", bump);
  }, [refresh]);

  return {
    student: query.data ?? undefined,
    loading: query.isPending,
    error: query.error ?? null,
    refresh,
  };
}

export function notifyRosterUpdated(coachId?: string) {
  if (coachId) {
    invalidateCoachStudents(coachId);
  } else {
    window.dispatchEvent(new Event("koaches-roster-updated"));
  }
}
