"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, SessionStatus } from "@/lib/koaches/types";
import {
  getSessionDisplayStatus,
  getSessionDisplayStatusFromData,
  SESSION_LIFECYCLE_UPDATED_EVENT,
  type SessionDisplayStatus,
} from "@/lib/koaches/session-lifecycle";
import { PROGRESS_CARDS_UPDATED_EVENT } from "@/lib/koaches/progress-cards";
import { useProgressCards } from "@/hooks/useProgressCards";
import { updateSessionStatusAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions, invalidateCoachStudents } from "@/lib/koaches/queries/invalidate";

export function useSessionStatus(session: Session) {
  const { cards } = useProgressCards(session.coachId);
  const [status, setStatus] = useState<SessionStatus>(session.status);
  const [displayStatus, setDisplayStatus] = useState<SessionDisplayStatus>(() =>
    getSessionDisplayStatusFromData(session)
  );

  const sync = useCallback(() => {
    setStatus(session.status);
    setDisplayStatus(getSessionDisplayStatus({ ...session, status: session.status }, cards));
  }, [session, cards]);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const onUpdate = () => sync();
    window.addEventListener(SESSION_LIFECYCLE_UPDATED_EVENT, onUpdate);
    window.addEventListener("koaches-session-progress-updated", onUpdate);
    window.addEventListener(PROGRESS_CARDS_UPDATED_EVENT, onUpdate);
    window.addEventListener("koaches-sessions-updated", onUpdate);
    return () => {
      window.removeEventListener(SESSION_LIFECYCLE_UPDATED_EVENT, onUpdate);
      window.removeEventListener("koaches-session-progress-updated", onUpdate);
      window.removeEventListener(PROGRESS_CARDS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("koaches-sessions-updated", onUpdate);
    };
  }, [sync]);

  const markDone = useCallback(async () => {
    await updateSessionStatusAction(session.id, "done");
    setStatus("done");
    setDisplayStatus(getSessionDisplayStatus({ ...session, status: "done" }, cards));
    invalidateCoachSessions(session.coachId);
    invalidateCoachStudents(session.coachId);
  }, [session, cards]);

  const markCanceled = useCallback(async () => {
    await updateSessionStatusAction(session.id, "canceled");
    setStatus("canceled");
    setDisplayStatus("canceled");
    invalidateCoachSessions(session.coachId);
    invalidateCoachStudents(session.coachId);
  }, [session.id, session.coachId]);

  return {
    status,
    displayStatus,
    markDone,
    markCanceled,
  };
}
