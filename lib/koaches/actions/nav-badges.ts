"use server";

import { fetchCoachProfileAction } from "@/lib/koaches/actions/coach-profile";
import { requireAdmin, requireAuthenticatedCoachId } from "@/lib/koaches/actions/guards";
import { fetchProgressCardsAction } from "@/lib/koaches/actions/progress-cards";
import { fetchSessionsAction } from "@/lib/koaches/actions/sessions";
import type { PortalNotification } from "@/lib/koaches/notifications";
import {
  billingMetaFromCoach,
  buildCoachNotifications,
  computeCoachNavBadgeCounts,
  type CoachNavBadgeCounts,
} from "@/lib/koaches/coach-nav-notifications";
import type { AdminNavBadgeCounts } from "@/lib/koaches/nav-badge-utils";
import { createServiceClient } from "@/lib/supabase/server";

export type CoachNotificationsPayload = {
  counts: CoachNavBadgeCounts;
  items: PortalNotification[];
};

export type CoachNavMeta = {
  pendingIntakes: number;
  billingStatus: ReturnType<typeof billingMetaFromCoach>["status"];
  billingLabel: string;
};

/** Lightweight counts source — pending intakes + billing only (no full session/card fetch). */
export async function coachNavMetaAction(): Promise<CoachNavMeta> {
  const coachId = await requireAuthenticatedCoachId();
  const supabase = createServiceClient();

  const [{ count: pendingIntakes, error: intakeError }, coach] = await Promise.all([
    supabase
      .from("student_intake_submissions")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId)
      .eq("status", "pending"),
    fetchCoachProfileAction(coachId),
  ]);

  if (intakeError) throw intakeError;
  if (!coach) throw new Error("Coach not found");

  const billing = billingMetaFromCoach(coach);
  return {
    pendingIntakes: pendingIntakes ?? 0,
    billingStatus: billing.status,
    billingLabel: billing.label,
  };
}

export async function coachNotificationsAction(): Promise<CoachNotificationsPayload> {
  const coachId = await requireAuthenticatedCoachId();

  const [meta, cards, sessions] = await Promise.all([
    coachNavMetaAction(),
    fetchProgressCardsAction(coachId),
    fetchSessionsAction(coachId),
  ]);

  const counts = computeCoachNavBadgeCounts({
    coachId,
    sessions,
    cards,
    pendingIntakes: meta.pendingIntakes,
    billingStatus: meta.billingStatus,
  });

  return {
    counts,
    items: buildCoachNotifications(counts, meta.billingStatus, meta.billingLabel),
  };
}

/** @deprecated Use coachNotificationsAction — kept for callers that only need counts. */
export async function coachNavBadgeCountsAction(): Promise<CoachNavBadgeCounts> {
  const { counts } = await coachNotificationsAction();
  return counts;
}

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
