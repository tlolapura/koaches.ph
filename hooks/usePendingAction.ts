"use client";

import { useCallback, useState } from "react";

/** Tracks pending state for one-off async actions (forms, CTAs). */
export function usePendingAction() {
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
      setPending(true);
      try {
        return await action();
      } catch {
        return undefined;
      } finally {
        setPending(false);
      }
    },
    []
  );

  return { pending, run, setPending };
}
