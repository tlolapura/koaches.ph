"use client";

import { useId, useRef, useState } from "react";
import { format, parse } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { CoachFloatingMenu } from "@/components/koaches/coach/CoachFloatingMenu";
import { useDismissible } from "@/hooks/useDismissible";
import { cn, formatDisplayDate } from "@/lib/utils";
import "react-day-picker/style.css";

function parseDateValue(value: string): Date | undefined {
  if (!value) return undefined;
  try {
    return parse(value, "yyyy-MM-dd", new Date());
  } catch {
    return undefined;
  }
}

function toDateValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

type CoachDatePickerProps = {
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

export function CoachDatePicker({
  value: valueProp,
  defaultValue = "",
  onChange,
  name,
  required,
  disabled,
  className,
  id,
  placeholder = "Pick a date",
}: CoachDatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const value = isControlled ? valueProp : internal;
  const selected = parseDateValue(value);

  useDismissible(open, () => setOpen(false), anchorRef, menuRef);

  const setValue = (date: Date | undefined) => {
    const next = date ? toDateValue(date) : "";
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setOpen(false);
  };

  const label = selected ? formatDisplayDate(value) : placeholder;

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      {name && (
        <input type="hidden" name={name} value={value} required={required && !value} />
      )}
      <button
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "coach-input flex w-full items-center justify-between gap-2 text-left",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0 text-[#4F8FF7]" />
          <span className={cn("truncate", !selected && "text-[#9CA3AF]")}>{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <CoachFloatingMenu
        open={open}
        anchorRef={anchorRef}
        menuRef={menuRef}
        estimatedHeight={360}
        scrollable={false}
        className="coach-day-picker p-3"
      >
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setValue}
          classNames={{
            root: "w-full",
            month_caption:
              "font-heading flex items-center justify-center font-semibold text-[#111827]",
            nav: "absolute inset-x-0 top-0 flex justify-between",
            button_previous:
              "flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]",
            button_next:
              "flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]",
            weekday: "font-heading text-[11px] font-semibold uppercase text-[#9CA3AF]",
            day: "p-0 text-center",
            day_button:
              "font-heading mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm text-[#374151] hover:bg-[#F9FAFB]",
            selected:
              "[&>button]:bg-[#16A34A] [&>button]:text-white [&>button]:hover:bg-[#15803D]",
            today: "[&>button]:font-bold [&>button]:text-[#14532D]",
            outside: "[&>button]:text-[#D1D5DB]",
            disabled: "[&>button]:opacity-40",
          }}
        />
      </CoachFloatingMenu>
    </div>
  );
}
