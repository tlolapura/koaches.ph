"use client";

import { useQuery } from "@tanstack/react-query";
import { adminNotificationsAction } from "@/lib/koaches/actions/nav-badges";

const EMPTY_COUNTS = {
  pendingApplications: 0,
  pendingPaymentReceipts: 0,
} as const;

export function useAdminNavBadges() {
  const query = useQuery({
    queryKey: ["admin", "notifications"] as const,
    queryFn: () => adminNotificationsAction(),
    staleTime: 60_000,
  });

  return {
    counts: query.data?.counts ?? EMPTY_COUNTS,
    items: query.data?.items ?? [],
    loading: query.isPending,
    refresh: () => query.refetch(),
  };
}
