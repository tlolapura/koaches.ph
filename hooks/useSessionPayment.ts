"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, SessionPaymentStatus } from "@/lib/koaches/types";
import { resolveSessionPaymentStatus } from "@/lib/koaches/session-payment";
import { updateSessionPaymentAction, updateSessionTipAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions, patchCachedSession } from "@/lib/koaches/queries/invalidate";

export function useSessionPayment(
  session: Pick<Session, "id" | "coachId" | "paymentStatus" | "tip">
) {
  const [paymentStatus, setPaymentStatusState] = useState<SessionPaymentStatus>(
    () => resolveSessionPaymentStatus(session)
  );
  const [tip, setTipState] = useState(() => session.tip ?? 0);

  // Sync from server/cache props only — do not listen to sessions-updated events,
  // or a stale prop will overwrite an optimistic update before the detail query refreshes.
  useEffect(() => {
    setPaymentStatusState(resolveSessionPaymentStatus(session));
    setTipState(session.tip ?? 0);
  }, [session.id, session.paymentStatus, session.tip]);

  const setPaymentStatus = useCallback(
    async (next: SessionPaymentStatus) => {
      const prev = paymentStatus;
      setPaymentStatusState(next);
      patchCachedSession(session.coachId, session.id, { paymentStatus: next });
      try {
        await updateSessionPaymentAction(session.id, next);
        invalidateCoachSessions(session.coachId);
      } catch (err) {
        setPaymentStatusState(prev);
        patchCachedSession(session.coachId, session.id, { paymentStatus: prev });
        throw err;
      }
    },
    [session.id, session.coachId, paymentStatus]
  );

  const setTip = useCallback(
    async (next: number) => {
      const amount = Math.max(0, Math.round(next));
      const prev = tip;
      setTipState(amount);
      patchCachedSession(session.coachId, session.id, { tip: amount });
      try {
        await updateSessionTipAction(session.id, amount);
        invalidateCoachSessions(session.coachId);
      } catch (err) {
        setTipState(prev);
        patchCachedSession(session.coachId, session.id, { tip: prev });
        throw err;
      }
    },
    [session.id, session.coachId, tip]
  );

  return { paymentStatus, setPaymentStatus, tip, setTip };
}
