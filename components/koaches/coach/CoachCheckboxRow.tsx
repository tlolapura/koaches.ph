"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CoachCheckboxRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
};

export function CoachCheckboxRow({
  checked,
  onChange,
  label,
  disabled,
  className,
  boxClassName,
}: CoachCheckboxRowProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        checked ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-white",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex min-h-[44px] w-full items-center gap-3 text-left",
          disabled && "cursor-not-allowed opacity-60"
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            checked
              ? "border-[#16A34A] bg-[#16A34A] text-white"
              : "border-[#D1D5DB] bg-white text-transparent",
            boxClassName
          )}
          aria-hidden
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="text-sm font-medium text-[#111827]">{label}</span>
      </button>
    </div>
  );
}
