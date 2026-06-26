import type { Session, SessionParticipantProgress, SkillRating } from "./types";
import { getSessionParticipants } from "./session-participants";

export type ParticipantRatings = {
  ratingsBefore?: SkillRating[];
  ratingsAfter?: SkillRating[];
};

export function hasRatingsForCard(ratings: ParticipantRatings): boolean {
  return Boolean(ratings.ratingsBefore?.length && ratings.ratingsAfter?.length);
}

function fromSessionProgress(session: Session, participantId: string): ParticipantRatings {
  const entry = session.participantProgress?.find((p) => p.participantId === participantId);
  if (entry) {
    return { ratingsBefore: entry.ratingsBefore, ratingsAfter: entry.ratingsAfter };
  }

  const participants = getSessionParticipants(session);
  if (participants.length === 1 && participants[0].id === participantId) {
    return { ratingsBefore: session.ratingsBefore, ratingsAfter: session.ratingsAfter };
  }

  return {};
}

export function resolveParticipantProgressFromData(
  session: Session,
  participantId: string
): ParticipantRatings {
  return fromSessionProgress(session, participantId);
}

export function resolveParticipantProgress(
  session: Session,
  participantId: string
): ParticipantRatings {
  return fromSessionProgress(session, participantId);
}

/** Ratings for a roster student in a session (handles group sessions) */
export function getStudentSessionRatings(
  session: Session,
  studentId: string
): ParticipantRatings {
  const participant = getSessionParticipants(session).find((p) => p.studentId === studentId);
  if (!participant) return {};
  return resolveParticipantProgress(session, participant.id);
}

export function buildParticipantProgressEntry(
  participantId: string,
  ratings: ParticipantRatings
): SessionParticipantProgress {
  return { participantId, ...ratings };
}
