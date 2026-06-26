import { addDays, format, subMonths } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CoachPaymentSubmission,
  CoachPaymentSubmissionStatus,
  CoachPaymentMethod,
  CoachProfile,
  CoachSubscriptionInvoice,
} from "@/lib/koaches/types";
import { getSubscriptionBillingInfo, subscriptionAmount } from "@/lib/koaches/subscription-billing";
import { parseDateValue } from "@/lib/utils";

export function invoiceNumberForCoach(coachId: string, periodEnd: string): string {
  const compact = periodEnd.replace(/-/g, "");
  return `INV-${compact}-${coachId.slice(-4).toUpperCase()}`;
}

function invoiceStatusFromBilling(
  coach: Pick<CoachProfile, "isActive" | "subscriptionExpiry" | "subscriptionPlan">,
  existing?: CoachSubscriptionInvoice | null
): CoachSubscriptionInvoice["status"] {
  if (existing?.status === "paid" || existing?.status === "payment_submitted") {
    return existing.status;
  }
  const info = getSubscriptionBillingInfo(coach);
  if (info.status === "overdue" || info.status === "lapsed" || info.status === "payment_due") {
    return "overdue";
  }
  return "issued";
}

/** Ensure an invoice row exists for the coach's current renewal period. */
export async function ensureCurrentCoachInvoice(
  supabase: SupabaseClient,
  coach: CoachProfile
): Promise<CoachSubscriptionInvoice | null> {
  if (!coach.subscriptionExpiry?.trim()) return null;

  const periodEnd = coach.subscriptionExpiry;
  const { data: existing } = await supabase
    .from("coach_subscription_invoices")
    .select("*")
    .eq("coach_id", coach.id)
    .eq("period_end", periodEnd)
    .maybeSingle();

  if (existing) {
    return mapInvoiceRow(existing);
  }

  const endDate = parseDateValue(periodEnd);
  const periodStart = format(subMonths(endDate, 1), "yyyy-MM-dd");
  const amount = subscriptionAmount(coach.subscriptionPlan);
  const status = invoiceStatusFromBilling(coach);
  const id = `inv-${crypto.randomUUID().slice(0, 8)}`;

  const row = {
    id,
    coach_id: coach.id,
    invoice_number: invoiceNumberForCoach(coach.id, periodEnd),
    period_start: periodStart,
    period_end: periodEnd,
    amount,
    plan: coach.subscriptionPlan,
    status,
    issued_at: format(addDays(endDate, -7), "yyyy-MM-dd'T'00:00:00.000'Z'"),
  };

  const { data, error } = await supabase
    .from("coach_subscription_invoices")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return mapInvoiceRow(data);
}

type DbInvoice = {
  id: string;
  coach_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  amount: number;
  plan: string;
  status: string;
  issued_at: string;
  paid_at: string | null;
};

export function mapInvoiceRow(row: DbInvoice): CoachSubscriptionInvoice {
  return {
    id: row.id,
    coachId: row.coach_id,
    invoiceNumber: row.invoice_number,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    amount: row.amount,
    plan: row.plan as CoachSubscriptionInvoice["plan"],
    status: row.status as CoachSubscriptionInvoice["status"],
    issuedAt: row.issued_at,
    paidAt: row.paid_at ?? undefined,
  };
}

type DbPayment = {
  id: string;
  coach_id: string;
  invoice_id: string;
  amount: number;
  method: string;
  receipt_path: string;
  receipt_file_name: string;
  notes: string | null;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
};

export function mapPaymentRow(row: DbPayment): CoachPaymentSubmission {
  return {
    id: row.id,
    coachId: row.coach_id,
    invoiceId: row.invoice_id,
    amount: row.amount,
    method: row.method as CoachPaymentMethod,
    receiptPath: row.receipt_path,
    receiptFileName: row.receipt_file_name,
    notes: row.notes ?? undefined,
    status: row.status as CoachPaymentSubmissionStatus,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export function getCoachBillingMessage(
  billing: ReturnType<typeof getSubscriptionBillingInfo>
): string {
  const amount = `₱${billing.amount.toLocaleString("en-PH")}`;
  switch (billing.status) {
    case "inactive":
      return "Your account is inactive. Contact KoachesPH if you need help restoring access.";
    case "not_set":
      return "Your renewal date is being set up. You'll see your first invoice here soon.";
    case "active":
      return "You're all set for this billing period. We'll issue your next invoice about a week before renewal.";
    case "send_invoice":
      return `Your subscription renews soon. Please pay ${amount} via GCash or bank transfer, then upload your receipt.`;
    case "payment_due":
      return "Payment is due today. Upload your receipt after paying so we can confirm your subscription.";
    case "overdue":
      return "Payment is overdue. Please pay and upload your receipt as soon as possible to avoid interruption.";
    case "lapsed":
      return "Your subscription has lapsed. Pay and upload a receipt, then contact us to restore your account.";
    default:
      return "";
  }
}
