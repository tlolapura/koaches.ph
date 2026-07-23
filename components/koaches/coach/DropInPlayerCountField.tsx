"use client";

import { cn } from "@/lib/utils";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

type DropInPlayerCountFieldProps = {
  value: number;
  min: number;
  max: number;
  onChange: (count: number) => void;
  className?: string;
};

/** Quick-pick player count for drop-ins — choose size before naming players. */
export function DropInPlayerCountField({
  value,
  min,
  max,
  onChange,
  className,
}: DropInPlayerCountFieldProps) {
  const options = Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i);

  return (
    <CoachSheetField
      label="How many players?"
      hint={`Drop-in · ${min}–${max} players`}
      className={className}
    >
      <div className="flex flex-wrap gap-2">
        {options.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "font-heading min-h-[44px] min-w-[44px] flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-4",
              value === n
                ? "border-[#16A34A] bg-[#16A34A] text-white shadow-sm"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </CoachSheetField>
  );
}
