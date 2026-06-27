"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1 as const, label: "Session" },
  { id: 2 as const, label: "Ratings" },
];

type SessionDetailStepperProps = {
  step: 1 | 2;
  onStep: (step: 1 | 2) => void;
  ratingsUnlocked: boolean;
};

export function SessionDetailStepper({ step, onStep, ratingsUnlocked }: SessionDetailStepperProps) {
  return (
    <div className="coach-card mt-4 p-3">
      <div className="flex items-center gap-3">
        {STEPS.map((s, index) => {
          const active = step === s.id;
          const complete = s.id === 1 && step === 2;
          const disabled = s.id === 2 && !ratingsUnlocked;

          return (
            <div key={s.id} className="contents">
              {index > 0 && (
                <div
                  className={cn(
                    "h-0.5 min-w-[1.5rem] flex-1 rounded-full",
                    ratingsUnlocked ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                  )}
                  aria-hidden
                />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (s.id === 1 || ratingsUnlocked) onStep(s.id);
                }}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 transition-colors min-h-[44px]",
                  disabled && "cursor-not-allowed opacity-50",
                  active
                    ? "bg-[#F0FDF4] ring-2 ring-[#16A34A]/35"
                    : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    active || complete
                      ? "bg-[#16A34A] text-white"
                      : disabled
                        ? "bg-[#E5E7EB] text-[#9CA3AF]"
                        : "bg-[#E5E7EB] text-[#6B7280]"
                  )}
                >
                  {complete && !active ? "✓" : s.id}
                </span>
                <span
                  className={cn(
                    "font-heading truncate text-sm font-semibold",
                    active ? "text-[#14532D]" : "text-[#6B7280]"
                  )}
                >
                  {s.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {!ratingsUnlocked && (
        <p className="mt-2 text-center text-xs text-[#9CA3AF]">
          Mark the session done to unlock skill ratings
        </p>
      )}
    </div>
  );
}
