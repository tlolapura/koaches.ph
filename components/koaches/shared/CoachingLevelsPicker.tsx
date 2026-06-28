"use client";

import type { CoachingLevelId } from "@/lib/koaches/application-form";
import {
  COACHING_LEVEL_OPTIONS,
  toggleCoachingLevel,
} from "@/lib/koaches/application-form";
import { cn } from "@/lib/utils";

type CoachingLevelsPickerProps = {
  value: CoachingLevelId[];
  onChange: (levels: CoachingLevelId[]) => void;
  hint?: string;
  className?: string;
};

export function CoachingLevelsPicker({
  value,
  onChange,
  hint = "Which levels do you coach? Select all that apply.",
  className,
}: CoachingLevelsPickerProps) {
  const toggle = (id: CoachingLevelId) => {
    onChange(toggleCoachingLevel(value, id));
  };

  return (
    <div className={className}>
      {hint ? <p className="text-sm text-[#6B7280]">{hint}</p> : null}
      <div className={cn("space-y-2", hint && "mt-3")}>
        {COACHING_LEVEL_OPTIONS.map((option) => {
          const checked = value.includes(option.id);
          return (
            <label
              key={option.id}
              htmlFor={`coaching-level-${option.id}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                checked
                  ? "border-[#16A34A] bg-[#F0FDF4]"
                  : "border-[#E5E7EB] bg-white hover:border-[#BBF7D0]"
              )}
            >
              <input
                id={`coaching-level-${option.id}`}
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#16A34A] focus:ring-[#16A34A]"
                checked={checked}
                onChange={() => toggle(option.id)}
              />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium text-[#111827]">{option.label}</span>
                <span className="ml-2 text-xs text-[#9CA3AF]">{option.dupr} DUPR</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
