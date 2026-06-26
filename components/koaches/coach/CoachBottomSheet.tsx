"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoachSheetFooterActions } from "@/components/koaches/coach/CoachSheet";

type CoachBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Wider modal for schedule grids */
  wide?: boolean;
};

/** Mobile: bottom sheet above nav. Desktop (md+): centered modal. */
export function CoachBottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: CoachBottomSheetProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "coach-overlay-title" : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={cn(
          "relative flex w-full flex-col bg-white shadow-xl",
          "max-h-[min(90vh,calc(100dvh-4rem-env(safe-area-inset-bottom)))] rounded-t-2xl",
          "animate-in slide-in-from-bottom duration-300",
          "pb-[env(safe-area-inset-bottom,0px)]",
          "md:max-h-[min(85vh,720px)] md:rounded-2xl md:animate-none",
          wide ? "md:max-w-2xl" : "md:max-w-lg"
        )}
      >
        <div className="flex shrink-0 justify-center pt-3 md:hidden">
          <div className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </div>

        {title && (
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#F3F4F6] px-4 pt-2 pb-3 md:px-6 md:pt-5">
            <div className="min-w-0 flex-1">
              <h2
                id="coach-overlay-title"
                className="font-heading text-lg font-semibold text-[#111827]"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] md:flex"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="coach-sheet-body flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-4 py-4 md:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

type ConfirmSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  confirmLabel?: string;
};

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  message = "Are you sure?",
  confirmLabel = "Confirm",
}: ConfirmSheetProps) {
  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={message}
      footer={
        <CoachSheetFooterActions>
          <button
            type="button"
            onClick={onClose}
            className="font-heading min-h-[48px] flex-1 rounded-xl border border-[#E5E7EB] font-semibold text-[#6B7280]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="font-heading min-h-[48px] flex-1 rounded-xl bg-[#EF4444] font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </CoachSheetFooterActions>
      }
    />
  );
}
