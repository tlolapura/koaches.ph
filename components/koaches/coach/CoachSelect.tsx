"use client";

import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CoachFloatingMenu } from "@/components/koaches/coach/CoachFloatingMenu";
import { useDismissible } from "@/hooks/useDismissible";
import { cn } from "@/lib/utils";

export type CoachSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type CoachSelectProps = {
  options: CoachSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function CoachSelect({
  options,
  value: valueProp,
  defaultValue = "",
  onChange,
  placeholder = "Select…",
  name,
  required,
  disabled,
  className,
  id,
}: CoachSelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const value = isControlled ? valueProp : internal;

  useDismissible(open, () => setOpen(false), anchorRef, menuRef);

  const selected = options.find((o) => o.value === value && !o.disabled);

  const select = (next: string) => {
    const option = options.find((o) => o.value === next);
    if (!option || option.disabled) return;
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setOpen(false);
  };

  return (
    <div ref={anchorRef} className={cn("relative", className)}>
      {name && (
        <input type="hidden" name={name} value={value} required={required && !value} />
      )}
      <button
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "coach-input flex w-full items-center justify-between gap-2 text-left",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "text-[#9CA3AF]")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      <CoachFloatingMenu open={open} anchorRef={anchorRef} menuRef={menuRef} estimatedHeight={224}>
        <ul role="listbox" aria-labelledby={fieldId}>
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={`${option.value}-${option.label}`} role="option" aria-selected={active}>
                <button
                  type="button"
                  disabled={option.disabled}
                  onClick={() => select(option.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                    option.disabled && "cursor-not-allowed text-[#9CA3AF]",
                    active
                      ? "bg-[#FDEEE9] font-semibold text-[#8B4D3A]"
                      : "text-[#374151] hover:bg-[#F9FAFB]"
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-[#E07A5F]" />}
                </button>
              </li>
            );
          })}
        </ul>
      </CoachFloatingMenu>
    </div>
  );
}
