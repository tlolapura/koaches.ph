"use client";

import { useEffect, useState } from "react";
import {
  buildSpecialization,
  parseSpecialization,
  SPECIALIZATION_PICKER_HINT,
  SPECIALIZATION_SUGGESTIONS,
} from "@/lib/koaches/specialization-options";
import { cn } from "@/lib/utils";

const MAX_SUGGESTIONS = 3;

type SpecializationPickerProps = {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  id?: string;
  required?: boolean;
};

export function SpecializationPicker({
  value,
  onChange,
  hint = SPECIALIZATION_PICKER_HINT,
  id = "specialization",
  required,
}: SpecializationPickerProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    const parsed = parseSpecialization(value);
    setSuggestions(parsed.suggestions);
    setCustom(parsed.custom);
  }, [value]);

  const sync = (nextSuggestions: string[], nextCustom: string) => {
    setSuggestions(nextSuggestions);
    setCustom(nextCustom);
    onChange(buildSpecialization(nextSuggestions, nextCustom));
  };

  const toggle = (option: string) => {
    if (suggestions.includes(option)) {
      sync(
        suggestions.filter((item) => item !== option),
        custom
      );
      return;
    }
    if (suggestions.length >= MAX_SUGGESTIONS) return;
    sync([...suggestions, option], custom);
  };

  const preview = buildSpecialization(suggestions, custom);

  return (
    <div className="space-y-3">
      {hint ? <p className="text-sm text-[#6B7280]">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {SPECIALIZATION_SUGGESTIONS.map((option) => {
          const selected = suggestions.includes(option);
          const disabled = !selected && suggestions.length >= MAX_SUGGESTIONS;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => toggle(option)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                selected
                  ? "bg-[#16A34A] text-white"
                  : disabled
                    ? "cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]"
                    : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div>
        <label htmlFor={`${id}-custom`} className="text-xs font-medium text-[#6B7280]">
          Anything else? (optional)
        </label>
        <input
          id={`${id}-custom`}
          className="coach-input mt-1.5"
          placeholder="e.g. Corporate groups, weekend warriors"
          value={custom}
          onChange={(e) => sync(suggestions, e.target.value)}
        />
      </div>
      {preview ? (
        <p className="text-xs text-[#6B7280]">
          Profile will show:{" "}
          <span className="font-medium text-[#16A34A]">{preview}</span>
        </p>
      ) : required ? (
        <p className="text-xs text-[#9CA3AF]">Pick at least one option or add your own.</p>
      ) : null}
      <input type="hidden" value={preview} required={required && !preview} readOnly />
    </div>
  );
}
