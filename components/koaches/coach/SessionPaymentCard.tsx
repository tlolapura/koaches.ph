"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { useSessionPayment } from "@/hooks/useSessionPayment";
import {
  PAYMENT_STATUS_OPTIONS,
  getPaymentStatusHint,
  getPaymentStatusLabel,
  sessionCollectedAmount,
} from "@/lib/koaches/session-payment";
import { SessionPaymentBadge, useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { formatCurrency, cn } from "@/lib/utils";

type SessionPaymentCardProps = {
  session: Session;
};

export function SessionPaymentCard({ session }: SessionPaymentCardProps) {
  const { paymentStatus, setPaymentStatus, tip, setTip } = useSessionPayment(session);
  const { showToast } = useCoachToast();
  const [updating, setUpdating] = useState(false);
  const [tipInput, setTipInput] = useState(() => String(session.tip ?? 0));
  const [savingTip, setSavingTip] = useState(false);

  useEffect(() => {
    setTipInput(String(tip));
  }, [tip]);

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

  const saveTip = async () => {
    const parsed = Math.max(0, Math.round(Number(tipInput) || 0));
    if (parsed === tip) return;
    setSavingTip(true);
    try {
      await setTip(parsed);
      showToast(parsed > 0 ? "Tip saved" : "Tip removed");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save tip", "error");
      setTipInput(String(tip));
    } finally {
      setSavingTip(false);
    }
  };

  const tipPreview = Math.max(0, Math.round(Number(tipInput) || 0));
  const totalPreview = session.price + tipPreview;

  return (
    <div className="coach-card mt-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold">Payment</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Session fee {formatCurrency(session.price)}
            {tip > 0 ? ` · tip ${formatCurrency(tip)}` : ""}
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">{getPaymentStatusHint(paymentStatus)}</p>
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
            {updating && paymentStatus !== status ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              </span>
            ) : (
              getPaymentStatusLabel(status)
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-[#E5E7EB] pt-4">
        <CoachSheetField
          label="Tip (optional)"
          htmlFor="session-tip"
          hint="Extra on top of the session fee — counts in reports when paid"
        >
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6B7280]"
              aria-hidden
            >
              ₱
            </span>
            <input
              id="session-tip"
              type="number"
              min={0}
              step={50}
              inputMode="numeric"
              className={cn("coach-input coach-input-icon", savingTip && "!pr-11")}
              value={tipInput}
              disabled={savingTip}
              onChange={(e) => setTipInput(e.target.value)}
              onBlur={() => void saveTip()}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void saveTip();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="0"
            />
            {savingTip && (
              <Loader2
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#9CA3AF]"
                aria-hidden
              />
            )}
          </div>
        </CoachSheetField>

        {tipPreview > 0 && (
          <p className="mt-2 text-sm text-[#374151]">
            Total received{" "}
            <span className="font-heading font-semibold text-[#14532D]">
              {formatCurrency(totalPreview)}
            </span>
            {paymentStatus === "paid" && tipPreview !== tip && (
              <span className="text-[#9CA3AF]"> · save tip to update reports</span>
            )}
          </p>
        )}

        {paymentStatus === "paid" && tip > 0 && (
          <p className="mt-1 text-xs text-[#6B7280]">
            Collected {formatCurrency(sessionCollectedAmount(session))} total
          </p>
        )}
      </div>
    </div>
  );
}
