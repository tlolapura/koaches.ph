import { addDays, differenceInCalendarDays, format } from "date-fns";
import type { CoachProfile } from "@/lib/koaches/types";
import { SUBSCRIPTION_PRICES } from "@/lib/koaches/admin-data";
import { formatDisplayDate, parseDateValue } from "@/lib/utils";

/**
 * Manual billing timeline for monthly coach subscriptions:
 * - Invoice: 7 days before renewal (coach has time to review)
 * - Due: on renewal date (subscription_expiry)
 * - Grace: 3 days after due before treating as lapsed
 */
export const SUBSCRIPTION_INVOICE_LEAD_DAYS = 7;
export const SUBSCRIPTION_PAYMENT_GRACE_DAYS = 3;

export type SubscriptionBillingStatus =
  | "inactive"
  | "not_set"
  | "active"
  | "send_invoice"
  | "payment_due"
  | "overdue"
  | "lapsed";

export type SubscriptionBillingInfo = {
  status: SubscriptionBillingStatus;
  label: string;
  adminNote: string;
  renewalDate: string | null;
  invoiceByDate: string | null;
  daysUntilRenewal: number | null;
  amount: number;
  planLabel: string;
};

function planLabel(plan: CoachProfile["subscriptionPlan"]): string {
  return plan === "early-bird" ? "Early bird" : "Regular";
}

export function subscriptionAmount(plan: CoachProfile["subscriptionPlan"]): number {
  return SUBSCRIPTION_PRICES[plan];
}

export function getSubscriptionBillingInfo(
  coach: Pick<CoachProfile, "isActive" | "subscriptionExpiry" | "subscriptionPlan">,
  now = new Date()
): SubscriptionBillingInfo {
  const amount = subscriptionAmount(coach.subscriptionPlan);
  const plan = planLabel(coach.subscriptionPlan);

  if (!coach.isActive) {
    return {
      status: "inactive",
      label: "Account inactive",
      adminNote: "Coach portal and public profile are off. Reactivate when ready.",
      renewalDate: coach.subscriptionExpiry || null,
      invoiceByDate: null,
      daysUntilRenewal: null,
      amount,
      planLabel: plan,
    };
  }

  if (!coach.subscriptionExpiry?.trim()) {
    return {
      status: "not_set",
      label: "Renewal not set",
      adminNote: "Set a renewal date after the first invoice is paid.",
      renewalDate: null,
      invoiceByDate: null,
      daysUntilRenewal: null,
      amount,
      planLabel: plan,
    };
  }

  const renewal = parseDateValue(coach.subscriptionExpiry);
  const daysUntil = differenceInCalendarDays(renewal, now);
  const renewalDate = format(renewal, "yyyy-MM-dd");
  const invoiceBy = format(addDays(renewal, -SUBSCRIPTION_INVOICE_LEAD_DAYS), "yyyy-MM-dd");
  const invoiceByDisplay = formatDisplayDate(invoiceBy);
  const renewalDisplay = formatDisplayDate(renewalDate);

  if (daysUntil > SUBSCRIPTION_INVOICE_LEAD_DAYS) {
    return {
      status: "active",
      label: "Active",
      adminNote: `Renews ${renewalDisplay}. Send invoice around ${invoiceByDisplay}.`,
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: daysUntil,
      amount,
      planLabel: plan,
    };
  }

  if (daysUntil > 0) {
    return {
      status: "send_invoice",
      label: "Invoice window",
      adminNote: `Send invoice now — ${daysUntil} day${daysUntil === 1 ? "" : "s"} until renewal (${renewalDisplay}). Payment due on renewal date.`,
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: daysUntil,
      amount,
      planLabel: plan,
    };
  }

  if (daysUntil === 0) {
    return {
      status: "payment_due",
      label: "Payment due",
      adminNote: `Payment due today (${renewalDisplay}). Follow up if unpaid; ${SUBSCRIPTION_PAYMENT_GRACE_DAYS}-day grace before lapsing.`,
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: 0,
      amount,
      planLabel: plan,
    };
  }

  const daysOverdue = Math.abs(daysUntil);
  if (daysOverdue <= SUBSCRIPTION_PAYMENT_GRACE_DAYS) {
    return {
      status: "overdue",
      label: "Overdue",
      adminNote: `Payment was due ${renewalDisplay} (${daysOverdue} day${daysOverdue === 1 ? "" : "s"} ago). Grace ends in ${SUBSCRIPTION_PAYMENT_GRACE_DAYS - daysOverdue} day${SUBSCRIPTION_PAYMENT_GRACE_DAYS - daysOverdue === 1 ? "" : "s"}.`,
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: daysUntil,
      amount,
      planLabel: plan,
    };
  }

  return {
    status: "lapsed",
    label: "Lapsed",
    adminNote: `Subscription lapsed — payment overdue since ${renewalDisplay}. Deactivate or extend after confirming with the coach.`,
    renewalDate,
    invoiceByDate: invoiceBy,
    daysUntilRenewal: daysUntil,
    amount,
    planLabel: plan,
  };
}

export const BILLING_STATUS_STYLES: Record<
  SubscriptionBillingStatus,
  { badge: string; panel: string }
> = {
  inactive: { badge: "bg-[#F3F4F6] text-[#6B7280]", panel: "bg-[#F9FAFB] text-[#6B7280]" },
  not_set: { badge: "bg-[#FEF3C7] text-[#92400E]", panel: "bg-[#FFFBEB] text-[#92400E]" },
  active: { badge: "bg-[#E5EFE8] text-[#3D5C47]", panel: "bg-[#F5FAF6] text-[#3D5C47]" },
  send_invoice: { badge: "bg-[#F0FDF4] text-[#166534]", panel: "bg-[#FFF7F4] text-[#166534]" },
  payment_due: { badge: "bg-[#FEF3C7] text-[#92400E]", panel: "bg-[#FFFBEB] text-[#92400E]" },
  overdue: { badge: "bg-[#FEE2E2] text-[#B91C1C]", panel: "bg-[#FEF2F2] text-[#B91C1C]" },
  lapsed: { badge: "bg-[#FEE2E2] text-[#991B1B]", panel: "bg-[#FEF2F2] text-[#991B1B]" },
};
