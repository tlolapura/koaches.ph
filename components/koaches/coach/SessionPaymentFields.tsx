"use client";

import type { SessionPaymentStatus } from "@/lib/koaches/types";
import { CoachCheckboxRow } from "@/components/koaches/coach/CoachCheckboxRow";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

type SessionPaymentFieldsProps = {
  value: SessionPaymentStatus;
  onChange: (value: SessionPaymentStatus) => void;
};

export function SessionPaymentCheckbox({
  checked,
  onChange,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (paid: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <CoachCheckboxRow
      checked={checked}
      onChange={onChange}
      label="Paid"
      disabled={disabled}
      className={className}
    />
  );
}

export function SessionPaymentFields({ value, onChange }: SessionPaymentFieldsProps) {
  return (
    <CoachSheetField label="Payment">
      <SessionPaymentCheckbox
        checked={value === "paid"}
        onChange={(paid) => onChange(paid ? "paid" : "unpaid")}
      />
      <p className="mt-2 text-xs text-[#6B7280]">
        Check when payment is in hand. Leave unchecked if still owed.
      </p>
    </CoachSheetField>
  );
}
