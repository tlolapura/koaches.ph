"use client";

import { cn } from "@/lib/utils";

type CoachSheetFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export function CoachSheetField({
  label,
  hint,
  children,
  className,
  htmlFor,
}: CoachSheetFieldProps) {
  return (
    <div className={cn("coach-sheet-field", className)}>
      <label className="coach-label" htmlFor={htmlFor}>
        {label}
      </label>
      <div className="coach-sheet-field-control">{children}</div>
      {hint && <p className="coach-field-hint">{hint}</p>}
    </div>
  );
}

/** Alias for forms outside bottom sheets */
export const CoachFormField = CoachSheetField;

type CoachSheetFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function CoachSheetFooter({ children, className }: CoachSheetFooterProps) {
  return <div className={cn("flex flex-col gap-2", className)}>{children}</div>;
}

type CoachSheetStickyActionsProps = {
  children: React.ReactNode;
  className?: string;
};

/** Sticky CTA row inside scrollable sheet body when no footer slot is used */
export function CoachSheetStickyActions({ children, className }: CoachSheetStickyActionsProps) {
  return <div className={cn("coach-sheet-sticky-cta", className)}>{children}</div>;
}

type CoachSheetFooterActionsProps = {
  children: React.ReactNode;
};

/** Side-by-side cancel / confirm buttons in sheet footers */
export function CoachSheetFooterActions({ children }: CoachSheetFooterActionsProps) {
  return <div className="flex gap-3">{children}</div>;
}
