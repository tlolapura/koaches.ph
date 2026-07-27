"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";

type ReceiptPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  fileName?: string | null;
  /** Fetch a short-lived signed URL for the receipt */
  fetchUrl: () => Promise<string | null>;
};

export function ReceiptPreviewModal({
  open,
  onClose,
  title = "Receipt",
  fileName,
  fetchUrl,
}: ReceiptPreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setUrl(null);
      setError(null);
      setLoading(false);
      return;
    }
    setFetchKey((k) => k + 1);
  }, [open]);

  useEffect(() => {
    if (!open || fetchKey === 0) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setUrl(null);

    void fetchUrl()
      .then((signed) => {
        if (cancelled) return;
        if (!signed) {
          setError("Could not open receipt.");
          return;
        }
        setUrl(signed);
      })
      .catch(() => {
        if (!cancelled) setError("Could not open receipt.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally only re-fetch when the sheet opens (fetchKey bumps).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fetchKey]);

  const isPdf =
    Boolean(fileName?.toLowerCase().endsWith(".pdf")) ||
    Boolean(url?.toLowerCase().includes(".pdf"));

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={fileName ?? undefined}
      footer={
        <CoachSheetFooter>
          <CoachButton type="button" variant="outline" className="w-full" onClick={onClose}>
            Close
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center text-[#9CA3AF]">
          <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          <span className="sr-only">Loading receipt</span>
        </div>
      ) : error ? (
        <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
          {error}
        </p>
      ) : url ? (
        <div className="overflow-hidden rounded-2xl bg-[#F3F4F6] ring-1 ring-[#E5E7EB]">
          {isPdf ? (
            <iframe
              title={title}
              src={url}
              className="h-[min(50vh,24rem)] w-full bg-white md:h-[70vh]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- signed receipt URL
            <img
              src={url}
              alt={title}
              className="mx-auto max-h-[min(50vh,24rem)] w-auto max-w-full object-contain md:max-h-[70vh]"
            />
          )}
        </div>
      ) : null}
    </CoachBottomSheet>
  );
}
