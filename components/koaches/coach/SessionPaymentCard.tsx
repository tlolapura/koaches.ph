"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { useSessionPayment } from "@/hooks/useSessionPayment";
import { sessionCollectedAmount } from "@/lib/koaches/session-payment";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { SessionPaymentCheckbox } from "@/components/koaches/coach/SessionPaymentFields";
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

  const handlePaidChange = async (paid: boolean) => {
    const status = paid ? "paid" : "unpaid";
    if (updating || status === paymentStatus) return;
    setUpdating(true);
    try {
      await setPaymentStatus(status);
      showToast(paid ? "Marked as paid" : "Marked as unpaid");
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
      <p className="font-heading text-sm font-semibold">Payment</p>
      <p className="mt-1 text-xs text-[#6B7280]">
        Session fee {formatCurrency(session.price)}
        {tip > 0 ? ` · tip ${formatCurrency(tip)}` : ""}
      </p>

      <div className="relative mt-3">
        <SessionPaymentCheckbox
          checked={paymentStatus === "paid"}
          disabled={updating}
          onChange={(paid) => void handlePaidChange(paid)}
        />
        {updating && (
          <Loader2
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#9CA3AF]"
            aria-hidden
          />
        )}
      </div>

      <div className="mt-4 border-t border-[#E5E7EB] pt-4">
        <CoachSheetField
          label="Tip (optional)"
          htmlFor="session-tip"
          hint="Extra on top of the session fee. Counts in reports when paid."
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
