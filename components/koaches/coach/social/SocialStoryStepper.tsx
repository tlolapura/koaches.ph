"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1 as const, label: "Template", description: "Pick a story layout" },
  { id: 2 as const, label: "Date", description: "Choose the day or week" },
];

type SocialStoryStepperProps = {
  step: 1 | 2;
  onStep: (step: 1 | 2) => void;
  canAccessStep2: boolean;
};

export function SocialStoryStepper({ step, onStep, canAccessStep2 }: SocialStoryStepperProps) {
  const progress = step === 1 ? 50 : 100;

  return (
    <div className="coach-card p-4">
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

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id === 1 || canAccessStep2) onStep(s.id);
              }}
              disabled={s.id === 2 && !canAccessStep2}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-h-[72px] flex-col rounded-xl border-2 px-3 py-2.5 text-left transition-colors",
                s.id === 2 && !canAccessStep2 && "cursor-not-allowed opacity-55",
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

              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    active || complete
                      ? "bg-[#16A34A] text-white"
                      : "bg-[#E5E7EB] text-[#374151]"
                  )}
                >
                  {complete && !active ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
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
                  <p className="mt-0.5 truncate text-[10px] text-[#9CA3AF]">{s.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
