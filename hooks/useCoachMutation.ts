"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

type CoachMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  Error,
  TVariables,
  TContext
> & {
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string;
  invalidateKeys?: QueryKey[];
};

export function useCoachMutation<TData = unknown, TVariables = void, TContext = unknown>(
  options: CoachMutationOptions<TData, TVariables, TContext>
) {
  const { showToast } = useCoachToast();
  const queryClient = useQueryClient();
  const { successMessage, errorMessage, invalidateKeys, onSuccess, onError, ...rest } = options;

  return useMutation({
    ...rest,
    onSuccess: (data, variables, context, mutation) => {
      if (successMessage) {
        const message =
          typeof successMessage === "function" ? successMessage(data, variables) : successMessage;
        showToast(message, "success");
      }
      invalidateKeys?.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      showToast(errorMessage ?? error.message ?? "Something went wrong", "error");
      onError?.(error, variables, context, mutation);
    },
  });
}
