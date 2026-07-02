"use client";

import { useMemo } from "react";
import { buildTimeOptions, withTimeOption } from "@/lib/koaches/time-options";
import { CoachSelect, type CoachSelectOption } from "@/components/koaches/coach/CoachSelect";

type CoachTimePickerProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  placeholder?: string;
  allowedValues?: string[];
  options?: CoachSelectOption[];
};

export function CoachTimePicker({
  value,
  defaultValue,
  onChange,
  name,
  required,
  disabled,
  className,
  id,
  placeholder = "Pick a time",
  allowedValues,
  options: optionsOverride,
}: CoachTimePickerProps) {
  const options = useMemo<CoachSelectOption[]>(() => {
    const current = value ?? defaultValue ?? "";
    if (optionsOverride) {
      if (!current || optionsOverride.some((option) => option.value === current)) return optionsOverride;
      const fallback = withTimeOption([], current)[0];
      return [
        ...optionsOverride,
        { ...fallback, label: `${fallback.label} (Unavailable)`, disabled: true },
      ];
    }

    const base = buildTimeOptions();
    const withCurrent = withTimeOption(base, current);
    if (!allowedValues || allowedValues.length === 0) return withCurrent;

    const allowedSet = new Set(allowedValues);
    return withCurrent.map((option) => ({
      ...option,
      disabled: !allowedSet.has(option.value),
    }));
  }, [value, defaultValue, allowedValues, optionsOverride]);

  return (
    <CoachSelect
      id={id}
      className={className}
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      name={name}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}
