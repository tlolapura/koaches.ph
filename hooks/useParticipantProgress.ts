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
import { invalidateCoachSessions, patchCachedSession } from "@/lib/koaches/queries/invalidate";

export function useParticipantProgress(session: Session, participantId: string) {
  const [ratings, setRatingsState] = useState<ParticipantRatings>(() =>
    resolveParticipantProgress(session, participantId)
  );

  // Sync when this participant's stored progress changes — not on every new session object.
  const progressSignature = JSON.stringify({
    before: session.ratingsBefore,
    after: session.ratingsAfter,
    entries: session.participantProgress,
  });

  useEffect(() => {
    setRatingsState(resolveParticipantProgress(session, participantId));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: session identity churns from cache patches
  }, [participantId, session.id, progressSignature]);

  const saveRatings = useCallback(
    async (next: ParticipantRatings) => {
      const entry = buildParticipantProgressEntry(participantId, next);
      const existing = session.participantProgress ?? [];
      const merged = existing.filter((p) => p.participantId !== participantId);
      const participants = getSessionParticipants(session);
      const isSinglePlayer = participants.length === 1 && participants[0].id === participantId;

      const progressPatch: Partial<Session> = {
        participantProgress: [...merged, entry],
        ...(isSinglePlayer
          ? { ratingsBefore: next.ratingsBefore, ratingsAfter: next.ratingsAfter }
          : {}),
      };

      setRatingsState(next);
      patchCachedSession(session.coachId, session.id, progressPatch);
      try {
        await updateSessionProgressAction(session.id, { ...session, ...progressPatch });
        invalidateCoachSessions(session.coachId);
        window.dispatchEvent(new Event("koaches-session-progress-updated"));
      } catch (err) {
        setRatingsState(resolveParticipantProgress(session, participantId));
        patchCachedSession(session.coachId, session.id, {
          participantProgress: session.participantProgress,
          ratingsBefore: session.ratingsBefore,
          ratingsAfter: session.ratingsAfter,
        });
        throw err;
      }
    },
    [session, participantId]
  );

  return { ratings, saveRatings };
}
