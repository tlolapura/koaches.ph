import type { CoachNavBadgeCounts } from "@/lib/koaches/coach-nav-notifications";

export type AdminNavBadgeCounts = {
  pendingApplications: number;
  pendingPaymentReceipts: number;
};

export function coachBadgeForNavHref(href: string, counts: CoachNavBadgeCounts): number {
  switch (href) {
    case "/coach/students":
      return counts.pendingIntakes + counts.progressReady;
    case "/coach/sessions":
      return counts.unpaidSessionsToday;
    case "/coach/settings":
    case "/coach/settings/billing":
    case "/coach/billing":
      return counts.billingAttention;
    case "/coach/more":
      return counts.billingAttention;
    default:
      return 0;
  }
}

export function coachTotalAttentionCount(counts: CoachNavBadgeCounts): number {
  return (
    counts.pendingIntakes +
    counts.progressReady +
    counts.unpaidSessionsToday +
    counts.billingAttention
  );
}

export function adminBadgeForNavHref(href: string, counts: AdminNavBadgeCounts): number {
  switch (href) {
    case "/admin/applications":
      return counts.pendingApplications;
    case "/admin/coaches":
      return counts.pendingPaymentReceipts;
    default:
      return 0;
  }
}
