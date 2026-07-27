"use client";

import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SHEET_OPEN_ATTR = "data-coach-sheet-open";

type MobileBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  dismissLabel?: string;
};

export function MobileBottomSheet({
  open,
  onClose,
  title = "Filters",
  children,
  footer,
  onBack,
  backLabel = "Back",
  dismissLabel = "Done",
}: MobileBottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.setAttribute(SHEET_OPEN_ATTR, "true");
    return () => document.body.removeAttribute(SHEET_OPEN_ATTR);
  }, [open]);

  if (!open) return null;

  const dismiss = onBack ?? onClose;

  return (
    <div className="coach-bottom-sheet-overlay fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-text/30 backdrop-blur-[2px]"
        onClick={dismiss}
        aria-label={onBack ? backLabel : dismissLabel}
      />
      <div
        className={cn(
          "coach-portal coach-sheet-panel panel-accent absolute right-0 bottom-0 left-0 flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top,0px)))] flex-col overflow-hidden",
          "rounded-t-2xl rounded-b-none bg-white"
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <div className="flex min-w-[4.5rem] shrink-0 justify-start">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-[44px] items-center gap-0.5 pr-2 text-sm font-semibold text-[#4F8FF7]"
              >
                <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
                <span className="max-w-[5.5rem] truncate">{backLabel}</span>
              </button>
            ) : null}
          </div>
          <h3 className="min-w-0 flex-1 truncate text-center text-lg font-bold">{title}</h3>
          <div className="flex min-w-[4.5rem] shrink-0 justify-end">
            {!onBack ? (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-1 text-sm font-semibold text-[#4F8FF7]"
              >
                {dismissLabel}
              </button>
            ) : null}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {footer ? <div className="coach-sheet-footer shrink-0">{footer}</div> : null}
      </div>
    </div>
  );
}
