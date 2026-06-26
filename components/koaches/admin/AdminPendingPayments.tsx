"use client";

import { useState } from "react";
import { Check, ExternalLink, X } from "lucide-react";
import {
  approvePaymentSubmissionAction,
  getAdminReceiptSignedUrlAction,
  rejectPaymentSubmissionAction,
  type AdminPendingPayment,
} from "@/lib/koaches/actions/admin-billing";
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils";

type AdminPendingPaymentsProps = {
  initialPayments: AdminPendingPayment[];
};

export function AdminPendingPayments({ initialPayments }: AdminPendingPaymentsProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const removePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const viewReceipt = async (payment: AdminPendingPayment) => {
    const url = await getAdminReceiptSignedUrlAction(payment.coachId, payment.receiptPath);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else setError("Could not open receipt.");
  };

  const handleApprove = async (payment: AdminPendingPayment) => {
    setBusyId(payment.id);
    setError(null);
    const result = await approvePaymentSubmissionAction(payment.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    removePayment(payment.id);
  };

  const handleReject = async (payment: AdminPendingPayment) => {
    setBusyId(payment.id);
    setError(null);
    const result = await rejectPaymentSubmissionAction(payment.id);
    setBusyId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    removePayment(payment.id);
  };

  if (payments.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="font-heading text-sm font-semibold text-[#111827]">
        Pending payment receipts
        <span className="ml-2 rounded-full bg-[#FDEEE9] px-2 py-0.5 text-xs font-bold text-[#8B4D3A]">
          {payments.length}
        </span>
      </h2>
      <p className="mt-1 text-xs text-[#6B7280]">
        Approve to mark the invoice paid and extend the coach&apos;s subscription by 1 month.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 space-y-3">
        {payments.map((payment) => {
          const isBusy = busyId === payment.id;
          return (
            <div key={payment.id} className="coach-card border-[#E07A5F]/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading font-semibold">{payment.coachName}</p>
                  <p className="text-sm text-[#6B7280]">
                    {payment.invoiceNumber} · {formatCurrency(payment.amount)}
                  </p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    {payment.method === "gcash" ? "GCash" : "Bank transfer"} · submitted{" "}
                    {formatDisplayDate(payment.submittedAt)}
                  </p>
                  {payment.notes && (
                    <p className="mt-2 text-xs text-[#6B7280]">Ref: {payment.notes}</p>
                  )}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#E07A5F] hover:underline"
                  onClick={() => void viewReceipt(payment)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View receipt
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleApprove(payment)}
                  className={cn(
                    "coach-btn-primary inline-flex w-auto min-h-[40px] items-center gap-1.5 px-4 py-2 text-sm"
                  )}
                >
                  <Check className="h-4 w-4" />
                  {isBusy ? "Saving…" : "Approve & extend"}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleReject(payment)}
                  className="coach-btn-outline inline-flex w-auto min-h-[40px] items-center gap-1.5 px-4 py-2 text-sm text-[#6B7280]"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
