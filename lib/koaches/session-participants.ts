import type { Session, SessionParticipant, Student } from "@/lib/koaches/types";

export function newParticipantId(): string {
  return `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function participantFromStudent(student: Student): SessionParticipant {
  return {
    id: newParticipantId(),
    name: student.name,
    studentId: student.id,
  };
}

/** Ensure participants array matches player count */
export function resizeParticipants(
  current: SessionParticipant[],
  playerCount: number,
  fillFrom?: SessionParticipant
): SessionParticipant[] {
  const next = [...current];
  while (next.length < playerCount) {
    next.push({
      id: newParticipantId(),
      name: "",
      studentId: fillFrom?.studentId && next.length === 0 ? fillFrom.studentId : undefined,
    });
  }
  return next.slice(0, playerCount);
}

export function getSessionParticipants(session: Session): SessionParticipant[] {
  if (session.participants?.length) return session.participants;
  return [{ id: `legacy-${session.studentId}`, name: "Student", studentId: session.studentId }];
}

export function formatSessionParticipantNames(session: Session): string {
  const parts = getSessionParticipants(session).map((p) => p.name).filter(Boolean);
  if (parts.length === 0) return "Session";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} & ${parts[1]}`;
  return `${parts[0]} + ${parts.length - 1} others`;
}

export function formatSessionParticipantList(session: Session): string {
  const names = getSessionParticipants(session).map((p) => p.name).filter(Boolean);
  return names.join(", ");
}

export function sessionIncludesStudent(session: Session, studentId: string): boolean {
  return getSessionParticipants(session).some((p) => p.studentId === studentId);
}
