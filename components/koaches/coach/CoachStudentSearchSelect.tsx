"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { Student } from "@/lib/koaches/types";
import { CoachFloatingMenu } from "@/components/koaches/coach/CoachFloatingMenu";
import { useDismissible } from "@/hooks/useDismissible";
import { cn } from "@/lib/utils";

type CoachStudentSearchSelectProps = {
  students: Student[];
  /** Selected student ids */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Max selectable (e.g. clinic capacity) */
  max?: number;
  excludeIds?: string[];
  placeholder?: string;
  /** Single-select: picking replaces selection and closes */
  multiple?: boolean;
  className?: string;
  emptyLabel?: string;
};

export function CoachStudentSearchSelect({
  students,
  value,
  onChange,
  max,
  excludeIds = [],
  placeholder = "Search students…",
  multiple = true,
  className,
  emptyLabel = "No matching students",
}: CoachStudentSearchSelectProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useDismissible(open, () => {
    setOpen(false);
    setQuery("");
  }, anchorRef, menuRef);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const exclude = useMemo(() => new Set(excludeIds), [excludeIds]);
  const selectedSet = useMemo(() => new Set(value), [value]);

  const roster = useMemo(
    () => students.filter((s) => !s.isArchived && !exclude.has(s.id)),
    [students, exclude]
  );

  const selectedStudents = useMemo(
    () =>
      value
        .map((id) => students.find((s) => s.id === id))
        .filter((s): s is Student => Boolean(s)),
    [students, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = roster.filter((s) => !q || s.name.toLowerCase().includes(q));
    return list.sort((a, b) => {
      const aSel = selectedSet.has(a.id) ? 0 : 1;
      const bSel = selectedSet.has(b.id) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel;
      return a.name.localeCompare(b.name);
    });
  }, [roster, query, selectedSet]);

  const atMax = max != null && value.length >= max;
  const singleLabel = selectedStudents[0]?.name ?? "";

  const toggle = (id: string) => {
    if (multiple) {
      if (selectedSet.has(id)) {
        onChange(value.filter((x) => x !== id));
        return;
      }
      if (atMax) return;
      onChange([...value, id]);
      setQuery("");
      return;
    }
    onChange([id]);
    setOpen(false);
    setQuery("");
  };

  const remove = (id: string) => {
    onChange(value.filter((x) => x !== id));
  };

  const openMenu = () => {
    if (roster.length === 0) return;
    setOpen(true);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {multiple && selectedStudents.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {selectedStudents.map((s) => (
            <span
              key={s.id}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#EDE9FE] px-2.5 py-1 text-xs font-semibold text-[#5B21B6]"
            >
              <span className="truncate">{s.name}</span>
              <button
                type="button"
                onClick={() => remove(s.id)}
                className="shrink-0 rounded-full p-0.5 hover:bg-[#DDD6FE]"
                aria-label={`Remove ${s.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div ref={anchorRef} className="relative w-full">
        <div
          className={cn(
            "flex w-full min-h-[48px] items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 transition-[border-color,box-shadow]",
            open && "border-[#16A34A] shadow-[0_0_0_3px_rgba(22,163,74,0.18)]",
            roster.length === 0 && "opacity-60"
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            disabled={roster.length === 0}
            value={open || multiple || !singleLabel ? query : singleLabel}
            placeholder={
              !multiple && singleLabel && !open
                ? singleLabel
                : multiple && value.length > 0
                  ? "Add another…"
                  : placeholder
            }
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={openMenu}
            onClick={openMenu}
            className={cn(
              "min-w-0 flex-1 border-0 bg-transparent py-3 text-base text-[#111827] outline-none placeholder:text-[#9CA3AF]",
              !multiple && singleLabel && !open && "font-medium"
            )}
            aria-haspopup="listbox"
            aria-expanded={open}
            autoComplete="off"
          />
          {!multiple && singleLabel && !open ? (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                setQuery("");
                openMenu();
              }}
              className="shrink-0 rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280]"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                open && "rotate-180"
              )}
              aria-hidden
            />
          )}
        </div>

        <CoachFloatingMenu open={open} anchorRef={anchorRef} menuRef={menuRef} estimatedHeight={280}>
          <ul role="listbox" className="py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-[#9CA3AF]">{emptyLabel}</li>
            ) : (
              filtered.map((s) => {
                const active = selectedSet.has(s.id);
                const disabled = !active && atMax;
                return (
                  <li key={s.id} role="option" aria-selected={active}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(s.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                        disabled && "cursor-not-allowed opacity-40",
                        active
                          ? "bg-[#F5F3FF] font-semibold text-[#5B21B6]"
                          : "text-[#374151] hover:bg-[#F9FAFB]"
                      )}
                    >
                      <span className="min-w-0 truncate">{s.name}</span>
                      {active ? <Check className="h-4 w-4 shrink-0 text-[#7C3AED]" /> : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </CoachFloatingMenu>
      </div>
    </div>
  );
}
