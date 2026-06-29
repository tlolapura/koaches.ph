import type { Session, SessionParticipantProgress, SkillCategory, SkillRating } from "./types";
import { getSessionParticipants } from "./session-participants";

export type ParticipantRatings = {
  ratingsBefore?: SkillRating[];
  ratingsAfter?: SkillRating[];
};

const SKILL_CATEGORIES = new Set<SkillCategory>([
  "fundamentals",
  "serve-return",
  "third-shot",
  "kitchen",
  "volleys",
  "movement",
  "game-iq",
  "mental",
]);

function parseScore(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Coerce JSONB / legacy shapes into typed skill ratings */
export function normalizeSkillRating(raw: unknown): SkillRating | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const skillId = row.skillId ?? row.skill_id;
  const skillName = row.skillName ?? row.skill_name;
  const category = row.category;
  const score = parseScore(row.score);
  if (typeof skillId !== "string" || typeof skillName !== "string") return null;
  if (typeof category !== "string" || !SKILL_CATEGORIES.has(category as SkillCategory)) return null;
  if (score == null) return null;

  return {
    skillId,
    skillName,
    category: category as SkillCategory,
    score,
    ...(row.skipped ? { skipped: true } : {}),
  };
}

export function normalizeSkillRatings(raw: unknown): SkillRating[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeSkillRating).filter((rating): rating is SkillRating => rating !== null);
}

export function normalizeParticipantRatings(raw: ParticipantRatings | undefined): ParticipantRatings {
  if (!raw) return {};
  return {
    ratingsBefore: normalizeSkillRatings(raw.ratingsBefore),
    ratingsAfter: normalizeSkillRatings(raw.ratingsAfter),
  };
}

export function isSkillRated(rating: SkillRating): boolean {
  return !rating.skipped;
}

export function filterRatedSkills(ratings: SkillRating[]): SkillRating[] {
  return ratings.filter(isSkillRated);
}

export function hasRatingsForCard(ratings: ParticipantRatings): boolean {
  const before = filterRatedSkills(ratings.ratingsBefore ?? []);
  const after = filterRatedSkills(ratings.ratingsAfter ?? []);
  return before.length > 0 && after.length > 0;
}

function participantProgressEntry(
  entry: SessionParticipantProgress
): ParticipantRatings {
  return normalizeParticipantRatings({
    ratingsBefore: entry.ratingsBefore,
    ratingsAfter: entry.ratingsAfter,
  });
}

function fromSessionProgress(session: Session, participantId: string): ParticipantRatings {
  const progress = session.participantProgress ?? [];
  const direct = progress.find((p) => p.participantId === participantId);
  if (direct) return participantProgressEntry(direct);

  const participants = getSessionParticipants(session);
  const participant = participants.find((p) => p.id === participantId);

  // Match saved progress by roster student when participant ids changed
  if (participant?.studentId) {
    for (const entry of progress) {
      const entryParticipant = participants.find((p) => p.id === entry.participantId);
      if (entryParticipant?.studentId === participant.studentId) {
        return participantProgressEntry(entry);
      }
    }
  }

  // Recover ratings when participant ids changed but only one saved entry exists
  if (participants.length === 1 && progress.length === 1 && participant) {
    return participantProgressEntry(progress[0]);
  }

  if (participants.length === 1 && participants[0].id === participantId) {
    return normalizeParticipantRatings({
      ratingsBefore: session.ratingsBefore,
      ratingsAfter: session.ratingsAfter,
    });
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
