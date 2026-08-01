import type { Session, SkillDefinition, SkillRating, SkillRubricId } from "./types";
import {
  filterRatedSkills,
  getStudentSessionRatings,
  hasRatingsForCard,
  type ParticipantRatings,
} from "./session-progress";
import { resolveSkills } from "./constants";

export type StudentSessionProgressEntry = {
  session: Session;
  ratings: ParticipantRatings;
};

function sessionSortKey(session: Session): string {
  const num = String(session.sessionNumber ?? 0).padStart(3, "0");
  return `${session.date ?? "0000-00-00"}-${num}`;
}

export function buildStudentProgressHistory(
  sessions: Session[],
  studentId: string
): StudentSessionProgressEntry[] {
  return sessions
    .filter((s) => s.status === "done")
    .map((session) => ({
      session,
      ratings: getStudentSessionRatings(session, studentId),
    }))
    .filter((e) => hasRatingsForCard(e.ratings))
    .sort((a, b) => sessionSortKey(a.session).localeCompare(sessionSortKey(b.session)));
}

export function averageSkillScore(ratings?: SkillRating[]): number {
  const rated = filterRatedSkills(ratings ?? []);
  if (!rated.length) return 0;
  return rated.reduce((sum, r) => sum + r.score, 0) / rated.length;
}

export function countImprovedSkills(before: SkillRating[], after: SkillRating[]): number {
  return before.filter((b) => {
    if (b.skipped) return false;
    const a = after.find((x) => x.skillId === b.skillId);
    if (a?.skipped) return false;
    return (a?.score ?? 0) > b.score;
  }).length;
}

export function formatSessionProgressLabel(session: Session): string {
  if (session.sessionNumber) return `Session ${session.sessionNumber}`;
  return session.type === "drop-in" ? "Drop-in" : session.type === "clinic" ? "Clinic" : "Session";
}

export type StudentProgressGroup = {
  id: string;
  kind: "program" | "drop-in";
  programId?: string;
  entries: StudentSessionProgressEntry[];
};

export function groupStudentProgressHistory(
  history: StudentSessionProgressEntry[],
  studentProgramId?: string
): StudentProgressGroup[] {
  const groups: StudentProgressGroup[] = [];
  const programBuckets = new Map<string, StudentSessionProgressEntry[]>();

  for (const entry of history) {
    if (entry.session.type === "drop-in") continue;
    const programId = entry.session.programId ?? studentProgramId ?? "program";
    const bucket = programBuckets.get(programId) ?? [];
    bucket.push(entry);
    programBuckets.set(programId, bucket);
  }

  for (const [programId, entries] of programBuckets) {
    if (entries.length === 0) continue;
    groups.push({ id: `program-${programId}`, kind: "program", programId, entries });
  }

  const dropIns = history.filter((e) => e.session.type === "drop-in");
  if (dropIns.length > 0) {
    groups.push({ id: "drop-ins", kind: "drop-in", entries: dropIns });
  }

  return groups;
}

export function countJourneySkillWins(
  first: StudentSessionProgressEntry,
  latest: StudentSessionProgressEntry
): number {
  return countImprovedSkills(
    first.ratings.ratingsBefore ?? [],
    latest.ratings.ratingsAfter ?? []
  );
}

export function sumSessionWins(entries: StudentSessionProgressEntry[]): number {
  return entries.reduce((total, entry) => {
    const before = entry.ratings.ratingsBefore ?? [];
    const after = entry.ratings.ratingsAfter ?? [];
    return total + countImprovedSkills(before, after);
  }, 0);
}

export type ProgramSessionSnapshot = {
  sessionId: string;
  sessionNumber: number | null;
  date?: string;
  label: string;
  ratingsAfter: SkillRating[];
  ratingsBefore: SkillRating[];
};

export function toProgramSessionSnapshots(
  entries: StudentSessionProgressEntry[]
): ProgramSessionSnapshot[] {
  return entries.map((entry) => ({
    sessionId: entry.session.id,
    sessionNumber: entry.session.sessionNumber ?? null,
    date: entry.session.date,
    label:
      entry.session.sessionNumber != null
        ? `S${entry.session.sessionNumber}`
        : formatSessionProgressLabel(entry.session),
    ratingsAfter: filterRatedSkills(entry.ratings.ratingsAfter ?? []),
    ratingsBefore: filterRatedSkills(entry.ratings.ratingsBefore ?? []),
  }));
}

export function collectSkillsAcrossSnapshots(
  snapshots: ProgramSessionSnapshot[]
): { id: string; name: string }[] {
  const map = new Map<string, string>();
  for (const snapshot of snapshots) {
    for (const rating of snapshot.ratingsAfter) {
      map.set(rating.skillId, rating.skillName);
    }
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Last known score per skill for a student (newest first).
 * Prefers ratingsAfter, then ratingsBefore. Skips the current session when provided.
 */
export type LastKnownSkillSource = {
  sessionId: string;
  date?: string;
  label: string;
};

export type LastKnownSkillBaseline = {
  scores: Record<string, number>;
  /** Where each skill score came from */
  sources: Record<string, LastKnownSkillSource>;
  /** Most recent session that contributed any score (for the banner) */
  latestSource: LastKnownSkillSource | null;
};

export function getLastKnownSkillBaseline(
  sessions: Session[],
  studentId: string,
  excludeSessionId?: string
): LastKnownSkillBaseline {
  const scoped = excludeSessionId
    ? sessions.filter((s) => s.id !== excludeSessionId)
    : sessions;
  const history = buildStudentProgressHistory(scoped, studentId);
  const scores: Record<string, number> = {};
  const sources: Record<string, LastKnownSkillSource> = {};

  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const source: LastKnownSkillSource = {
      sessionId: entry.session.id,
      date: entry.session.date,
      label: formatSessionProgressLabel(entry.session),
    };
    for (const rating of filterRatedSkills(entry.ratings.ratingsAfter ?? [])) {
      if (scores[rating.skillId] === undefined) {
        scores[rating.skillId] = rating.score;
        sources[rating.skillId] = source;
      }
    }
    for (const rating of filterRatedSkills(entry.ratings.ratingsBefore ?? [])) {
      if (scores[rating.skillId] === undefined) {
        scores[rating.skillId] = rating.score;
        sources[rating.skillId] = source;
      }
    }
  }

  const latestSource =
    history.length > 0
      ? {
          sessionId: history[history.length - 1].session.id,
          date: history[history.length - 1].session.date,
          label: formatSessionProgressLabel(history[history.length - 1].session),
        }
      : null;

  return { scores, sources, latestSource: Object.keys(scores).length ? latestSource : null };
}

/** @deprecated Prefer getLastKnownSkillBaseline */
export function getLastKnownSkillScores(
  sessions: Session[],
  studentId: string,
  excludeSessionId?: string
): Record<string, number> {
  return getLastKnownSkillBaseline(sessions, studentId, excludeSessionId).scores;
}

/** Seed start/end ratings: last known score per skill, else 0. Skills stay skipped until covered. */
export function seedSkillRatings(options: {
  rubricId: SkillRubricId;
  customSkillIds?: string[];
  customSkills?: SkillDefinition[];
  skillLabelOverrides?: Record<string, string>;
  lastKnownScores?: Record<string, number>;
}): SkillRating[] {
  return resolveSkills({
    rubricId: options.rubricId,
    customSkillIds: options.customSkillIds,
    customSkills: options.customSkills,
    skillLabelOverrides: options.skillLabelOverrides,
  }).map((skill) => ({
    skillId: skill.id,
    skillName: skill.name,
    category: skill.category,
    score: options.lastKnownScores?.[skill.id] ?? 0,
    skipped: true,
  }));
}
