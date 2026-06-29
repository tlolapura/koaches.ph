"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, SessionPaymentStatus } from "@/lib/koaches/types";
import { resolveSessionPaymentStatus } from "@/lib/koaches/session-payment";
import { updateSessionPaymentAction, updateSessionTipAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";

export function useSessionPayment(
  session: Pick<Session, "id" | "coachId" | "paymentStatus" | "tip">
) {
  const [paymentStatus, setPaymentStatusState] = useState<SessionPaymentStatus>(
    () => resolveSessionPaymentStatus(session)
  );
  const [tip, setTipState] = useState(() => session.tip ?? 0);

  const sync = useCallback(() => {
    setPaymentStatusState(resolveSessionPaymentStatus(session));
    setTipState(session.tip ?? 0);
  }, [session]);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    window.addEventListener("koaches-session-payment-updated", sync);
    window.addEventListener("koaches-sessions-updated", sync);
    return () => {
      window.removeEventListener("koaches-session-payment-updated", sync);
      window.removeEventListener("koaches-sessions-updated", sync);
    };
  }, [sync]);

  const setPaymentStatus = useCallback(
    async (next: SessionPaymentStatus) => {
      await updateSessionPaymentAction(session.id, next);
      setPaymentStatusState(next);
      invalidateCoachSessions(session.coachId);
      window.dispatchEvent(new Event("koaches-session-payment-updated"));
    },
    [session.id, session.coachId]
  );

  const setTip = useCallback(
    async (next: number) => {
      const amount = Math.max(0, Math.round(next));
      await updateSessionTipAction(session.id, amount);
      setTipState(amount);
      invalidateCoachSessions(session.coachId);
      window.dispatchEvent(new Event("koaches-session-payment-updated"));
    },
    [session.id, session.coachId]
  );

  return { paymentStatus, setPaymentStatus, tip, setTip };
}
