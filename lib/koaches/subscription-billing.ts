import { addDays, differenceInCalendarDays, format } from "date-fns";
import type { CoachProfile } from "@/lib/koaches/types";
import { SUBSCRIPTION_PRICES } from "@/lib/koaches/admin-data";
import { formatDisplayDate, parseDateValue } from "@/lib/utils";

/**
 * Manual billing timeline for monthly coach subscriptions:
 * - Invoice: 7 days before renewal (coach sees invoice + pay UI)
 * - Due: on renewal date (subscription_expiry)
 * - Grace: 7 days after due, then account is restricted / deactivated
 */
export const SUBSCRIPTION_INVOICE_LEAD_DAYS = 7;
export const SUBSCRIPTION_PAYMENT_GRACE_DAYS = 7;

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

/** Statuses where the coach should see pay QR + receipt upload. */
export const BILLING_NEEDS_PAYMENT: SubscriptionBillingStatus[] = [
  "send_invoice",
  "payment_due",
  "overdue",
  "lapsed",
];

export function billingNeedsPayment(status: SubscriptionBillingStatus): boolean {
  return BILLING_NEEDS_PAYMENT.includes(status);
}

export function getSubscriptionBillingInfo(
  coach: Pick<CoachProfile, "isActive" | "subscriptionExpiry" | "subscriptionPlan">,
  now = new Date()
): SubscriptionBillingInfo {
  const amount = subscriptionAmount(coach.subscriptionPlan);
  const plan = planLabel(coach.subscriptionPlan);

  if (!coach.subscriptionExpiry?.trim()) {
    if (!coach.isActive) {
      return {
        status: "inactive",
        label: "Account inactive",
        adminNote: "Portal and profile are off.",
        renewalDate: null,
        invoiceByDate: null,
        daysUntilRenewal: null,
        amount,
        planLabel: plan,
      };
    }
    return {
      status: "not_set",
      label: "Renewal not set",
      adminNote: "Set renewal after first payment.",
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
  const renewalDisplay = formatDisplayDate(renewalDate);

  // Past grace → lapsed (even if is_active was flipped off for lockout)
  if (daysUntil < -SUBSCRIPTION_PAYMENT_GRACE_DAYS) {
    return {
      status: "lapsed",
      label: coach.isActive ? "Lapsed" : "Account locked",
      adminNote: `Overdue since ${renewalDisplay}. Approve payment to restore.`,
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: daysUntil,
      amount,
      planLabel: plan,
    };
  }

  // Manually deactivated while still within a paid/grace window
  if (!coach.isActive) {
    return {
      status: "inactive",
      label: "Account inactive",
      adminNote: "Portal and profile are off.",
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: daysUntil,
      amount,
      planLabel: plan,
    };
  }

  if (daysUntil > SUBSCRIPTION_INVOICE_LEAD_DAYS) {
    return {
      status: "active",
      label: "Active",
      adminNote: `Renews ${renewalDisplay}.`,
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
      label: "Invoice ready",
      adminNote: `Renews ${renewalDisplay} (${daysUntil}d).`,
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
      adminNote: `Due today. ${SUBSCRIPTION_PAYMENT_GRACE_DAYS}-day grace.`,
      renewalDate,
      invoiceByDate: invoiceBy,
      daysUntilRenewal: 0,
      amount,
      planLabel: plan,
    };
  }

  const daysOverdue = Math.abs(daysUntil);
  return {
    status: "overdue",
    label: "Overdue",
    adminNote: `${daysOverdue}d overdue. Grace ends in ${SUBSCRIPTION_PAYMENT_GRACE_DAYS - daysOverdue}d.`,
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
