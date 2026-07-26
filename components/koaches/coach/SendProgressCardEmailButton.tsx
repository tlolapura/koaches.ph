"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import {
  sendProgressCardEmailAction,
} from "@/lib/koaches/actions/progress-cards";
import { PROGRESS_CARD_EMAIL_MAX_SENDS } from "@/lib/koaches/progress-card-email-limits";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

type SendProgressCardEmailButtonProps = {
  cardId: string;
  /** Known send count from the progress card (defaults to 0). */
  emailSendCount?: number;
  className?: string;
};

export function SendProgressCardEmailButton({
  cardId,
  emailSendCount = 0,
  className,
}: SendProgressCardEmailButtonProps) {
  const { showToast } = useCoachToast();
  const [sending, setSending] = useState(false);
  const [sendCount, setSendCount] = useState(emailSendCount);

  useEffect(() => {
    setSendCount(emailSendCount);
  }, [emailSendCount, cardId]);

  const remaining = Math.max(0, PROGRESS_CARD_EMAIL_MAX_SENDS - sendCount);
  const atLimit = remaining <= 0;

  const handleSend = async () => {
    if (sending || atLimit) return;
    setSending(true);
    try {
      const result = await sendProgressCardEmailAction(cardId);
      if (!result.ok) {
        if (typeof result.emailSendCount === "number") {
          setSendCount(result.emailSendCount);
        }
        showToast(result.error, "error");
        return;
      }
      setSendCount(result.emailSendCount);
      const left = result.remaining;
      showToast(
        left > 0
          ? `Progress card sent to ${result.to} · ${left} send left`
          : `Progress card sent to ${result.to} · email limit reached`
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not send email", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <CoachButton
      type="button"
      variant="outline"
      className={className}
      loading={sending}
      loadingLabel="Sending…"
      disabled={atLimit}
      onClick={() => void handleSend()}
    >
      <Mail className="h-4 w-4" strokeWidth={2} />
      {atLimit
        ? "Email already sent"
        : sendCount > 0
          ? `Email again (${remaining} send${remaining === 1 ? "" : "s"} left)`
          : "Email progress card to player"}
    </CoachButton>
  );
}
