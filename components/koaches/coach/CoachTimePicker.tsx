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
}: CoachTimePickerProps) {
  const options = useMemo<CoachSelectOption[]>(() => {
    const base = buildTimeOptions();
    const current = value ?? defaultValue ?? "";
    return withTimeOption(base, current);
  }, [value, defaultValue]);

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
