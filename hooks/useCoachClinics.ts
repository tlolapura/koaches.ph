"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addClinicSessionAction,
  cancelClinicAction,
  createClinicAction,
  enrollStudentInClinicAction,
  fetchClinicByIdAction,
  fetchClinicSessionsAction,
  fetchClinicsAction,
  removeStudentFromClinicAction,
  updateClinicAction,
  updateClinicPaymentAction,
  updateClinicSessionAttendanceAction,
  type CreateClinicInput,
} from "@/lib/koaches/actions/clinics";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";
import type { Clinic, ClinicSessionDraft, SessionAttendanceEntry, SessionPaymentStatus } from "@/lib/koaches/types";

export function useCoachClinics(coachId: string) {
  const query = useQuery({
    queryKey: coachKeys.clinics(coachId),
    queryFn: () => fetchClinicsAction(coachId),
    enabled: !!coachId,
    staleTime: 60_000,
  });

  const clinics: Clinic[] = query.data ?? [];

  return {
    clinics,
    loading: !!coachId && query.isPending && clinics.length === 0,
    refresh: () => query.refetch(),
  };
}

export function useCoachClinic(clinicId: string) {
  const queryClient = useQueryClient();
  const clinicQuery = useQuery({
    queryKey: coachKeys.clinic(clinicId),
    queryFn: () => fetchClinicByIdAction(clinicId),
    enabled: !!clinicId,
    staleTime: 30_000,
  });
  const sessionsQuery = useQuery({
    queryKey: coachKeys.clinicSessions(clinicId),
    queryFn: () => fetchClinicSessionsAction(clinicId),
    enabled: !!clinicId,
    staleTime: 30_000,
  });

  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: coachKeys.clinic(clinicId) }),
      queryClient.invalidateQueries({ queryKey: coachKeys.clinicSessions(clinicId) }),
      queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "clinics"] }),
    ]);
  }, [clinicId, queryClient]);

  const sessions = sessionsQuery.data ?? [];

  return {
    clinic: clinicQuery.data ?? null,
    sessions,
    loading:
      !!clinicId &&
      ((clinicQuery.isPending && !clinicQuery.data) ||
        (sessionsQuery.isPending && sessions.length === 0 && !sessionsQuery.isFetched)),
    refresh: invalidate,
  };
}

export function useCreateClinic(coachId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClinicInput) => createClinicAction(coachId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coachKeys.clinics(coachId) });
      invalidateCoachSessions(coachId);
    },
  });
}

export function useClinicMutations(coachId: string, clinicId: string) {
  const queryClient = useQueryClient();

  const bump = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: coachKeys.clinic(clinicId) }),
      queryClient.invalidateQueries({ queryKey: coachKeys.clinicSessions(clinicId) }),
      queryClient.invalidateQueries({ queryKey: coachKeys.clinics(coachId) }),
    ]);
    invalidateCoachSessions(coachId);
  };

  return {
    updateClinic: useMutation({
      mutationFn: (patch: Parameters<typeof updateClinicAction>[1]) =>
        updateClinicAction(clinicId, patch),
      onSuccess: bump,
    }),
    enroll: useMutation({
      mutationFn: (studentId: string) => enrollStudentInClinicAction(clinicId, studentId),
      onSuccess: bump,
    }),
    remove: useMutation({
      mutationFn: (studentId: string) => removeStudentFromClinicAction(clinicId, studentId),
      onSuccess: bump,
    }),
    addSession: useMutation({
      mutationFn: (draft: ClinicSessionDraft) => addClinicSessionAction(clinicId, draft),
      onSuccess: bump,
    }),
    setPayment: useMutation({
      mutationFn: (status: SessionPaymentStatus) => updateClinicPaymentAction(clinicId, status),
      onSuccess: bump,
    }),
    cancel: useMutation({
      mutationFn: () => cancelClinicAction(clinicId),
      onSuccess: bump,
    }),
    saveAttendance: useMutation({
      mutationFn: ({
        sessionId,
        attendance,
      }: {
        sessionId: string;
        attendance: SessionAttendanceEntry[];
      }) => updateClinicSessionAttendanceAction(sessionId, attendance),
      onSuccess: bump,
    }),
  };
}

export type { Clinic, CreateClinicInput };
