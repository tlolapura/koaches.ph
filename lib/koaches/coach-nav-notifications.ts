import { format } from "date-fns";
import type { CoachProfile, ProgressCard, Session } from "@/lib/koaches/types";
import type { PortalNotification } from "@/lib/koaches/notifications";
import { listProgressCardCandidates } from "@/lib/koaches/progress-cards";
import { getSessionDisplayStatus } from "@/lib/koaches/session-lifecycle";
import { isCollectedSession } from "@/lib/koaches/session-payment";
import { isCanceledStatus } from "@/lib/koaches/session-status";
import {
  getSubscriptionBillingInfo,
  type SubscriptionBillingStatus,
} from "@/lib/koaches/subscription-billing";

export type CoachNavBadgeCounts = {
  pendingIntakes: number;
  progressReady: number;
  unpaidSessionsToday: number;
  billingAttention: number;
};

export function computeCoachNavBadgeCounts(options: {
  coachId: string;
  sessions: Session[];
  cards: ProgressCard[];
  pendingIntakes: number;
  billingStatus: SubscriptionBillingStatus;
}): CoachNavBadgeCounts {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const unpaidSessionsToday = options.sessions.filter(
    (s) =>
      s.date === todayKey &&
      !isCanceledStatus(s.status) &&
      getSessionDisplayStatus(s, options.cards) === "upcoming" &&
      !isCollectedSession(s)
  ).length;

  const billingAttention = ["send_invoice", "payment_due", "overdue"].includes(
    options.billingStatus
  )
    ? 1
    : 0;

  return {
    pendingIntakes: options.pendingIntakes,
    progressReady: listProgressCardCandidates(options.coachId, options.cards, options.sessions)
      .length,
    unpaidSessionsToday,
    billingAttention,
  };
}

export function buildCoachNotifications(
  counts: CoachNavBadgeCounts,
  billingStatus: SubscriptionBillingStatus,
  billingLabel: string
): PortalNotification[] {
  const items: PortalNotification[] = [];

  if (billingStatus === "overdue") {
    items.push({
      id: "billing-overdue",
      href: "/coach/settings/billing",
      title: "Subscription overdue",
      message: "Submit your payment receipt to keep full portal access.",
      tone: "red",
    });
  } else if (billingStatus === "payment_due") {
    items.push({
      id: "billing-due",
      href: "/coach/settings/billing",
      title: "Payment due today",
      message: "Upload your receipt on the billing page.",
      tone: "amber",
    });
  } else if (billingStatus === "send_invoice") {
    items.push({
      id: "billing-invoice",
      href: "/coach/settings/billing",
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
      href: "/coach/students",
      title:
        counts.progressReady === 1
          ? "1 progress card ready"
          : `${counts.progressReady} progress cards ready`,
      message: "Generate and share from the student's profile.",
      tone: "blue",
    });
  }

  return items;
}

export function billingMetaFromCoach(coach: CoachProfile) {
  const billing = getSubscriptionBillingInfo(coach);
  return { status: billing.status, label: billing.label };
}
