"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoachSheetFooterActions } from "@/components/koaches/coach/CoachSheet";

const SHEET_OPEN_ATTR = "data-coach-sheet-open";

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

function useSheetBodyLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute(SHEET_OPEN_ATTR, "true");

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.removeAttribute(SHEET_OPEN_ATTR);
    };
  }, [open]);
}

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
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => setMounted(true), []);
  useSheetBodyLock(open);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="coach-bottom-sheet-overlay fixed inset-0 z-[100] flex items-end justify-center md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={cn(
          "coach-portal coach-sheet-panel relative flex w-full min-h-0 flex-col bg-white shadow-xl",
          "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))]",
          "rounded-t-2xl animate-in slide-in-from-bottom duration-300",
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
              <h2 id={titleId} className="font-heading text-lg font-semibold text-[#111827]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 hidden text-sm text-[#6B7280] md:block">{subtitle}</p>
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

        <div className="coach-sheet-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6">
          {children}
        </div>

        {footer && <div className="coach-sheet-footer shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body
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
