"use client";

import { useState } from "react";
import type { Session } from "@/lib/koaches/types";
import { useSessionPayment } from "@/hooks/useSessionPayment";
import {
  PAYMENT_STATUS_OPTIONS,
  getPaymentStatusHint,
  getPaymentStatusLabel,
} from "@/lib/koaches/session-payment";
import { SessionPaymentBadge, useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";

type SessionPaymentCardProps = {
  session: Session;
};

export function SessionPaymentCard({ session }: SessionPaymentCardProps) {
  const { paymentStatus, setPaymentStatus } = useSessionPayment(session);
  const { showToast } = useCoachToast();
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: typeof paymentStatus) => {
    if (updating || status === paymentStatus) return;
    setUpdating(true);
    try {
      await setPaymentStatus(status);
      showToast(status === "paid" ? "Marked as paid" : "Marked as unpaid");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update payment", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="coach-card mt-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold">Payment</p>
          <p className="mt-1 text-xs text-[#6B7280]">{getPaymentStatusHint(paymentStatus)}</p>
        </div>
        <SessionPaymentBadge status={paymentStatus} />
      </div>

      <div className="mt-3 flex gap-1 rounded-xl bg-[#F3F4F6] p-1">
        {PAYMENT_STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            disabled={updating}
            onClick={() => void handleStatusChange(status)}
            className={cn(
              "font-heading flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all min-h-[44px] disabled:opacity-60",
              paymentStatus === status
                ? "bg-[#16A34A] text-white shadow-sm"
                : "text-[#6B7280] hover:bg-white/70"
            )}
          >
            {updating && paymentStatus !== status
              ? "…"
              : getPaymentStatusLabel(status)}
          </button>
        ))}
      </div>
    </div>
  );
}
