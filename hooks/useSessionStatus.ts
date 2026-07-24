"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, SessionStatus } from "@/lib/koaches/types";
import {
  getSessionDisplayStatus,
  getSessionDisplayStatusFromData,
  type SessionDisplayStatus,
} from "@/lib/koaches/session-lifecycle";
import { useProgressCards } from "@/hooks/useProgressCards";
import { updateSessionStatusAction } from "@/lib/koaches/actions/sessions";
import {
  invalidateCoachSessions,
  invalidateCoachStudents,
  patchCachedSession,
} from "@/lib/koaches/queries/invalidate";

export function useSessionStatus(session: Session) {
  const { cards } = useProgressCards(session.coachId);
  const [status, setStatus] = useState<SessionStatus>(session.status);
  const [displayStatus, setDisplayStatus] = useState<SessionDisplayStatus>(() =>
    getSessionDisplayStatusFromData(session)
  );

  useEffect(() => {
    setStatus(session.status);
    setDisplayStatus(getSessionDisplayStatus({ ...session, status: session.status }, cards));
  }, [session, cards]);

  const markDone = useCallback(async () => {
    const prev = status;
    setStatus("done");
    setDisplayStatus(getSessionDisplayStatus({ ...session, status: "done" }, cards));
    patchCachedSession(session.coachId, session.id, { status: "done" });
    try {
      await updateSessionStatusAction(session.id, "done");
      invalidateCoachSessions(session.coachId);
      invalidateCoachStudents(session.coachId);
    } catch (err) {
      setStatus(prev);
      setDisplayStatus(getSessionDisplayStatus({ ...session, status: prev }, cards));
      patchCachedSession(session.coachId, session.id, { status: prev });
      throw err;
    }
  }, [session, cards, status]);

  const markCanceled = useCallback(async () => {
    const prev = status;
    setStatus("canceled");
    setDisplayStatus("canceled");
    patchCachedSession(session.coachId, session.id, { status: "canceled" });
    try {
      await updateSessionStatusAction(session.id, "canceled");
      invalidateCoachSessions(session.coachId);
      invalidateCoachStudents(session.coachId);
    } catch (err) {
      setStatus(prev);
      setDisplayStatus(getSessionDisplayStatus({ ...session, status: prev }, cards));
      patchCachedSession(session.coachId, session.id, { status: prev });
      throw err;
    }
  }, [session, cards, status]);

  return {
    status,
    displayStatus,
    markDone,
    markCanceled,
  };
}
