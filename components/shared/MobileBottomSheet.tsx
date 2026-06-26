"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SHEET_OPEN_ATTR = "data-coach-sheet-open";

type MobileBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function MobileBottomSheet({
  open,
  onClose,
  title = "Filters",
  children,
  footer,
}: MobileBottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.setAttribute(SHEET_OPEN_ATTR, "true");
    return () => document.body.removeAttribute(SHEET_OPEN_ATTR);
  }, [open]);

  if (!open) return null;

  return (
    <div className="coach-bottom-sheet-overlay fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-text/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className={cn(
          "coach-portal coach-sheet-panel panel-accent absolute right-0 bottom-0 left-0 flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top,0px)))] flex-col rounded-b-none border-b-0",
          "rounded-t-2xl bg-white"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-surface-2"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {footer ? <div className="coach-sheet-footer shrink-0">{footer}</div> : null}
      </div>
    </div>
  );
}
