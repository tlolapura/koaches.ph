"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CoachStepperStep = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: LucideIcon;
};

type CoachStepperProps = {
  steps: CoachStepperStep[];
  currentStepId: string;
  onStepChange?: (stepId: string) => void;
  /** Kept for existing callers — UI is the same for all. */
  variant?: "cards" | "compact" | "pills" | "header";
  className?: string;
  card?: boolean;
  hint?: string;
  /** When false, only show "2 of 4" + bar (for pages that already show the step title). */
  showCurrentLabel?: boolean;
};

function stepIndex(steps: CoachStepperStep[], currentStepId: string) {
  const index = steps.findIndex((s) => s.id === currentStepId);
  return index < 0 ? 0 : index;
}

/** @deprecated Kept for rare icon-only callers; prefer CoachStepper. */
export function CoachStepperIconDot({
  icon: Icon,
  active,
  done,
}: {
  icon: LucideIcon;
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        done && "bg-[#DCFCE7] text-[#16A34A]",
        active && !done && "bg-[#16A34A] text-white",
        !active && !done && "bg-[#F3F4F6] text-[#9CA3AF]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

/**
 * Compact progress for non-tech users:
 * current step name + "2 of 4" + thin bar. Navigation is via Back / Continue.
 */
export function CoachStepper({
  steps,
  currentStepId,
  className,
  card = false,
  hint,
  showCurrentLabel = true,
}: CoachStepperProps) {
  const currentIndex = stepIndex(steps, currentStepId);
  const current = steps[currentIndex] ?? steps[0];
  const percent = Math.round(((currentIndex + 1) / steps.length) * 100);

  const body = (
    <div className="w-full" aria-label="Progress">
      <div className="flex items-baseline justify-between gap-3">
        {showCurrentLabel ? (
          <p className="font-heading text-base font-semibold text-[#111827]">{current?.label}</p>
        ) : (
          <span />
        )}
        <p className="shrink-0 text-sm text-[#6B7280]">
          {currentIndex + 1} of {steps.length}
        </p>
      </div>

      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${current?.label ?? "Step"}, ${currentIndex + 1} of ${steps.length}`}
      >
        <div
          className="h-full rounded-full bg-[#16A34A] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {hint ? <p className="mt-2 text-xs text-[#9CA3AF]">{hint}</p> : null}
    </div>
  );

  if (card) {
    return <div className={cn("rounded-2xl bg-[#F9FAFB] px-4 py-3", className)}>{body}</div>;
  }

  return <div className={className}>{body}</div>;
}
