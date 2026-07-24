"use client";

import { useEffect, useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { CoachProfile } from "@/lib/koaches/types";
import { buildJoinPath } from "@/lib/koaches/coach-routes";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { SaveCoachQrCta } from "@/components/koaches/shared/SaveCoachQrCta";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";

type CoachJoinLinkCardProps = {
  coach: CoachProfile;
  className?: string;
};

/** Compact shortcut to the coach’s public student intake / join page. */
export function CoachJoinLinkCard({ coach, className }: CoachJoinLinkCardProps) {
  const { showToast } = useCoachToast();
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const joinPath = buildJoinPath(coach.slug);
  const joinUrl = origin ? `${origin}${joinPath}` : joinPath;
  const ready = origin.length > 0;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!coach.slug?.trim()) return null;

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    showToast("Join link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className={cn(
          "coach-card flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-[#FAFBFC] active:bg-[#F3F4F6]",
          className
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#166534]">
          <QrCode className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-[#111827]">Student join QR</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Tap to show a code players can scan to sign up.
          </p>
        </div>
      </button>

      <CoachBottomSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Student join QR"
        subtitle="Players can scan this to open your sign-up page"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          {ready ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={joinUrl}
                size={220}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#14532D"
              />
            </div>
          ) : (
            <div className="flex h-[252px] w-[252px] items-center justify-center rounded-2xl bg-[#F3F4F6] text-sm text-[#9CA3AF]">
              Preparing…
            </div>
          )}

          <p className="max-w-full truncate px-2 text-center text-xs text-[#6B7280]">{joinUrl}</p>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="coach-btn-outline inline-flex min-h-[44px] items-center justify-center gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
            {ready ? (
              <SaveCoachQrCta
                coach={coach}
                url={joinUrl}
                variant="intake"
                label="Save QR image"
                filename={`${coach.slug}-join-qr.png`}
                className="min-h-[44px]"
                onSaved={() => showToast("Join QR saved. Show it at court.")}
                onError={() => showToast("Could not save image", "error")}
              />
            ) : null}
          </div>
        </div>
      </CoachBottomSheet>
    </>
  );
}
