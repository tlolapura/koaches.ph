"use server";

import { format } from "date-fns";
import { fetchCoachProfileAction } from "@/lib/koaches/actions/coach-profile";
import { requireAdmin, requireAuthenticatedCoachId } from "@/lib/koaches/actions/guards";
import { fetchIntakeSubmissionsAction } from "@/lib/koaches/actions/intake";
import { fetchProgressCardsAction } from "@/lib/koaches/actions/progress-cards";
import { fetchSessionsAction } from "@/lib/koaches/actions/sessions";
import type { PortalNotification } from "@/lib/koaches/notifications";
import { listProgressCardCandidates } from "@/lib/koaches/progress-cards";
import { getSessionDisplayStatus } from "@/lib/koaches/session-lifecycle";
import { isCollectedSession } from "@/lib/koaches/session-payment";
import { isCanceledStatus } from "@/lib/koaches/session-status";
import { getSubscriptionBillingInfo } from "@/lib/koaches/subscription-billing";
import { createServiceClient } from "@/lib/supabase/server";

export type CoachNavBadgeCounts = {
  pendingIntakes: number;
  progressReady: number;
  unpaidSessionsToday: number;
  billingAttention: number;
};

export type CoachNotificationsPayload = {
  counts: CoachNavBadgeCounts;
  items: PortalNotification[];
};

function buildCoachNotifications(
  counts: CoachNavBadgeCounts,
  billingStatus: ReturnType<typeof getSubscriptionBillingInfo>["status"],
  billingLabel: string
): PortalNotification[] {
  const items: PortalNotification[] = [];

  if (billingStatus === "overdue") {
    items.push({
      id: "billing-overdue",
      href: "/coach/billing",
      title: "Subscription overdue",
      message: "Submit your payment receipt to keep full portal access.",
      tone: "red",
    });
  } else if (billingStatus === "payment_due") {
    items.push({
      id: "billing-due",
      href: "/coach/billing",
      title: "Payment due today",
      message: "Upload your receipt on the billing page.",
      tone: "amber",
    });
  } else if (billingStatus === "send_invoice") {
    items.push({
      id: "billing-invoice",
      href: "/coach/billing",
      title: billingLabel === "Invoice window" ? "Subscription renewing soon" : billingLabel,
      message: "Review billing and upload your payment when ready.",
      tone: "amber",
    });
  }

  if (counts.pendingIntakes > 0) {
    items.push({
      id: "intake-pending",
      href: "/coach/students",
      title:
        counts.pendingIntakes === 1
          ? "1 new student sign-up"
          : `${counts.pendingIntakes} new student sign-ups`,
      message: "Review intake forms and approve or decline.",
      tone: "green",
    });
  }

  if (counts.unpaidSessionsToday > 0) {
    items.push({
      id: "sessions-unpaid",
      href: "/coach/sessions?view=list",
      title:
        counts.unpaidSessionsToday === 1
          ? "1 unpaid session today"
          : `${counts.unpaidSessionsToday} unpaid sessions today`,
      message: "Mark payment when you collect from students.",
      tone: "blue",
    });
  }

  if (counts.progressReady > 0) {
    items.push({
      id: "progress-ready",
      href: "/coach/progress",
      title:
        counts.progressReady === 1
          ? "1 progress card ready"
          : `${counts.progressReady} progress cards ready`,
      message: "Share skill updates with your students.",
      tone: "blue",
    });
  }

  return items;
}

export async function coachNotificationsAction(): Promise<CoachNotificationsPayload> {
  const coachId = await requireAuthenticatedCoachId();

  const [intakes, cards, sessions, coach] = await Promise.all([
    fetchIntakeSubmissionsAction(coachId),
    fetchProgressCardsAction(coachId),
    fetchSessionsAction(coachId),
    fetchCoachProfileAction(coachId),
  ]);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const unpaidSessionsToday = sessions.filter(
    (s) =>
      s.date === todayKey &&
      !isCanceledStatus(s.status) &&
      getSessionDisplayStatus(s, cards) === "upcoming" &&
      !isCollectedSession(s)
  ).length;

  const billing = getSubscriptionBillingInfo(coach);
  const billingAttention = ["send_invoice", "payment_due", "overdue"].includes(billing.status)
    ? 1
    : 0;

  const counts: CoachNavBadgeCounts = {
    pendingIntakes: intakes.filter((s) => s.status === "pending").length,
    progressReady: listProgressCardCandidates(coachId, cards, sessions).length,
    unpaidSessionsToday,
    billingAttention,
  };

  return {
    counts,
    items: buildCoachNotifications(counts, billing.status, billing.label),
  };
}

/** @deprecated Use coachNotificationsAction — kept for callers that only need counts. */
export async function coachNavBadgeCountsAction(): Promise<CoachNavBadgeCounts> {
  const { counts } = await coachNotificationsAction();
  return counts;
}

export type AdminNavBadgeCounts = {
  pendingApplications: number;
  pendingPaymentReceipts: number;
};

export type AdminNotificationsPayload = {
  counts: AdminNavBadgeCounts;
  items: PortalNotification[];
};

function buildAdminNotifications(counts: AdminNavBadgeCounts): PortalNotification[] {
  const items: PortalNotification[] = [];

  if (counts.pendingApplications > 0) {
    items.push({
      id: "applications-pending",
      href: "/admin/applications",
      title:
        counts.pendingApplications === 1
          ? "1 coach application"
          : `${counts.pendingApplications} coach applications`,
      message: "Review and approve or reject new coaches.",
      tone: "green",
    });
  }

  if (counts.pendingPaymentReceipts > 0) {
    items.push({
      id: "payments-pending",
      href: "/admin/coaches",
      title:
        counts.pendingPaymentReceipts === 1
          ? "1 payment receipt"
          : `${counts.pendingPaymentReceipts} payment receipts`,
      message: "Confirm coach subscription payments on the Coaches page.",
      tone: "amber",
    });
  }

  return items;
}

export async function adminNotificationsAction(): Promise<AdminNotificationsPayload> {
  await requireAdmin();
  const supabase = createServiceClient();

  const [{ count: pendingApplications, error: appsError }, { count: pendingPaymentReceipts, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("coach_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("coach_payment_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  if (appsError) throw appsError;
  if (paymentsError) throw paymentsError;

  const counts = {
    pendingApplications: pendingApplications ?? 0,
    pendingPaymentReceipts: pendingPaymentReceipts ?? 0,
  };

  return {
    counts,
    items: buildAdminNotifications(counts),
  };
}

/** @deprecated Use adminNotificationsAction */
export async function adminNavBadgeCountsAction(): Promise<AdminNavBadgeCounts> {
  const { counts } = await adminNotificationsAction();
  return counts;
}
