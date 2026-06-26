"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedCoachIdAction } from "@/lib/koaches/actions/auth";
import { fetchCoachProfileAction } from "@/lib/koaches/actions/coach-profile";
import {
  RECEIPT_ALLOWED_TYPES,
  RECEIPT_BUCKET,
  RECEIPT_MAX_BYTES,
} from "@/lib/koaches/billing-constants";
import {
  ensureCurrentCoachInvoice,
  mapInvoiceRow,
  mapPaymentRow,
} from "@/lib/koaches/billing-invoices";
import { getSubscriptionBillingInfo } from "@/lib/koaches/subscription-billing";
import type { CoachBillingDashboard, CoachPaymentMethod } from "@/lib/koaches/types";
import { createServiceClient } from "@/lib/supabase/server";

async function assertCoachAccess(coachId: string) {
  const authCoachId = await getAuthenticatedCoachIdAction();
  if (!authCoachId || authCoachId !== coachId) {
    throw new Error("Not authorized.");
  }
}

export async function fetchCoachBillingDashboardAction(
  coachId: string
): Promise<CoachBillingDashboard> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const coach = await fetchCoachProfileAction(coachId);
  const billing = getSubscriptionBillingInfo(coach);
  const currentInvoice = await ensureCurrentCoachInvoice(supabase, coach);

  const [{ data: invoiceRows }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("coach_subscription_invoices")
      .select("*")
      .eq("coach_id", coachId)
      .order("period_end", { ascending: false })
      .limit(12),
    supabase
      .from("coach_payment_submissions")
      .select("*")
      .eq("coach_id", coachId)
      .order("submitted_at", { ascending: false })
      .limit(20),
  ]);

  const invoices = (invoiceRows ?? []).map(mapInvoiceRow);
  const submissions = (paymentRows ?? []).map(mapPaymentRow);
  const pendingSubmission =
    submissions.find((s) => s.status === "pending" && s.invoiceId === currentInvoice?.id) ??
    null;

  return {
    billing,
    currentInvoice,
    pendingSubmission,
    invoiceHistory: invoices,
    submissionHistory: submissions,
  };
}

export type SubmitCoachReceiptResult =
  | { ok: true; submissionId: string }
  | { ok: false; error: string };

export async function submitCoachPaymentReceiptAction(
  coachId: string,
  invoiceId: string,
  formData: FormData
): Promise<SubmitCoachReceiptResult> {
  try {
    await assertCoachAccess(coachId);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const method = formData.get("method") as CoachPaymentMethod;
  if (method !== "gcash" && method !== "bank_transfer") {
    return { ok: false, error: "Select a payment method." };
  }

  const notes = String(formData.get("notes") ?? "").trim();
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please attach a receipt image or PDF." };
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return { ok: false, error: "Receipt must be 5 MB or smaller." };
  }
  if (!RECEIPT_ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Use a JPG, PNG, WebP, or PDF file." };
  }

  const supabase = createServiceClient();
  const { data: invoice, error: invoiceError } = await supabase
    .from("coach_subscription_invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("coach_id", coachId)
    .maybeSingle();
  if (invoiceError) return { ok: false, error: invoiceError.message };
  if (!invoice) return { ok: false, error: "Invoice not found." };
  if (invoice.status === "paid") {
    return { ok: false, error: "This invoice is already marked paid." };
  }

  const { data: existingPending } = await supabase
    .from("coach_payment_submissions")
    .select("id")
    .eq("invoice_id", invoiceId)
    .eq("status", "pending")
    .maybeSingle();
  if (existingPending) {
    return { ok: false, error: "You already have a receipt under review for this invoice." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const submissionId = `pay-${crypto.randomUUID().slice(0, 8)}`;
  const storagePath = `${coachId}/${invoiceId}/${submissionId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { error: insertError } = await supabase.from("coach_payment_submissions").insert({
    id: submissionId,
    coach_id: coachId,
    invoice_id: invoiceId,
    amount: invoice.amount,
    method,
    receipt_path: storagePath,
    receipt_file_name: file.name,
    notes: notes || null,
    status: "pending",
  });
  if (insertError) {
    await supabase.storage.from(RECEIPT_BUCKET).remove([storagePath]);
    return { ok: false, error: insertError.message };
  }

  await supabase
    .from("coach_subscription_invoices")
    .update({ status: "payment_submitted" })
    .eq("id", invoiceId);

  revalidatePath("/coach/billing");
  return { ok: true, submissionId };
}

export async function getCoachReceiptSignedUrlAction(
  coachId: string,
  receiptPath: string
): Promise<string | null> {
  await assertCoachAccess(coachId);
  if (!receiptPath.startsWith(`${coachId}/`)) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from(RECEIPT_BUCKET)
    .createSignedUrl(receiptPath, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
