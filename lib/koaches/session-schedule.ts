import type { Session } from "./types";
import { formatDisplayDate } from "@/lib/utils";
import { formatSessionTimeRange } from "./session-time";

export function isSessionDateScheduled(session: Pick<Session, "date">): boolean {
  return Boolean(session.date);
}

export function formatSessionDateLabel(session: Pick<Session, "date">): string {
  return session.date ? formatDisplayDate(session.date) : "Date TBD";
}

export function formatSessionScheduleLabel(session: Session): string {
  if (!isSessionDateScheduled(session)) {
    const num = session.sessionNumber ? `Session ${session.sessionNumber}` : "Session";
    return `${num} · Date TBD`;
  }
  return `${formatDisplayDate(session.date!)} · ${formatSessionTimeRange(session.time, session.endTime)}`;
}

export function isFirstProgramSessionNumber(sessionNumber: number | undefined): boolean {
  return sessionNumber === 1;
}
