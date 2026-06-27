"use client";

import type { CoachNavBadgeCounts } from "@/lib/koaches/coach-nav-notifications";
import type { PortalNotification } from "@/lib/koaches/notifications";

const EMPTY_COUNTS: CoachNavBadgeCounts = {
  pendingIntakes: 0,
  progressReady: 0,
  unpaidSessionsToday: 0,
  billingAttention: 0,
};

export function useCoachNavBadges() {
  const items: PortalNotification[] = [];

  return {
    counts: EMPTY_COUNTS,
    items,
    loading: false,
    refresh: () => undefined,
  };
}
