import type { Session } from "./types";
import {
  formatTimeDisplay,
  minutesBetweenTimeValues,
  minutesToHtmlValue,
  parseTimeToMinutes,
} from "./session-time";
import { isCanceledStatus } from "./session-status";
import { formatSessionParticipantNames } from "./session-participants";

export type TimeInterval = {
  startMin: number;
  endMin: number;
};

export type BusyBlock = TimeInterval & {
  sessionId: string;
  label: string;
  timeLabel: string;
  courtId?: string;
};

export type AvailableSlot = {
  startMin: number;
  endMin: number;
  startValue: string;
  endValue: string;
  label: string;
};

export const HOURLY_SESSION_MINUTES = 60;

export const OPERATING_DAY_START = 6 * 60;
export const OPERATING_DAY_END = 21 * 60;

export type SlotCellStatus = "open" | "booked" | "blocked";

export type SlotGridOptions = {
  dayStart?: number;
  dayEnd?: number;
  availabilityWindows?: TimeInterval[];
  blockedIntervals?: Array<TimeInterval & { id?: string }>;
};

function resolveAvailabilityWindows(options?: SlotGridOptions): TimeInterval[] {
  if (options?.availabilityWindows?.length) {
    return [...options.availabilityWindows].sort((a, b) => a.startMin - b.startMin);
  }
  const dayStart = options?.dayStart ?? OPERATING_DAY_START;
  const dayEnd = options?.dayEnd ?? OPERATING_DAY_END;
  return [{ startMin: dayStart, endMin: dayEnd }];
}

export type HourlySlotRow = {
  startMin: number;
  startValue: string;
  endValue: string;
  timeLabel: string;
  status: SlotCellStatus;
  bookedLabel?: string;
  bookedSessionId?: string;
  bookedCourtId?: string;
  blockedSlotId?: string;
};

export type SlotGridCell = HourlySlotRow & {
  date: string;
};

export function sessionToInterval(session: Session): TimeInterval {
  const startMin = parseTimeToMinutes(session.time);
  const endMin = session.endTime
    ? parseTimeToMinutes(session.endTime)
    : startMin + HOURLY_SESSION_MINUTES;
  return {
    startMin,
    endMin: endMin > startMin ? endMin : endMin + 24 * 60,
  };
}

export function htmlIntervalToMinutes(start: string, end: string): TimeInterval {
  const startMin = parseTimeToMinutes(start);
  let endMin = parseTimeToMinutes(end);
  if (endMin <= startMin) endMin += 24 * 60;
  return { startMin, endMin };
}

export function intervalsOverlap(a: TimeInterval, b: TimeInterval): boolean {
  return a.startMin < b.endMin && b.startMin < a.endMin;
}

function mergeIntervals(intervals: TimeInterval[]): TimeInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.startMin - b.startMin);
  const merged: TimeInterval[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current.startMin <= last.endMin) {
      last.endMin = Math.max(last.endMin, current.endMin);
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

export function getBusyBlocksForDate(sessions: Session[], date: string): BusyBlock[] {
  return sessions
    .filter((s) => Boolean(s.date) && s.date === date && !isCanceledStatus(s.status))
    .map((session) => {
      const { startMin, endMin } = sessionToInterval(session);
      const timeLabel = session.endTime
        ? `${session.time} – ${session.endTime}`
        : session.time;
      return {
        startMin,
        endMin,
        sessionId: session.id,
        label: formatSessionParticipantNames(session),
        timeLabel,
        courtId: session.courtId,
      };
    })
    .sort((a, b) => a.startMin - b.startMin);
}

export function getHourlySlotRows(
  sessions: Session[],
  date: string,
  durationMinutes = HOURLY_SESSION_MINUTES,
  options?: SlotGridOptions
): HourlySlotRow[] {
  const windows = resolveAvailabilityWindows(options);
  const blocked = options?.blockedIntervals ?? [];
  const busy = getBusyBlocksForDate(sessions, date);
  const rows: HourlySlotRow[] = [];
  const seen = new Set<number>();

  for (const window of windows) {
    for (let m = window.startMin; m + durationMinutes <= window.endMin; m += HOURLY_SESSION_MINUTES) {
      if (seen.has(m)) continue;
      seen.add(m);

      const startValue = minutesToHtmlValue(m);
      const endValue = minutesToHtmlValue(m + durationMinutes);
      const interval = { startMin: m, endMin: m + durationMinutes };
      const sessionBlock = busy.find((b) => intervalsOverlap(interval, b));
      const blockedBlock = blocked.find((b) => intervalsOverlap(interval, b));

      let status: SlotCellStatus = "open";
      if (sessionBlock) status = "booked";
      else if (blockedBlock) status = "blocked";

      rows.push({
        startMin: m,
        startValue,
        endValue,
        timeLabel: formatTimeDisplay(startValue),
        status,
        bookedLabel: sessionBlock?.label,
        bookedSessionId: sessionBlock?.sessionId,
        bookedCourtId: sessionBlock?.courtId,
        blockedSlotId: blockedBlock?.id,
      });
    }
  }

  return rows.sort((a, b) => a.startMin - b.startMin);
}

export function slotFromRow(row: HourlySlotRow): AvailableSlot {
  return {
    startMin: row.startMin,
    endMin: row.startMin + HOURLY_SESSION_MINUTES,
    startValue: row.startValue,
    endValue: row.endValue,
    label: `${row.timeLabel} – ${formatTimeDisplay(row.endValue)}`,
  };
}

function getAvailableSlotsInWindow(
  sessions: Session[],
  date: string,
  durationMinutes: number,
  window: TimeInterval,
  blocked: TimeInterval[],
  step: number
): AvailableSlot[] {
  const busy = mergeIntervals([...getBusyBlocksForDate(sessions, date), ...blocked]);
  const slots: AvailableSlot[] = [];
  let cursor = window.startMin;

  const alignToHour = (min: number) => {
    const remainder = min % HOURLY_SESSION_MINUTES;
    return remainder === 0 ? min : min + (HOURLY_SESSION_MINUTES - remainder);
  };

  const tryGap = (gapStart: number, gapEnd: number) => {
    for (let start = alignToHour(gapStart); start + durationMinutes <= gapEnd; start += step) {
      const end = start + durationMinutes;
      slots.push({
        startMin: start,
        endMin: end,
        startValue: minutesToHtmlValue(start),
        endValue: minutesToHtmlValue(end),
        label: `${formatTimeDisplay(minutesToHtmlValue(start))} – ${formatTimeDisplay(minutesToHtmlValue(end))}`,
      });
    }
  };

  for (const block of busy) {
    if (block.startMin > cursor) {
      tryGap(cursor, Math.min(block.startMin, window.endMin));
    }
    cursor = Math.max(cursor, block.endMin);
  }

  if (cursor < window.endMin) {
    tryGap(cursor, window.endMin);
  }

  return slots;
}

export function getAvailableSlots(
  sessions: Session[],
  date: string,
  durationMinutes: number,
  options?: {
    dayStart?: number;
    dayEnd?: number;
    availabilityWindows?: TimeInterval[];
    stepMinutes?: number;
    blockedIntervals?: TimeInterval[];
  }
): AvailableSlot[] {
  const windows = resolveAvailabilityWindows(options);
  const step = options?.stepMinutes ?? HOURLY_SESSION_MINUTES;
  const blocked = options?.blockedIntervals ?? [];

  const slots = windows.flatMap((window) =>
    getAvailableSlotsInWindow(sessions, date, durationMinutes, window, blocked, step)
  );

  const byStart = new Map<number, AvailableSlot>();
  for (const slot of slots) {
    byStart.set(slot.startMin, slot);
  }

  return [...byStart.values()].sort((a, b) => a.startMin - b.startMin);
}

export function hasScheduleConflict(
  sessions: Session[],
  date: string,
  startValue: string,
  endValue: string,
  excludeSessionId?: string,
  blockedIntervals: TimeInterval[] = [],
  availabilityWindows: TimeInterval[] = []
): boolean {
  const candidate = htmlIntervalToMinutes(startValue, endValue);
  const blocked = blockedIntervals.some((interval) => intervalsOverlap(candidate, interval));
  if (blocked) return true;
  if (
    availabilityWindows.length > 0 &&
    !availabilityWindows.some(
      (window) => candidate.startMin >= window.startMin && candidate.endMin <= window.endMin
    )
  ) {
    return true;
  }
  return sessions.some((session) => {
    if (session.date !== date || isCanceledStatus(session.status)) return false;
    if (excludeSessionId && session.id === excludeSessionId) return false;
    return intervalsOverlap(candidate, sessionToInterval(session));
  });
}

export function findNearestAvailableSlot(
  slots: AvailableSlot[],
  preferredStartValue?: string
): AvailableSlot | undefined {
  if (slots.length === 0) return undefined;
  if (!preferredStartValue) return slots[0];
  const preferred = parseTimeToMinutes(preferredStartValue);
  return slots.reduce((best, slot) => {
    const bestDist = Math.abs(best.startMin - preferred);
    const slotDist = Math.abs(slot.startMin - preferred);
    return slotDist < bestDist ? slot : best;
  });
}
