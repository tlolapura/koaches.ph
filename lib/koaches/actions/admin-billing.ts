"use server";

import { revalidatePath } from "next/cache";
import { RECEIPT_BUCKET } from "@/lib/koaches/billing-constants";
import { mapInvoiceRow, mapPaymentRow } from "@/lib/koaches/billing-invoices";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import { extendCoachSubscriptionByMonths } from "@/lib/koaches/subscription-extend";
import type { CoachPaymentSubmission } from "@/lib/koaches/types";
import { createServiceClient } from "@/lib/supabase/server";

export type AdminPendingPayment = CoachPaymentSubmission & {
  coachName: string;
  coachSlug: string;
  invoiceNumber: string;
};

export type AdminPaymentMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function fetchPendingPaymentSubmissionsAction(): Promise<AdminPendingPayment[]> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("coach_payment_submissions")
    .select(
      `
      *,
      coaches!inner ( name, slug ),
      coach_subscription_invoices!inner ( invoice_number )
    `
    )
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const submission = mapPaymentRow(row);
    const coach = row.coaches as { name: string; slug: string };
    const invoice = row.coach_subscription_invoices as { invoice_number: string };
    return {
      ...submission,
      coachName: coach.name,
      coachSlug: coach.slug,
      invoiceNumber: invoice.invoice_number,
    };
  });
}

export async function getAdminReceiptSignedUrlAction(
  coachId: string,
  receiptPath: string
): Promise<string | null> {
  await requireAdmin();
  if (!receiptPath.startsWith(`${coachId}/`)) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(receiptPath, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function approvePaymentSubmissionAction(
  submissionId: string
): Promise<AdminPaymentMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: submission, error: fetchError } = await supabase
    .from("coach_payment_submissions")
    .select("*")
    .eq("id", submissionId)
    .eq("status", "pending")
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!submission) return { ok: false, error: "Payment submission not found or already reviewed." };

  const reviewedAt = new Date().toISOString();

  const { error: submissionError } = await supabase
    .from("coach_payment_submissions")
    .update({ status: "approved", reviewed_at: reviewedAt })
    .eq("id", submissionId)
    .eq("status", "pending");
  if (submissionError) return { ok: false, error: submissionError.message };

  const { error: invoiceError } = await supabase
    .from("coach_subscription_invoices")
    .update({ status: "paid", paid_at: reviewedAt })
    .eq("id", submission.invoice_id);
  if (invoiceError) return { ok: false, error: invoiceError.message };

  try {
    await extendCoachSubscriptionByMonths(supabase, submission.coach_id, 1);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not extend subscription.",
    };
  }

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");
  revalidatePath("/coach/billing");
  return { ok: true };
}

export async function rejectPaymentSubmissionAction(
  submissionId: string
): Promise<AdminPaymentMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: submission, error: fetchError } = await supabase
    .from("coach_payment_submissions")
    .select("id, invoice_id, status")
    .eq("id", submissionId)
    .eq("status", "pending")
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!submission) return { ok: false, error: "Payment submission not found or already reviewed." };

  const reviewedAt = new Date().toISOString();
  const { error: submissionError } = await supabase
    .from("coach_payment_submissions")
    .update({ status: "rejected", reviewed_at: reviewedAt })
    .eq("id", submissionId)
    .eq("status", "pending");
  if (submissionError) return { ok: false, error: submissionError.message };

  await supabase
    .from("coach_subscription_invoices")
    .update({ status: "issued" })
    .eq("id", submission.invoice_id)
    .eq("status", "payment_submitted");

  revalidatePath("/admin/coaches");
  revalidatePath("/coach/billing");
  return { ok: true };
}
