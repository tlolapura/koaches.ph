"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1 as const, label: "Session", description: "Notes & wrap-up" },
  { id: 2 as const, label: "Ratings", description: "Skills & feedback" },
];

type SessionDetailStepperProps = {
  step: 1 | 2;
  onStep: (step: 1 | 2) => void;
  ratingsUnlocked: boolean;
};

export function SessionDetailStepper({ step, onStep, ratingsUnlocked }: SessionDetailStepperProps) {
  const progress = step === 1 ? 50 : 100;

  return (
    <div className="coach-card mt-4 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">
          Step {step} of 2
        </p>
        <p className="font-heading text-sm font-bold tabular-nums text-[#16A34A]">{progress}%</p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className="h-full rounded-full bg-[#16A34A] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {STEPS.map((s) => {
          const active = step === s.id;
          const complete = s.id === 1 && step === 2;
          const disabled = s.id === 2 && !ratingsUnlocked;

          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (s.id === 1 || ratingsUnlocked) onStep(s.id);
              }}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-h-[88px] flex-col rounded-xl border-2 px-3 py-3 text-left transition-colors",
                disabled && "cursor-not-allowed opacity-55",
                active
                  ? "border-[#16A34A] bg-[#F0FDF4]"
                  : complete
                    ? "border-[#BBF7D0] bg-[#F0FDF4]/60"
                    : "border-[#E5E7EB] bg-[#F9FAFB] active:bg-[#F3F4F6]"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  active || complete ? "text-[#16A34A]" : "text-[#9CA3AF]"
                )}
              >
                Step {s.id}
              </span>

              <div className="mt-2 flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    active || complete
                      ? "bg-[#16A34A] text-white"
                      : disabled
                        ? "bg-[#E5E7EB] text-[#9CA3AF]"
                        : "bg-[#E5E7EB] text-[#374151]"
                  )}
                >
                  {complete && !active ? (
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                  ) : disabled ? (
                    <Lock className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  ) : (
                    s.id
                  )}
                </span>

                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-heading text-sm font-semibold leading-tight",
                      active ? "text-[#14532D]" : complete ? "text-[#166534]" : "text-[#374151]"
                    )}
                  >
                    {s.label}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">{s.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {!ratingsUnlocked && (
        <p className="mt-3 text-center text-xs text-[#9CA3AF]">
          Finish step 1 to unlock ratings
        </p>
      )}
    </div>
  );
}
