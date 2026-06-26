"use client";

import { NotificationBell } from "@/components/koaches/shared/NotificationBell";
import { useCoachNavBadges } from "@/hooks/useCoachNavBadges";
import { coachTotalAttentionCount } from "@/lib/koaches/nav-badge-utils";
import { cn } from "@/lib/utils";

type CoachNotificationBellProps = {
  align?: "left" | "right";
  className?: string;
};

export function CoachNotificationBell({ align = "right", className }: CoachNotificationBellProps) {
  const { counts, items, loading } = useCoachNavBadges();

  return (
    <NotificationBell
      items={items}
      totalCount={coachTotalAttentionCount(counts)}
      loading={loading}
      align={align}
      className={cn(className)}
    />
  );
}
