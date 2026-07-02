import {
  formatParticipantProgramLabel,
  resolveParticipantProgramContext,
} from "./participant-program";
import { resolveSessionStatus } from "./session-lifecycle";
import { getSessionParticipants } from "./session-participants";
import {
  filterRatedSkills,
  getStudentSessionRatings,
  hasRatingsForCard,
  normalizeParticipantRatings,
  resolveParticipantProgress,
  type ParticipantRatings,
} from "./session-progress";
import { buildSkillChanges, type SkillChange } from "./skill-progress-display";
import type { CoachProfile, Program, ProgressCard, Session, Student } from "./types";
import { progressCardCoachName } from "./person-name";
import { formatDisplayDate } from "@/lib/utils";

export const PROGRESS_CARDS_UPDATED_EVENT = "koaches-progress-cards-updated";

export function countSkillImprovements(
  before: ProgressCard["ratingsBefore"],
  after: ProgressCard["ratingsAfter"]
): number {
  return before.filter((b) => {
    if (b.skipped) return false;
    const a = after.find((x) => x.skillId === b.skillId);
    if (a?.skipped) return false;
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
  coach?: Pick<CoachProfile, "name" | "firstName" | "lastName" | "skillTemplateId">;
};

/** Prefer live session ratings over a stale card snapshot */
export function applySessionRatingsToProgressCard(
  card: ProgressCard,
  session: Session
): ProgressCard {
  const ratings = getStudentSessionRatings(session, card.studentId);
  if (!hasRatingsForCard(ratings)) return card;

  const normalized = normalizeParticipantRatings(ratings);
  return {
    ...card,
    ratingsBefore: filterRatedSkills(normalized.ratingsBefore ?? []),
    ratingsAfter: filterRatedSkills(normalized.ratingsAfter ?? []),
  };
}

export function getProgressCardRatings(
  card: Pick<ProgressCard, "ratingsBefore" | "ratingsAfter">
): { before: ProgressCard["ratingsBefore"]; after: ProgressCard["ratingsAfter"] } {
  const normalized = normalizeParticipantRatings({
    ratingsBefore: card.ratingsBefore,
    ratingsAfter: card.ratingsAfter,
  });
  const before = filterRatedSkills(normalized.ratingsBefore ?? []);
  const beforeIds = new Set(before.map((skill) => skill.skillId));
  const after = filterRatedSkills(normalized.ratingsAfter ?? []).filter((skill) =>
    beforeIds.has(skill.skillId)
  );
  return { before, after };
}

export type SessionFeedback = {
  strengths: string;
  toImprove: string;
  generalNote: string;
};

export function suggestSessionFeedback(changes: SkillChange[]): SessionFeedback {
  const improved = changes.filter((c) => c.delta > 0);
  const slipped = changes.filter((c) => c.delta < 0);

  return {
    strengths: improved.slice(0, 4).map((c) => c.skillName).join(", "),
    toImprove: slipped.slice(0, 4).map((c) => c.skillName).join(", "),
    generalNote: "",
  };
}

export function buildProgressCardDraft(options: {
  session: Session;
  participantId: string;
  feedback?: SessionFeedback;
  /** @deprecated Use feedback.generalNote */
  coachMessage?: string;
  ratings: ParticipantRatings;
  lookup?: ProgressCardLookup;
}): ProgressCard {
  const { session, participantId, feedback, coachMessage, ratings, lookup } = options;
  const generalNote = feedback?.generalNote?.trim() || coachMessage?.trim() || "";
  const normalized = normalizeParticipantRatings(ratings);
  const participant = getSessionParticipants(session).find((p) => p.id === participantId);
  if (!participant) throw new Error("Participant not found");

  const ctx = resolveParticipantProgramContext(participant, session, lookup);
  const programName = formatParticipantProgramLabel(ctx);
  const coachName = progressCardCoachName(lookup?.coach ?? null);

  let programOrSession = programName;
  if (ctx.sessionNumber != null && ctx.totalSessions != null) {
    programOrSession = `Session ${ctx.sessionNumber} of ${ctx.totalSessions}`;
  } else if (session.date) {
    programOrSession = formatDisplayDate(session.date);
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
    ratingsBefore: filterRatedSkills(normalized.ratingsBefore ?? []),
    ratingsAfter: filterRatedSkills(normalized.ratingsAfter ?? []),
    coachStrengths: feedback?.strengths?.trim() || undefined,
    coachToImprove: feedback?.toImprove?.trim() || undefined,
    coachMessage: generalNote,
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

/** Session line under the program badge — avoids repeating name + date */
export function formatProgressCardSessionDetail(card: Pick<ProgressCard, "programName" | "programOrSession" | "dateCompleted">): string | null {
  const date = card.dateCompleted ? formatDisplayDate(card.dateCompleted) : "";
  const detail = card.programOrSession?.trim() ?? "";

  if (!detail) return date || null;

  // Legacy cards: "Drop-in · June 27, 2026"
  const legacyPrefix = `${card.programName} · `;
  if (detail.startsWith(legacyPrefix)) {
    return detail.slice(legacyPrefix.length) || date || null;
  }

  // Legacy cards: "Program Name — Session 3"
  const legacyDash = `${card.programName} — `;
  if (detail.startsWith(legacyDash)) {
    return detail.slice(legacyDash.length) || date || null;
  }

  if (detail === card.programName) {
    return date || null;
  }

  return detail;
}
