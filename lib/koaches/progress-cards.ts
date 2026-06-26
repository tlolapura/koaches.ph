import {
  formatParticipantProgramLabel,
  resolveParticipantProgramContext,
} from "./participant-program";
import { resolveSessionStatus } from "./session-lifecycle";
import { getSessionParticipants } from "./session-participants";
import { hasRatingsForCard, resolveParticipantProgress, type ParticipantRatings } from "./session-progress";
import type { CoachProfile, Program, ProgressCard, Session, Student } from "./types";
import { formatDisplayDate } from "@/lib/utils";

export const PROGRESS_CARDS_UPDATED_EVENT = "koaches-progress-cards-updated";

export function countSkillImprovements(
  before: ProgressCard["ratingsBefore"],
  after: ProgressCard["ratingsAfter"]
): number {
  return before.filter((b) => {
    const a = after.find((x) => x.skillId === b.skillId);
    return (a?.score ?? 0) > b.score;
  }).length;
}

export function findProgressCardForSession(
  cards: ProgressCard[],
  sessionId: string,
  studentId: string
): ProgressCard | undefined {
  return cards.find((c) => c.sessionId === sessionId && c.studentId === studentId);
}

export function buildProgressCardUrl(id: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/progress/${id}`;
  }
  return `/progress/${id}`;
}

export function newProgressCardId(): string {
  return `pc-${Date.now()}`;
}

export type ProgressCardLookup = {
  students?: Map<string, Student>;
  programs?: Map<string, Program>;
  coach?: Pick<CoachProfile, "name" | "skillTemplateId">;
};

export function buildProgressCardDraft(options: {
  session: Session;
  participantId: string;
  coachMessage: string;
  ratings: ParticipantRatings;
  lookup?: ProgressCardLookup;
}): ProgressCard {
  const { session, participantId, coachMessage, ratings, lookup } = options;
  const participant = getSessionParticipants(session).find((p) => p.id === participantId);
  if (!participant) throw new Error("Participant not found");

  const ctx = resolveParticipantProgramContext(participant, session, lookup);
  const programName = formatParticipantProgramLabel(ctx);
  const coachName = lookup?.coach?.name ?? "Coach";

  let programOrSession = programName;
  if (ctx.sessionNumber != null && ctx.totalSessions != null) {
    programOrSession = `${programName} — Session ${ctx.sessionNumber}`;
  } else {
    programOrSession = `${programName} · ${formatDisplayDate(session.date!)}`;
  }

  return {
    id: newProgressCardId(),
    studentId: participant.studentId ?? participant.id,
    coachId: session.coachId,
    studentName: participant.name,
    coachName,
    programName,
    programOrSession,
    dateCompleted: session.date ?? "",
    ratingsBefore: ratings.ratingsBefore ?? [],
    ratingsAfter: ratings.ratingsAfter ?? [],
    coachMessage,
    sessionId: session.id,
  };
}

export type ProgressCardCandidate = {
  session: Session;
  participantId: string;
  participantName: string;
  studentId: string;
  programLabel: string;
};

export function listProgressCardCandidates(
  _coachId: string,
  existingCards: ProgressCard[],
  sessions: Session[],
  lookup?: ProgressCardLookup
): ProgressCardCandidate[] {
  const candidates: ProgressCardCandidate[] = [];

  for (const session of sessions) {
    if (resolveSessionStatus(session) !== "done") continue;

    for (const participant of getSessionParticipants(session)) {
      if (!participant.studentId) continue;

      const ratings = resolveParticipantProgress(session, participant.id);
      if (!hasRatingsForCard(ratings)) continue;

      if (findProgressCardForSession(existingCards, session.id, participant.studentId)) {
        continue;
      }

      const ctx = resolveParticipantProgramContext(participant, session, lookup);
      candidates.push({
        session,
        participantId: participant.id,
        participantName: participant.name,
        studentId: participant.studentId,
        programLabel: formatParticipantProgramLabel(ctx),
      });
    }
  }

  return candidates.sort((a, b) => (b.session.date ?? "").localeCompare(a.session.date ?? ""));
}
