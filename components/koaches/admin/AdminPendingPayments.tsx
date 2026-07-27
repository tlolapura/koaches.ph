"use client";

import { useCallback, useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { ReceiptPreviewModal } from "@/components/koaches/admin/ReceiptPreviewModal";
import {
  approvePaymentSubmissionAction,
  getAdminReceiptSignedUrlAction,
  rejectPaymentSubmissionAction,
  type AdminPendingPayment,
} from "@/lib/koaches/actions/admin-billing";
import {
  adminListClass,
  adminListEmptyClass,
  adminListRowClass,
} from "@/components/koaches/admin/AdminPageLayout";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/koaches/billing-constants";
import { cn } from "@/lib/utils";

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
    return <div className={adminListEmptyClass}>{emptyMessage}</div>;
  }

  return (
    <section>
      {error && (
        <p className="mb-4 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
          {error}
        </p>
      )}

      <div className={adminListClass}>
        <ul className="divide-y divide-[#F3F4F6]">
          {payments.map((payment) => {
            const isBusy = busyId === payment.id;
            return (
              <li key={payment.id} className={cn(adminListRowClass({ alert: true }))}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-[11px] font-bold text-white">
                    {coachInitials(payment.coachName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                        {payment.coachName}
                      </p>
                      <span className="shrink-0 rounded-full bg-[#FFF7ED] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9A3412]">
                        Pending
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                      {formatCurrency(payment.amount)}
                      <span className="text-[#D1D5DB]"> · </span>
                      {paymentMethodLabel(payment.method)}
                      <span className="text-[#D1D5DB]"> · </span>
                      {formatDisplayDate(payment.submittedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-2.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE]"
                    onClick={() => setPreview(payment)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Receipt
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-50"
                    onClick={() => void handleReject(payment)}
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#16A34A] px-2.5 text-xs font-semibold text-white hover:bg-[#15803D] disabled:opacity-50"
                    onClick={() => void handleApprove(payment)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {isBusy ? "…" : "Approve"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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
