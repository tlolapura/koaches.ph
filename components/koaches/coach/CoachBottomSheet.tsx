"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
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
  /** Sub-sheet or inner step: show Back on mobile (and desktop) instead of dismiss */
  onBack?: () => void;
  backLabel?: string;
  /** Root sheet mobile dismiss label (default Done) */
  dismissLabel?: string;
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
  onBack,
  backLabel = "Back",
  dismissLabel = "Done",
}: CoachBottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useSheetBodyLock(open);

  // Keep a stable Escape handler without re-focusing the panel on every parent re-render
  // (inline onClose identities would otherwise steal focus from inputs on each keystroke).
  const onCloseRef = useRef(onClose);
  const onBackRef = useRef(onBack);
  onCloseRef.current = onClose;
  onBackRef.current = onBack;

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") (onBackRef.current ?? onCloseRef.current)();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open || !mounted) return null;

  const dismiss = onBack ?? onClose;

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
        onClick={dismiss}
        aria-label={onBack ? backLabel : dismissLabel}
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "coach-portal coach-sheet-panel relative flex w-full min-h-0 flex-col overflow-hidden bg-white shadow-xl outline-none",
          "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))]",
          "rounded-t-2xl rounded-b-none animate-in slide-in-from-bottom duration-300",
          "md:max-h-[min(85vh,720px)] md:rounded-2xl md:animate-none",
          wide ? "md:max-w-2xl" : "md:max-w-lg"
        )}
      >
        <div className="flex shrink-0 justify-center pt-3 md:hidden">
          <div className="h-1 w-10 rounded-full bg-[#E5E7EB]" />
        </div>

        {title && (
          <>
            <div className="flex shrink-0 items-center gap-2 border-b border-[#F3F4F6] px-4 pb-3 pt-1 md:hidden">
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
              <h2
                id={titleId}
                className="min-w-0 flex-1 truncate text-center font-heading text-base font-semibold text-[#111827]"
              >
                {title}
              </h2>
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

            <div className="hidden shrink-0 items-start justify-between gap-3 border-b border-[#F3F4F6] px-6 pt-5 pb-3 md:flex">
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-lg font-semibold text-[#111827]">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>}
              </div>
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex min-h-[40px] shrink-0 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-[#4F8FF7] hover:bg-[#EFF6FF]"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                  {backLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6]"
                  aria-label={dismissLabel}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </>
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
  onConfirm: () => void | Promise<void>;
  message?: string;
  description?: string;
  confirmLabel?: string;
};

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  message = "Are you sure?",
  description,
  confirmLabel = "Confirm",
}: ConfirmSheetProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setPending(false);
    }
  };

  return (
    <CoachBottomSheet
      open={open}
      onClose={pending ? () => {} : onClose}
      title={message}
      children={
        description ? <p className="whitespace-pre-line text-sm text-[#6B7280]">{description}</p> : undefined
      }
      footer={
        <CoachSheetFooterActions>
          <CoachButton
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </CoachButton>
          <CoachButton
            type="button"
            variant="danger"
            className="flex-1"
            loading={pending}
            loadingLabel="Working…"
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </CoachButton>
        </CoachSheetFooterActions>
      }
    />
  );
}
