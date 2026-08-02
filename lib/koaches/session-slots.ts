import { addDays, format, parse } from "date-fns";
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
  sessionType?: Session["type"];
};

export type AvailableSlot = {
  startMin: number;
  endMin: number;
  startValue: string;
  endValue: string;
  label: string;
};

export const HOURLY_SESSION_MINUTES = 60;

export const SESSION_DURATION_OPTIONS = [60, 120, 180] as const;

export const MINUTES_PER_DAY = 24 * 60;
/** Calendar grid starts at 6:00 AM. */
export const OPERATING_DAY_START = 6 * 60;
/** Calendar grid ends at 2:00 AM the next morning (20h after 6am). */
export const OPERATING_DAY_END = 26 * 60;

export function addDaysToDateKey(dateKey: string, days: number): string {
  return format(addDays(parse(dateKey, "yyyy-MM-dd", new Date()), days), "yyyy-MM-dd");
}

/**
 * Map a slot on the view-day continuum (may be ≥ 24h for after-midnight)
 * to the date + clock time stored on sessions / blocked slots.
 */
export function resolveOvernightBooking(
  viewDate: string,
  startMin: number,
  durationMinutes = HOURLY_SESSION_MINUTES
): { date: string; startMin: number; endMin: number; startValue: string; endValue: string } {
  if (startMin >= MINUTES_PER_DAY) {
    const clockStart = startMin - MINUTES_PER_DAY;
    const date = addDaysToDateKey(viewDate, 1);
    return {
      date,
      startMin: clockStart,
      endMin: clockStart + durationMinutes,
      startValue: minutesToHtmlValue(clockStart),
      endValue: minutesToHtmlValue(clockStart + durationMinutes),
    };
  }
  return {
    date: viewDate,
    startMin,
    endMin: startMin + durationMinutes,
    startValue: minutesToHtmlValue(startMin),
    endValue: minutesToHtmlValue(startMin + durationMinutes),
  };
}

/** Continuum minutes for a clock time on sessionDate when rendering viewDate's column. */
export function toViewDayMinutes(
  sessionDate: string,
  clockStartMin: number,
  clockEndMin: number,
  viewDate: string
): TimeInterval | null {
  if (sessionDate === viewDate) {
    // Early-morning sessions belong to the previous column's overnight stretch.
    if (clockStartMin < OPERATING_DAY_START) return null;
    const endMin = clockEndMin > clockStartMin ? clockEndMin : clockEndMin + MINUTES_PER_DAY;
    return { startMin: clockStartMin, endMin };
  }
  if (sessionDate === addDaysToDateKey(viewDate, 1) && clockStartMin < OPERATING_DAY_START) {
    const endMin = clockEndMin > clockStartMin ? clockEndMin : clockEndMin + MINUTES_PER_DAY;
    return {
      startMin: clockStartMin + MINUTES_PER_DAY,
      endMin: endMin + MINUTES_PER_DAY,
    };
  }
  return null;
}

export type SlotCellStatus = "open" | "outside" | "booked" | "blocked";

export type SlotGridOptions = {
  dayStart?: number;
  dayEnd?: number;
  /**
   * Usual working windows for this date.
   * - omitted: treat the whole display day as open
   * - []: day off
   * - [...]: inside = open, outside windows = outside (full-day mode only)
   */
  availabilityWindows?: TimeInterval[];
  blockedIntervals?: Array<TimeInterval & { id?: string }>;
  /**
   * When true, only render working-hour rows (plus any booked/blocked outside them).
   * When false/omitted, render the full operating day (6am–2am).
   */
  fitToWorkingHours?: boolean;
  /** Override calendar labels (e.g. clinic name + capacity). */
  labelForSession?: (session: Session) => string | undefined;
};

function operatingDayWindow(options?: SlotGridOptions): TimeInterval {
  return {
    startMin: options?.dayStart ?? OPERATING_DAY_START,
    endMin: options?.dayEnd ?? OPERATING_DAY_END,
  };
}

function alignDownToHour(min: number): number {
  return Math.floor(min / HOURLY_SESSION_MINUTES) * HOURLY_SESSION_MINUTES;
}

function alignUpToHour(min: number): number {
  const rem = min % HOURLY_SESSION_MINUTES;
  return rem === 0 ? min : min + (HOURLY_SESSION_MINUTES - rem);
}

/** Continuous hour span covering the given intervals (aligned to hour boundaries). */
export function continuousHoursSpan(intervals: TimeInterval[]): TimeInterval | null {
  if (intervals.length === 0) return null;
  let start = intervals[0]!.startMin;
  let end = intervals[0]!.endMin;
  for (const interval of intervals) {
    start = Math.min(start, interval.startMin);
    end = Math.max(end, interval.endMin);
  }
  return {
    startMin: alignDownToHour(start),
    endMin: alignUpToHour(end),
  };
}

function hourSpanForInterval(interval: TimeInterval): TimeInterval {
  return {
    startMin: alignDownToHour(interval.startMin),
    endMin: Math.max(
      alignUpToHour(interval.endMin),
      alignDownToHour(interval.startMin) + HOURLY_SESSION_MINUTES
    ),
  };
}

/** Usual working windows, or null when the caller did not provide availability. */
function resolveWorkingWindows(options?: SlotGridOptions): TimeInterval[] | null {
  if (options?.availabilityWindows === undefined) return null;
  return [...options.availabilityWindows].sort((a, b) => a.startMin - b.startMin);
}

/**
 * Hours shown on the calendar.
 * Fit mode → one continuous span (week/day bounds via dayStart/dayEnd, or this day's
 * working min–max). Gaps inside the span render as muted “outside” but stay bookable.
 * Full / unbound → operating day (6am–2am).
 */
function resolveDisplayWindows(options?: SlotGridOptions): TimeInterval[] {
  const operating = operatingDayWindow(options);
  const working = resolveWorkingWindows(options);
  const boundStart = options?.dayStart;
  const boundEnd = options?.dayEnd;

  if (options?.fitToWorkingHours) {
    // Explicit week/day bound (preferred for aligned week grids).
    if (boundStart != null && boundEnd != null && boundEnd > boundStart) {
      return [{ startMin: boundStart, endMin: boundEnd }];
    }
    if (working === null) return [operating];
    if (working.length === 0) return [operating];
    let start = working[0]!.startMin;
    let end = working[0]!.endMin;
    for (const window of working) {
      start = Math.min(start, window.startMin);
      end = Math.max(end, window.endMin);
    }
    return [{ startMin: alignDownToHour(start), endMin: alignUpToHour(end) }];
  }

  let start = operating.startMin;
  let end = operating.endMin;
  for (const window of working ?? []) {
    start = Math.min(start, window.startMin);
    end = Math.max(end, window.endMin);
  }
  return [{ startMin: start, endMin: end }];
}

function intervalFullyInside(windows: TimeInterval[], startMin: number, endMin: number): boolean {
  return windows.some((window) => startMin >= window.startMin && endMin <= window.endMin);
}

/** Search windows for auto-pick / duration — prefer working hours; day off falls back to operating day. */
function resolveSlotSearchWindows(options?: SlotGridOptions): TimeInterval[] {
  const working = resolveWorkingWindows(options);
  if (working === null) return [operatingDayWindow(options)];
  if (working.length > 0) return working;
  return [operatingDayWindow(options)];
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
  bookedSessionType?: Session["type"];
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

export function getBusyBlocksForDate(
  sessions: Session[],
  date: string,
  labelForSession?: (session: Session) => string | undefined
): BusyBlock[] {
  const nextDate = addDaysToDateKey(date, 1);
  return sessions
    .filter(
      (s) =>
        Boolean(s.date) &&
        !isCanceledStatus(s.status) &&
        (s.date === date || s.date === nextDate)
    )
    .flatMap((session) => {
      const clock = sessionToInterval(session);
      const viewInterval = toViewDayMinutes(session.date!, clock.startMin, clock.endMin, date);
      if (!viewInterval) return [];

      const timeLabel = session.endTime
        ? `${session.time} – ${session.endTime}`
        : session.time;
      const override = labelForSession?.(session);
      const label =
        override ??
        (session.type === "clinic"
          ? `Clinic · ${Math.max(session.playerCount, 0)} players`
          : formatSessionParticipantNames(session));
      return [
        {
          startMin: viewInterval.startMin,
          endMin: viewInterval.endMin,
          sessionId: session.id,
          label,
          timeLabel,
          courtId: session.courtId,
          sessionType: session.type,
        },
      ];
    })
    .sort((a, b) => a.startMin - b.startMin);
}

export function getHourlySlotRows(
  sessions: Session[],
  date: string,
  durationMinutes = HOURLY_SESSION_MINUTES,
  options?: SlotGridOptions
): HourlySlotRow[] {
  const workingWindows = resolveWorkingWindows(options);
  const blocked = options?.blockedIntervals ?? [];
  const busy = getBusyBlocksForDate(sessions, date, options?.labelForSession);

  let displayWindows = resolveDisplayWindows(options);
  if (options?.fitToWorkingHours) {
    // Keep override bookings / blocks visible even when outside the fitted span.
    const extras = [
      ...busy.map((b) => hourSpanForInterval(b)),
      ...blocked.map((b) => hourSpanForInterval(b)),
    ];
    if (extras.length > 0) {
      displayWindows = mergeIntervals([...displayWindows, ...extras]);
      // Re-span to a single continuous range so midday gaps stay visible as outside.
      if (displayWindows.length > 1) {
        displayWindows = [
          {
            startMin: Math.min(...displayWindows.map((w) => w.startMin)),
            endMin: Math.max(...displayWindows.map((w) => w.endMin)),
          },
        ];
      }
    }
  }

  const rows: HourlySlotRow[] = [];
  const seen = new Set<number>();

  for (const window of displayWindows) {
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
      else if (
        workingWindows !== null &&
        !intervalFullyInside(workingWindows, interval.startMin, interval.endMin)
      ) {
        status = "outside";
      }

      rows.push({
        startMin: m,
        startValue,
        endValue,
        timeLabel: formatTimeDisplay(startValue),
        status,
        bookedLabel: sessionBlock?.label,
        bookedSessionId: sessionBlock?.sessionId,
        bookedCourtId: sessionBlock?.courtId,
        bookedSessionType: sessionBlock?.sessionType,
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
  const windows = resolveSlotSearchWindows(options);
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
  /** @deprecated Working hours are guidance only — coaches may book overrides. Ignored. */
  _availabilityWindows?: TimeInterval[]
): boolean {
  // Always compare in clock space on the session's calendar date.
  // (View-day continuum mapping is only for grid rendering; after-midnight bookings
  // are stored on the next date via resolveOvernightBooking before conflict checks.)
  const startMin = parseTimeToMinutes(startValue);
  let endMin = parseTimeToMinutes(endValue);
  if (endMin <= startMin) endMin += MINUTES_PER_DAY;
  const candidate = { startMin, endMin };

  const blocked = blockedIntervals.some((interval) => {
    // Accept either clock-space blocks or view-day overnight blocks (≥ 24h).
    const normalized =
      interval.startMin >= MINUTES_PER_DAY
        ? {
            startMin: interval.startMin - MINUTES_PER_DAY,
            endMin: interval.endMin - MINUTES_PER_DAY,
          }
        : interval;
    return intervalsOverlap(candidate, normalized);
  });
  if (blocked) return true;

  return sessions.some((session) => {
    if (!session.date || session.date !== date || isCanceledStatus(session.status)) return false;
    if (excludeSessionId && session.id === excludeSessionId) return false;
    return intervalsOverlap(candidate, sessionToInterval(session));
  });
}

export function getMaxDurationMinutesForStart(
  sessions: Session[],
  date: string,
  startValue: string,
  options?: SlotGridOptions,
  /** Prefer this when the clock time is ambiguous (early morning vs next-day overnight). */
  startMinOverride?: number
): number {
  const startMin = startMinOverride ?? parseTimeToMinutes(startValue);
  const windows = resolveDisplayWindows(options);

  let containingWindow = windows.find((w) => startMin >= w.startMin && startMin < w.endMin);
  if (!containingWindow && startMin < OPERATING_DAY_START) {
    // Early-morning override on this calendar date (before the 6am grid start).
    containingWindow = { startMin: 0, endMin: OPERATING_DAY_START };
  }
  if (!containingWindow) return 0;

  const busy =
    startMin >= MINUTES_PER_DAY
      ? mergeIntervals([
          ...getBusyBlocksForDate(sessions, date).map((b) => ({
            startMin: b.startMin,
            endMin: b.endMin,
          })),
          ...(options?.blockedIntervals ?? []),
        ])
      : mergeIntervals([
          ...sessions
            .filter(
              (s) => Boolean(s.date) && s.date === date && !isCanceledStatus(s.status)
            )
            .map((s) => sessionToInterval(s)),
          ...(options?.blockedIntervals ?? []).map((interval) =>
            interval.startMin >= MINUTES_PER_DAY
              ? {
                  startMin: interval.startMin - MINUTES_PER_DAY,
                  endMin: interval.endMin - MINUTES_PER_DAY,
                }
              : { startMin: interval.startMin, endMin: interval.endMin }
          ),
        ]);

  if (busy.some((block) => intervalsOverlap({ startMin, endMin: startMin + 1 }, block))) {
    return 0;
  }

  let maxEnd = containingWindow.endMin;
  for (const block of busy) {
    if (block.startMin > startMin) {
      maxEnd = Math.min(maxEnd, block.startMin);
      break;
    }
  }

  return Math.max(0, maxEnd - startMin);
}

export function getAllowedSessionDurations(
  maxMinutes: number,
  preferredMinutes = HOURLY_SESSION_MINUTES
): number[] {
  if (maxMinutes < HOURLY_SESSION_MINUTES) return [];

  const allowed = SESSION_DURATION_OPTIONS.filter((minutes) => minutes <= maxMinutes);
  if (allowed.length > 0) {
    if (preferredMinutes <= maxMinutes && !allowed.includes(preferredMinutes as (typeof SESSION_DURATION_OPTIONS)[number])) {
      return [...allowed, preferredMinutes].sort((a, b) => a - b);
    }
    return allowed;
  }

  const stepped = Math.floor(maxMinutes / HOURLY_SESSION_MINUTES) * HOURLY_SESSION_MINUTES;
  return stepped >= HOURLY_SESSION_MINUTES ? [stepped] : [];
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
