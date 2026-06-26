"use client";

import { cn } from "@/lib/utils";

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

  return (
    <div className={className}>
      <label className="text-xs font-medium text-[#6B7280]">{label}</label>
      <input
        type="number"
        min={1}
        max={99}
        className="coach-input mt-1"
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
              "rounded-full border px-3 py-1.5 text-xs font-semibold min-h-[36px]",
              value === n
                ? "border-[#E07A5F] bg-[#FDEEE9] text-[#8B4D3A]"
                : "border-[#E5E7EB] bg-white text-[#6B7280]"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
