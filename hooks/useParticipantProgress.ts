"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@/lib/koaches/types";
import {
  buildParticipantProgressEntry,
  type ParticipantRatings,
  resolveParticipantProgress,
} from "@/lib/koaches/session-progress";
import { getSessionParticipants } from "@/lib/koaches/session-participants";
import { updateSessionProgressAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";

export function useParticipantProgress(session: Session, participantId: string) {
  const [ratings, setRatingsState] = useState<ParticipantRatings>(() =>
    resolveParticipantProgress(session, participantId)
  );

  const sync = useCallback(() => {
    setRatingsState(resolveParticipantProgress(session, participantId));
  }, [session, participantId]);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    window.addEventListener("koaches-session-progress-updated", sync);
    window.addEventListener("koaches-sessions-updated", sync);
    return () => {
      window.removeEventListener("koaches-session-progress-updated", sync);
      window.removeEventListener("koaches-sessions-updated", sync);
    };
  }, [sync]);

  const saveRatings = useCallback(
    async (next: ParticipantRatings) => {
      const entry = buildParticipantProgressEntry(participantId, next);
      const existing = session.participantProgress ?? [];
      const merged = existing.filter((p) => p.participantId !== participantId);
      const participants = getSessionParticipants(session);
      const isSinglePlayer = participants.length === 1 && participants[0].id === participantId;

      const updatedSession: Session = {
        ...session,
        participantProgress: [...merged, entry],
        ...(isSinglePlayer
          ? { ratingsBefore: next.ratingsBefore, ratingsAfter: next.ratingsAfter }
          : {}),
      };
      await updateSessionProgressAction(session.id, updatedSession);
      setRatingsState(next);
      invalidateCoachSessions(session.coachId);
      window.dispatchEvent(new Event("koaches-session-progress-updated"));
    },
    [session, participantId]
  );

  return { ratings, saveRatings };
}
