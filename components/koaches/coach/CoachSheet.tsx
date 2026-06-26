"use client";

import { cn } from "@/lib/utils";

type CoachSheetFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function CoachSheetField({ label, hint, children, className }: CoachSheetFieldProps) {
  return (
    <div className={cn("coach-sheet-field", className)}>
      <label>{label}</label>
      <div className="coach-sheet-field-control">{children}</div>
      {hint && <p className="mt-1 text-[10px] text-[#6B7280]">{hint}</p>}
    </div>
  );
}

type CoachSheetFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function CoachSheetFooter({ children, className }: CoachSheetFooterProps) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

type CoachSheetFooterActionsProps = {
  children: React.ReactNode;
};

/** Side-by-side cancel / confirm buttons in sheet footers */
export function CoachSheetFooterActions({ children }: CoachSheetFooterActionsProps) {
  return <div className="flex gap-3">{children}</div>;
}
