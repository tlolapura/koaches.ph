"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, MessageSquareText, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { CoachProfile } from "@/lib/koaches/types";
import { buildJoinPath } from "@/lib/koaches/coach-routes";
import { coachFirstName } from "@/lib/koaches/person-name";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { SaveCoachQrCta } from "@/components/koaches/shared/SaveCoachQrCta";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";

type CoachJoinLinkCardProps = {
  coach: CoachProfile;
  className?: string;
};

function defaultJoinMessage(coachName: string, joinUrl: string) {
  return `Hi! Please join Coach ${coachName}'s roster here so we can schedule and track your sessions:\n\n${joinUrl}\n\nIt only takes a minute. Thanks!`;
}

/** QR block height (220px code + 16px padding each side) — keeps join sheets visually aligned */
const JOIN_QR_BLOCK_HEIGHT = 252;

function usePageOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}

/** Compact shortcut to the coach’s public student join page. */
export function CoachJoinLinkCard({ coach, className }: CoachJoinLinkCardProps) {
  const { showToast } = useCoachToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const origin = usePageOrigin();
  const joinPath = buildJoinPath(coach.slug);
  const joinUrl = origin ? `${origin}${joinPath}` : joinPath;
  const ready = origin.length > 0;
  const coachShort = coachFirstName(coach);
  const [message, setMessage] = useState("");

  if (!coach.slug?.trim()) return null;

  const defaultMessage = defaultJoinMessage(coachShort, joinUrl);
  const isMessageEdited = message.trim() !== defaultMessage.trim();

  const openMessageSheet = () => {
    setMessage((prev) => (prev.trim() ? prev : defaultJoinMessage(coachShort, joinUrl)));
    setPreviewOpen(false);
    setMessageOpen(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    showToast("Join link copied");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyMessage = async () => {
    const text = message.trim() || defaultJoinMessage(coachShort, joinUrl);
    await navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    showToast("Message copied. Paste it in Viber, WhatsApp, or Messenger.");
    setTimeout(() => setCopiedMessage(false), 2000);
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
            <div
              className="flex items-center justify-center rounded-2xl bg-[#F3F4F6] text-sm text-[#9CA3AF]"
              style={{ height: JOIN_QR_BLOCK_HEIGHT, width: JOIN_QR_BLOCK_HEIGHT }}
            >
              Preparing…
            </div>
          )}

          <div className="flex w-full max-w-full items-center gap-1.5 rounded-xl bg-[#F9FAFB] px-3 py-2 ring-1 ring-[#E5E7EB]">
            <p className="min-w-0 flex-1 truncate text-xs text-[#6B7280]">{joinUrl}</p>
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#4F8FF7] hover:bg-[#EFF6FF]"
              aria-label={copiedLink ? "Copied" : "Copy link"}
              title={copiedLink ? "Copied" : "Copy link"}
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              onClick={openMessageSheet}
              className="coach-btn-primary inline-flex min-h-[44px] items-center justify-center gap-2"
            >
              <MessageSquareText className="h-4 w-4" />
              Message for students
            </button>
            {ready ? (
              <SaveCoachQrCta
                coach={coach}
                url={joinUrl}
                variant="join"
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

      <CoachBottomSheet
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        onBack={() => {
          setMessageOpen(false);
          setPreviewOpen(true);
        }}
        title="Message for students"
        subtitle="Edit this, copy it, then paste into Viber, WhatsApp, Messenger, or SMS"
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="button"
              className="w-full"
              onClick={() => void copyMessage()}
            >
              {copiedMessage ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy message
                </>
              )}
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <CoachSheetField
            label="Your message"
            htmlFor="join-share-message"
            hint="Change the wording anytime. The join link should stay in the message."
          >
            <textarea
              id="join-share-message"
              className="coach-input resize-none"
              style={{ height: JOIN_QR_BLOCK_HEIGHT }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </CoachSheetField>
          {isMessageEdited ? (
            <button
              type="button"
              className="self-start text-sm font-semibold text-[#4F8FF7]"
              onClick={() => setMessage(defaultMessage)}
            >
              Reset to default
            </button>
          ) : null}
        </div>
      </CoachBottomSheet>
    </>
  );
}
