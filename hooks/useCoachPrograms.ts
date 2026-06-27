"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  createProgramAction,
  fetchProgramByIdAction,
  fetchProgramsAction,
} from "@/lib/koaches/actions/programs";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { invalidateCoachPrograms } from "@/lib/koaches/queries/invalidate";
import type { Program } from "@/lib/koaches/types";
import type { ProgramDraft } from "@/lib/koaches/program-templates";
import { useCoachMutation } from "@/hooks/useCoachMutation";
import { crudToast } from "@/lib/koaches/crud-toast";

export function useCoachPrograms(coachId: string) {
  const query = useQuery({
    queryKey: coachKeys.programs(coachId),
    queryFn: () => fetchProgramsAction(coachId),
    enabled: !!coachId,
    placeholderData: keepPreviousData,
  });

  const refresh = useCallback(() => {
    invalidateCoachPrograms(coachId);
  }, [coachId]);

  const programs: Program[] = query.data ?? [];

  return {
    programs,
    loading: query.isPending && programs.length === 0,
    refresh,
  };
}

export function useCoachProgram(programId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: coachKeys.program(programId ?? ""),
    queryFn: () => fetchProgramByIdAction(programId!),
    enabled: !!programId,
  });

  const refresh = useCallback(() => {
    if (programId) void queryClient.invalidateQueries({ queryKey: coachKeys.program(programId) });
  }, [programId, queryClient]);

  return {
    program: query.data,
    loading: query.isPending && programId !== null,
    refresh,
  };
}

export function useCreateProgram(coachId: string) {
  return useCoachMutation({
    mutationFn: (draft: ProgramDraft) => createProgramAction(coachId, draft),
    successMessage: (_data, draft) => crudToast.created("Program", draft.name),
    errorMessage: crudToast.failed("create program"),
    invalidateKeys: [coachKeys.programs(coachId)],
  });
}
