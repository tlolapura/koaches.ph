"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { sendProgressCardEmailAction } from "@/lib/koaches/actions/progress-cards";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

type SendProgressCardEmailButtonProps = {
  cardId: string;
  className?: string;
};

export function SendProgressCardEmailButton({ cardId, className }: SendProgressCardEmailButtonProps) {
  const { showToast } = useCoachToast();
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSend = async () => {
    if (sending) return;
    setSending(true);
    try {
      const result = await sendProgressCardEmailAction(cardId);
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      setSentTo(result.to);
      showToast(`Progress card sent to ${result.to}`);
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
      onClick={() => void handleSend()}
    >
      <Mail className="h-4 w-4" strokeWidth={2} />
      {sentTo ? "Email sent" : "Email to player"}
    </CoachButton>
  );
}
