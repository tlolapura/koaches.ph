"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCoachAvailabilityAction,
  saveCoachBlockedSlotsAction,
  saveCoachWorkingHoursAction,
  upsertBlockedSlotAction,
  deleteBlockedSlotAction,
} from "@/lib/koaches/actions/availability";
import {
  DEFAULT_WORKING_HOURS,
  getBlockedSlotsForDate,
  type BlockedSlot,
  type CoachWorkingHours,
} from "@/lib/koaches/coach-availability";
import { HOURLY_SESSION_MINUTES } from "@/lib/koaches/session-slots";
import { coachKeys } from "@/lib/koaches/queries/keys";

export function useCoachAvailability(coachId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...coachKeys.all, "availability", coachId] as const,
    queryFn: () => fetchCoachAvailabilityAction(coachId),
    enabled: !!coachId,
    placeholderData: { workingHours: DEFAULT_WORKING_HOURS, blockedSlots: [] },
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "availability", coachId] });
  }, [coachId, queryClient]);

  const workingHours = query.data?.workingHours ?? DEFAULT_WORKING_HOURS;
  const blockedSlots = query.data?.blockedSlots ?? [];

  const setWorkingHours = useCallback(
    async (hours: CoachWorkingHours) => {
      await saveCoachWorkingHoursAction(coachId, hours);
      queryClient.setQueryData(
        [...coachKeys.all, "availability", coachId],
        (current: { workingHours: CoachWorkingHours; blockedSlots: BlockedSlot[] } | undefined) => ({
          workingHours: hours,
          blockedSlots: current?.blockedSlots ?? [],
        })
      );
      void queryClient.invalidateQueries({ queryKey: [...coachKeys.all, "availability", coachId] });
    },
    [coachId, queryClient]
  );

  const blockSlot = useCallback(
    async (date: string, startMin: number) => {
      const slot: BlockedSlot = {
        id: `${date}-${startMin}`,
        date,
        startMin,
        endMin: startMin + HOURLY_SESSION_MINUTES,
      };
      await upsertBlockedSlotAction(coachId, slot);
      refresh();
      return slot;
    },
    [coachId, refresh]
  );

  const unblockSlot = useCallback(
    async (slotId: string) => {
      await deleteBlockedSlotAction(coachId, slotId);
      refresh();
    },
    [coachId, refresh]
  );

  const blockedForDate = useCallback(
    (date: string) => getBlockedSlotsForDate(blockedSlots, date),
    [blockedSlots]
  );

  return {
    workingHours,
    blockedSlots,
    loading: query.isPending,
    setWorkingHours,
    blockSlot,
    unblockSlot,
    blockedForDate,
    refresh,
  };
}
