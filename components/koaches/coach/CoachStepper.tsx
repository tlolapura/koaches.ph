"use client";

import { Check, Lock, type LucideIcon } from "lucide-react";
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
  /** cards: large tappable step tiles · compact: progress bar + pills · pills: pills only · header: bar + icon dots */
  variant?: "cards" | "compact" | "pills" | "header";
  className?: string;
  /** Wrap in coach-card (default true for cards/compact) */
  card?: boolean;
  hint?: string;
};

function stepProgress(steps: CoachStepperStep[], currentStepId: string) {
  const index = steps.findIndex((s) => s.id === currentStepId);
  const current = index < 0 ? 0 : index;
  return {
    index: current,
    percent: Math.round(((current + 1) / steps.length) * 100),
    label: `Step ${current + 1} of ${steps.length}`,
  };
}

function gridColsClass(count: number) {
  if (count <= 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  return "grid-cols-2 sm:grid-cols-4";
}

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
        "flex h-8 w-8 items-center justify-center rounded-full transition-all",
        done && "bg-[#F0FDF4] text-[#16A34A]",
        active && !done && "scale-110 bg-[#EFF6FF] text-[#4F8FF7] ring-2 ring-[#BFDBFE]",
        !active && !done && "bg-[#F3F4F6] text-[#9CA3AF]"
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
    </span>
  );
}

function CoachStepperProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
      <div
        className="h-full rounded-full bg-[#16A34A] transition-all duration-300 ease-out"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function CoachStepperHeader({
  label,
  percent,
  percentSize = "sm",
}: {
  label: string;
  percent: number;
  percentSize?: "sm" | "lg";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p
        className={cn(
          "font-heading font-bold tabular-nums text-[#16A34A]",
          percentSize === "lg" ? "text-2xl leading-none" : "text-sm"
        )}
      >
        {percent}%
      </p>
    </div>
  );
}

export function CoachStepper({
  steps,
  currentStepId,
  onStepChange,
  variant = "cards",
  className,
  card = variant !== "header" && variant !== "pills",
  hint,
}: CoachStepperProps) {
  const { index: currentIndex, percent, label } = stepProgress(steps, currentStepId);

  const canSelect = (step: CoachStepperStep) => {
    if (!onStepChange || step.disabled) return false;
    return true;
  };

  const inner =
    variant === "header" ? (
      <>
        <CoachStepperHeader label={label} percent={percent} percentSize="lg" />
        <div className="mt-4">
          <CoachStepperProgressBar percent={percent} />
        </div>
        <div className="mt-3 flex justify-between gap-1">
          {steps.map((step, i) => {
            const Icon = step.icon;
            if (!Icon) return null;
            return (
              <CoachStepperIconDot
                key={step.id}
                icon={Icon}
                active={i === currentIndex}
                done={i < currentIndex}
              />
            );
          })}
        </div>
      </>
    ) : variant === "pills" ? (
      <div className="flex gap-2">
        {steps.map((step, index) => {
          const active = step.id === currentStepId;
          const done = currentIndex > index;
          const disabled = step.disabled && !active;
          const interactive = canSelect(step);

          const pillClass = cn(
            "flex min-h-[36px] flex-1 items-center justify-center rounded-full px-2 text-[11px] font-semibold transition-colors",
            active
              ? "bg-[#16A34A] text-white"
              : done
                ? "bg-[#DCFCE7] text-[#166534]"
                : "bg-[#F3F4F6] text-[#9CA3AF]",
            interactive && !active && "cursor-pointer hover:bg-[#BBF7D0]",
            disabled && !active && "opacity-55"
          );

          if (interactive) {
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onStepChange?.(step.id)}
                aria-current={active ? "step" : undefined}
                className={pillClass}
              >
                {step.label}
              </button>
            );
          }

          return (
            <div key={step.id} aria-current={active ? "step" : undefined} className={pillClass}>
              {step.label}
            </div>
          );
        })}
      </div>
    ) : variant === "compact" ? (
      <>
        <CoachStepperHeader label={label} percent={percent} />
        <div className="mt-2">
          <CoachStepperProgressBar percent={percent} />
        </div>
        <div className="mt-3 flex gap-2">
          {steps.map((step, index) => {
            const active = step.id === currentStepId;
            const done = currentIndex > index;
            const disabled = step.disabled && !active;
            const interactive = canSelect(step);

            const pillClass = cn(
              "flex min-h-[36px] flex-1 items-center justify-center rounded-full px-2 text-[11px] font-semibold transition-colors",
              active
                ? "bg-[#16A34A] text-white"
                : done
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : "bg-[#F3F4F6] text-[#9CA3AF]",
              interactive && !active && "cursor-pointer hover:bg-[#BBF7D0]",
              disabled && !active && "opacity-55"
            );

            if (interactive) {
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange?.(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={pillClass}
                >
                  {step.label}
                </button>
              );
            }

            return (
              <div key={step.id} aria-current={active ? "step" : undefined} className={pillClass}>
                {step.label}
              </div>
            );
          })}
        </div>
        {hint ? <p className="mt-3 text-center text-xs text-[#9CA3AF]">{hint}</p> : null}
      </>
    ) : (
      <>
        <CoachStepperHeader label={label} percent={percent} />
        <div className="mt-2">
          <CoachStepperProgressBar percent={percent} />
        </div>
        <div className={cn("mt-4 grid gap-2", gridColsClass(steps.length))}>
          {steps.map((step, index) => {
            const active = step.id === currentStepId;
            const complete = currentIndex > index;
            const disabled = step.disabled && !active;
            const interactive = canSelect(step);

            const tileClass = cn(
              "flex min-h-[88px] flex-col rounded-xl border-2 px-3 py-3 text-left transition-colors",
              disabled && !active && "cursor-not-allowed opacity-55",
              active
                ? "border-[#16A34A] bg-[#F0FDF4]"
                : complete
                  ? "border-[#BBF7D0] bg-[#F0FDF4]/60"
                  : "border-[#E5E7EB] bg-[#F9FAFB]",
              interactive && !active && "active:bg-[#F3F4F6]"
            );

            const inner = (
              <>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    active || complete ? "text-[#16A34A]" : "text-[#9CA3AF]"
                  )}
                >
                  Step {index + 1}
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
                    ) : disabled && !active ? (
                      <Lock className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-heading text-sm font-semibold leading-tight",
                        active ? "text-[#14532D]" : complete ? "text-[#166534]" : "text-[#374151]"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description ? (
                      <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">{step.description}</p>
                    ) : null}
                  </div>
                </div>
              </>
            );

            if (interactive) {
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange?.(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={tileClass}
                >
                  {inner}
                </button>
              );
            }

            return (
              <div key={step.id} aria-current={active ? "step" : undefined} className={tileClass}>
                {inner}
              </div>
            );
          })}
        </div>
        {hint ? <p className="mt-3 text-center text-xs text-[#9CA3AF]">{hint}</p> : null}
      </>
    );

  if (card) {
    return <div className={cn("coach-card p-4", className)}>{inner}</div>;
  }

  return <div className={className}>{inner}</div>;
}
