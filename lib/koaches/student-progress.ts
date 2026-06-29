import type { Session, SkillRating } from "./types";
import {
  filterRatedSkills,
  getStudentSessionRatings,
  hasRatingsForCard,
  type ParticipantRatings,
} from "./session-progress";

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
  return session.type === "drop-in" ? "Drop-in" : "Session";
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
