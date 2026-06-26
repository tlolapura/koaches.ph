import type { Program, Session, SessionPaymentStatus, Student } from "./types";
import { isCanceledStatus } from "./session-status";
import { sessionIncludesStudent, participantFromStudent } from "./session-participants";
import { getProgramPerSessionRevenue } from "./program-pricing";
import {
  addMinutesToTimeValue,
  formatTimeDisplay,
} from "./session-time";
import {
  hasScheduleConflict,
  HOURLY_SESSION_MINUTES,
  type TimeInterval,
} from "./session-slots";

export function getScheduledProgramSessionNumbers(
  studentId: string,
  programId: string,
  sessions: Session[]
): number[] {
  return sessions
    .filter(
      (s) =>
        s.type === "program" &&
        s.programId === programId &&
        !isCanceledStatus(s.status) &&
        (s.studentId === studentId || sessionIncludesStudent(s, studentId))
    )
    .map((s) => s.sessionNumber)
    .filter((n): n is number => typeof n === "number");
}

/** Next session number to book for this student, or undefined if all are done/scheduled */
export function getNextProgramSessionNumber(
  program: Program,
  student: Student,
  sessions: Session[]
): number | undefined {
  const scheduled = new Set(
    getScheduledProgramSessionNumbers(student.id, program.id, sessions)
  );
  for (let n = student.sessionsCompleted + 1; n <= program.sessionCount; n++) {
    if (!scheduled.has(n)) return n;
  }
  return undefined;
}

export function hasProgramSessionConflict(options: {
  sessions: Session[];
  date?: string;
  startTime: string;
  blockedForDate: (date: string) => TimeInterval[];
  availabilityWindows: TimeInterval[];
}): boolean {
  if (!options.date) return false;
  const endTime = addMinutesToTimeValue(options.startTime, HOURLY_SESSION_MINUTES);
  return hasScheduleConflict(
    options.sessions,
    options.date,
    options.startTime,
    endTime,
    undefined,
    options.blockedForDate(options.date),
    options.availabilityWindows
  );
}

export function buildProgramSession(options: {
  coachId: string;
  program: Program;
  student: Student;
  sessionNumber: number;
  date?: string;
  startTime?: string;
  courtId: string;
  paymentStatus: SessionPaymentStatus;
}): Session {
  const { coachId, program, student, sessionNumber, date, startTime, courtId, paymentStatus } =
    options;
  const scheduled = Boolean(date && startTime);
  const endTime =
    scheduled && startTime
      ? addMinutesToTimeValue(startTime, HOURLY_SESSION_MINUTES)
      : undefined;

  return {
    id: `sess-prog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    coachId,
    studentId: student.id,
    type: "program",
    programId: program.id,
    sessionNumber,
    date,
    time: scheduled && startTime ? formatTimeDisplay(startTime) : "TBD",
    endTime: scheduled && endTime ? formatTimeDisplay(endTime) : "TBD",
    courtId,
    status: "upcoming",
    paymentStatus,
    price: getProgramPerSessionRevenue(program),
    playerCount: 1,
    participants: [participantFromStudent(student)],
  };
}
