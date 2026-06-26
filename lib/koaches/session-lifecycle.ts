import type { Session, SessionStatus } from "./types";
import { getSessionParticipants } from "./session-participants";
import { hasRatingsForCard, resolveParticipantProgress } from "./session-progress";
import { findProgressCardForSession } from "./progress-cards";
import { isCanceledStatus, isDoneStatus } from "./session-status";
import type { ProgressCard } from "./types";

export const SESSION_LIFECYCLE_UPDATED_EVENT = "koaches-session-lifecycle-updated";

export type SessionDisplayStatus =
  | "upcoming"
  | "canceled"
  | "done"
  | "pending_progress_review"
  | "ready_to_share";

export function resolveSessionStatus(session: Pick<Session, "status">): SessionStatus {
  return session.status;
}

export function sessionNeedsProgressReview(session: Session): boolean {
  const status = resolveSessionStatus(session);
  if (!isDoneStatus(status) || isCanceledStatus(status)) return false;

  const participants = getSessionParticipants(session);
  if (participants.length === 0) return true;

  return participants.some(
    (p) => !hasRatingsForCard(resolveParticipantProgress(session, p.id))
  );
}

export function sessionNeedsProgressReviewFromData(session: Session): boolean {
  return sessionNeedsProgressReview(session);
}

export function getSessionDisplayStatusFromData(session: Session): SessionDisplayStatus {
  const status = resolveSessionStatus(session);
  if (isCanceledStatus(status)) return "canceled";
  if (!isDoneStatus(status)) return "upcoming";
  if (sessionNeedsProgressReviewFromData(session)) return "pending_progress_review";
  return "done";
}

export function getSessionDisplayStatus(
  session: Session,
  progressCards: ProgressCard[]
): SessionDisplayStatus {
  const status = resolveSessionStatus(session);
  if (isCanceledStatus(status)) return "canceled";
  if (!isDoneStatus(status)) return "upcoming";

  if (sessionNeedsProgressReview(session)) return "pending_progress_review";

  const participants = getSessionParticipants(session);
  const allShared = participants.every((p) => {
    if (!p.studentId) return true;
    return Boolean(findProgressCardForSession(progressCards, session.id, p.studentId));
  });

  if (allShared && participants.length > 0) return "ready_to_share";
  if (sessionNeedsProgressReview(session)) return "pending_progress_review";
  return "done";
}

export function getSessionDisplayStatusLabel(status: SessionDisplayStatus): string {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "canceled":
      return "Canceled";
    case "done":
      return "Done";
    case "pending_progress_review":
      return "Needs ratings";
    case "ready_to_share":
      return "Ready to share";
  }
}
