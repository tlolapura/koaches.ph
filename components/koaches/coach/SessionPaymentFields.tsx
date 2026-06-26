"use client";

import type { SessionPaymentStatus } from "@/lib/koaches/types";
import { PAYMENT_STATUS_OPTIONS, getPaymentStatusLabel } from "@/lib/koaches/session-payment";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { cn } from "@/lib/utils";

type SessionPaymentFieldsProps = {
  value: SessionPaymentStatus;
  onChange: (value: SessionPaymentStatus) => void;
};

export function SessionPaymentFields({ value, onChange }: SessionPaymentFieldsProps) {
  return (
    <CoachSheetField label="Payment">
      <div className="flex gap-1 rounded-xl bg-[#F3F4F6] p-1">
        {PAYMENT_STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            className={cn(
              "font-heading flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all min-h-[44px]",
              value === status
                ? "bg-[#E07A5F] text-white shadow-sm"
                : "text-[#6B7280] hover:bg-white/70"
            )}
          >
            {getPaymentStatusLabel(status)}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#6B7280]">
        {value === "unpaid"
          ? "Mark paid once you collect payment."
          : "Use when payment is already in hand."}
      </p>
    </CoachSheetField>
  );
}
