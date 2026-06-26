"use client";

import { cn } from "@/lib/utils";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

export const SESSION_COUNT_QUICK_PICKS = [4, 6, 8, 10, 12] as const;

type SessionCountFieldProps = {
  value: number;
  onChange: (count: number) => void;
  label?: string;
  className?: string;
};

export function SessionCountField({
  value,
  onChange,
  label = "Number of sessions",
  className,
}: SessionCountFieldProps) {
  const clamp = (n: number) => Math.min(99, Math.max(1, n));
  const inputId = "session-count";

  return (
    <CoachSheetField label={label} htmlFor={inputId} className={className}>
      <input
        id={inputId}
        type="number"
        min={1}
        max={99}
        className="coach-input"
        placeholder="8"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 1))}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {SESSION_COUNT_QUICK_PICKS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-semibold",
              value === n
                ? "border-[#16A34A] bg-[#F0FDF4] text-[#166534]"
                : "border-[#E5E7EB] bg-white text-[#6B7280]"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </CoachSheetField>
  );
}
