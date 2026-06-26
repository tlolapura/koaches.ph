import type { Session, SkillRating } from "./types";
import {
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
  if (!ratings?.length) return 0;
  return ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
}

export function countImprovedSkills(before: SkillRating[], after: SkillRating[]): number {
  return before.filter((b) => {
    const a = after.find((x) => x.skillId === b.skillId);
    return (a?.score ?? 0) > b.score;
  }).length;
}

export function formatSessionProgressLabel(session: Session): string {
  if (session.sessionNumber) return `Session ${session.sessionNumber}`;
  return session.type === "drop-in" ? "Drop-in" : "Session";
}
