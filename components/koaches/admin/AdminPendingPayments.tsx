"use client";

import { useCallback, useState } from "react";
import { Check, CreditCard, Eye, X } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { ReceiptPreviewModal } from "@/components/koaches/admin/ReceiptPreviewModal";
import {
  approvePaymentSubmissionAction,
  getAdminReceiptSignedUrlAction,
  rejectPaymentSubmissionAction,
  type AdminPendingPayment,
} from "@/lib/koaches/actions/admin-billing";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/koaches/billing-constants";

type AdminPendingPaymentsProps = {
  initialPayments: AdminPendingPayment[];
  /** Shown when there are no pending receipts (standalone Payments page). */
  emptyMessage?: string;
};

function coachInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function AdminPendingPayments({
  initialPayments,
  emptyMessage,
}: AdminPendingPaymentsProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminPendingPayment | null>(null);

  const removePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const fetchPreviewUrl = useCallback(async () => {
    if (!preview) return null;
    return getAdminReceiptSignedUrlAction(preview.coachId, preview.receiptPath);
  }, [preview]);

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

  if (payments.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4]">
          <CreditCard className="h-5 w-5 text-[#166534]" />
        </div>
        <p className="mt-3 text-sm font-medium text-[#374151]">All clear</p>
        <p className="mt-1 text-sm text-[#6B7280]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section>
      {error && (
        <p className="mb-4 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {payments.map((payment) => {
          const isBusy = busyId === payment.id;
          return (
            <article
              key={payment.id}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#FED7AA]/70"
            >
              <div className="p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-sm font-bold text-white">
                    {coachInitials(payment.coachName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-heading truncate text-base font-semibold text-[#111827]">
                          {payment.coachName}
                        </h3>
                        <p className="mt-0.5 text-sm text-[#6B7280]">
                          {payment.invoiceNumber}
                        </p>
                      </div>
                      <p className="font-heading text-lg font-bold text-[#14532D]">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9A3412]">
                        Pending
                      </span>
                      <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8]">
                        {paymentMethodLabel(payment.method)}
                      </span>
                      <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                        {formatDisplayDate(payment.submittedAt)}
                      </span>
                    </div>
                    {payment.notes && (
                      <p className="mt-2 text-xs text-[#6B7280]">Ref: {payment.notes}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-[#F3F4F6] bg-[#FAFBFC] px-4 py-3 sm:px-5">
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#4F8FF7] transition-colors hover:bg-[#EFF6FF]"
                  onClick={() => setPreview(payment)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View receipt
                </button>
                <div className="ml-auto flex flex-wrap gap-2">
                  <CoachButton
                    type="button"
                    variant="outline"
                    className="!h-10 !min-h-0 !w-auto px-3.5 py-0 text-sm text-[#6B7280]"
                    disabled={isBusy}
                    onClick={() => void handleReject(payment)}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </CoachButton>
                  <CoachButton
                    type="button"
                    className="!h-10 !min-h-0 !w-auto px-3.5 py-0 text-sm"
                    loading={isBusy}
                    loadingLabel="Saving…"
                    onClick={() => void handleApprove(payment)}
                  >
                    <Check className="h-4 w-4" />
                    Approve & extend
                  </CoachButton>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ReceiptPreviewModal
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={preview ? `${preview.coachName} · receipt` : "Receipt"}
        fileName={preview?.receiptFileName}
        fetchUrl={fetchPreviewUrl}
      />
    </section>
  );
}
