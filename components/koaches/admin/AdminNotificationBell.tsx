"use client";

import { NotificationBell } from "@/components/koaches/shared/NotificationBell";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { cn } from "@/lib/utils";

type AdminNotificationBellProps = {
  align?: "left" | "right";
  className?: string;
};

export function AdminNotificationBell({ align = "right", className }: AdminNotificationBellProps) {
  const { counts, items, loading } = useAdminNavBadges();
  const total = counts.pendingApplications + counts.pendingPaymentReceipts;

  return (
    <NotificationBell
      items={items}
      totalCount={total}
      loading={loading}
      align={align}
      className={cn(className)}
    />
  );
}
