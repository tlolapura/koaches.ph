"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, MessageSquareText } from "lucide-react";
import { absoluteProgressCardUrl, buildProgressCardUrl } from "@/lib/koaches/progress-cards";
import { coachFirstName as resolveCoachFirstName } from "@/lib/koaches/person-name";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

type ShareProgressCardMessageButtonProps = {
  cardId: string;
  /** Player display name for the message greeting */
  studentName?: string;
  className?: string;
  /** Primary (default) or outline styling */
  variant?: "primary" | "outline";
};

function playerFirstName(name?: string) {
  const first = name?.trim().split(/\s+/)[0];
  return first || "there";
}

function defaultProgressMessage(opts: {
  studentName?: string;
  coachFirstName?: string;
  cardUrl: string;
}) {
  const player = playerFirstName(opts.studentName);
  const coach = opts.coachFirstName?.trim();
  // Skip placeholder/"Coach" so we never write "Coach your coach" or "Coach Coach".
  const withCoach =
    coach && coach.toLowerCase() !== "coach" && coach.toLowerCase() !== "your coach"
      ? ` with Coach ${coach}`
      : "";
  return `Hi ${player}! Here's your progress card from today's session${withCoach}:\n\n${opts.cardUrl}\n\nTake a look and message me if you have questions!`;
}

function usePageOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}

/** Editable copy-paste message with the progress card link (Viber / WhatsApp / Messenger). */
export function ShareProgressCardMessageButton({
  cardId,
  studentName,
  className,
  variant = "primary",
}: ShareProgressCardMessageButtonProps) {
  const { showToast } = useCoachToast();
  const coachId = usePortalCoachId();
  const { coach } = useCoachProfile(coachId);
  const coachShort = coach ? resolveCoachFirstName(coach) : undefined;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const origin = usePageOrigin();
  const cardUrl = origin
    ? `${origin}/progress/${cardId}`
    : absoluteProgressCardUrl(cardId);

  const buildDefault = () =>
    defaultProgressMessage({
      studentName,
      coachFirstName: coachShort,
      cardUrl,
    });

  const openSheet = () => {
    // Always refresh the default when opening so a late-loaded coach name is used.
    setMessage(buildDefault());
    setOpen(true);
  };

  const copyMessage = async () => {
    const text = message.trim() || buildDefault();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Message copied. Paste it in Viber, WhatsApp, or Messenger.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <CoachButton
        type="button"
        variant={variant === "primary" ? "primary" : "outline"}
        className={className}
        onClick={openSheet}
      >
        <MessageSquareText className="h-4 w-4" strokeWidth={2} />
        Message for student
      </CoachButton>

      <CoachBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Message for student"
        subtitle="Edit this, copy it, then paste into Viber, WhatsApp, Messenger, or SMS"
        footer={
          <CoachSheetFooter>
            <CoachButton type="button" className="w-full" onClick={() => void copyMessage()}>
              {copied ? (
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
        <CoachSheetField
          label="Your message"
          htmlFor={`progress-share-${cardId}`}
          hint="Change the wording anytime. Keep the progress card link in the message."
        >
          <textarea
            id={`progress-share-${cardId}`}
            className="coach-input min-h-[160px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </CoachSheetField>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            className="text-sm font-semibold text-[#4F8FF7]"
            onClick={() => setMessage(buildDefault())}
          >
            Reset to default
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-[#6B7280]"
            onClick={() => {
              void navigator.clipboard.writeText(buildProgressCardUrl(cardId));
              showToast("Link copied");
            }}
          >
            Copy link only
          </button>
        </div>
      </CoachBottomSheet>
    </>
  );
}
