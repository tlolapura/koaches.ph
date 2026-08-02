import { formatTimeDisplay, minutesToHtmlValue, parseTimeToMinutes } from "./session-time";
import type { TimeInterval } from "./session-slots";
import { HOURLY_SESSION_MINUTES, intervalsOverlap } from "./session-slots";

export type WorkingHoursWindow = {
  id: string;
  startMin: number;
  endMin: number;
};

/** One day's usual availability. Index in `days` matches JS `Date#getDay()` (0=Sun … 6=Sat). */
export type DaySchedule = {
  enabled: boolean;
  windows: WorkingHoursWindow[];
};

export type CoachWorkingHours = {
  version: 2;
  days: DaySchedule[];
};

export type BlockedSlot = {
  id: string;
  date: string;
  startMin: number;
  endMin: number;
};

/** Mon→Sun display order (store still uses Sun=0). */
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export const WEEKDAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const WEEKDAY_FULL_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const DEFAULT_WINDOWS: WorkingHoursWindow[] = [
  { id: "default", startMin: 8 * 60, endMin: 22 * 60 },
];

function cloneWindows(windows: WorkingHoursWindow[]): WorkingHoursWindow[] {
  return windows.map((w) => ({ ...w }));
}

/** Apply the same windows to every day of the week (all enabled). */
export function workingHoursFromWindows(windows: WorkingHoursWindow[]): CoachWorkingHours {
  const safe = windows.length > 0 ? cloneWindows(windows) : cloneWindows(DEFAULT_WINDOWS);
  return {
    version: 2,
    days: Array.from({ length: 7 }, () => ({
      enabled: true,
      windows: cloneWindows(safe),
    })),
  };
}

export const DEFAULT_WORKING_HOURS: CoachWorkingHours = workingHoursFromWindows(DEFAULT_WINDOWS);

export function weekdayFromDateKey(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function getDaySchedule(hours: CoachWorkingHours, dayOfWeek: number): DaySchedule {
  return hours.days[dayOfWeek] ?? { enabled: false, windows: [] };
}

export function formatWorkingHoursWindow(window: Pick<WorkingHoursWindow, "startMin" | "endMin">): string {
  return `${formatTimeDisplay(minutesToHtmlValue(window.startMin))} – ${formatTimeDisplay(minutesToHtmlValue(window.endMin))}`;
}

export function sortWorkingWindows(windows: WorkingHoursWindow[]): WorkingHoursWindow[] {
  return [...windows].sort((a, b) => a.startMin - b.startMin);
}

function windowsSignature(windows: WorkingHoursWindow[]): string {
  return sortWorkingWindows(windows)
    .map((w) => `${w.startMin}-${w.endMin}`)
    .join("|");
}

function formatWindowsList(windows: WorkingHoursWindow[]): string {
  return sortWorkingWindows(windows)
    .map((w) => formatWorkingHoursWindow(w))
    .join(", ");
}

/** Compact summary, e.g. `Mon–Fri 8:00 AM – 10:00 PM · Sat 9:00 AM – 12:00 PM`. */
export function formatWorkingHoursSummary(hours: CoachWorkingHours): string {
  const normalized = normalizeCoachWorkingHours(hours);
  const groups: { days: number[]; windows: WorkingHoursWindow[] }[] = [];

  for (const day of WEEKDAY_DISPLAY_ORDER) {
    const schedule = getDaySchedule(normalized, day);
    if (!schedule.enabled || schedule.windows.length === 0) continue;
    const sig = windowsSignature(schedule.windows);
    const last = groups[groups.length - 1];
    if (last && windowsSignature(last.windows) === sig) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], windows: cloneWindows(schedule.windows) });
    }
  }

  if (groups.length === 0) return "No availability set";

  return groups
    .map((g) => `${formatDayRange(g.days)} ${formatWindowsList(g.windows)}`)
    .join(" · ");
}

function formatDayRange(days: number[]): string {
  if (days.length === 1) return WEEKDAY_SHORT_LABELS[days[0]];

  const displayIdx = days.map((d) =>
    WEEKDAY_DISPLAY_ORDER.indexOf(d as (typeof WEEKDAY_DISPLAY_ORDER)[number])
  );
  const displayConsecutive = displayIdx.every(
    (idx, i) => i === 0 || idx === displayIdx[i - 1] + 1
  );
  if (days.length >= 2 && displayConsecutive) {
    return `${WEEKDAY_SHORT_LABELS[days[0]]}–${WEEKDAY_SHORT_LABELS[days[days.length - 1]]}`;
  }
  return days.map((d) => WEEKDAY_SHORT_LABELS[d]).join(", ");
}

/** Intervals for a specific calendar date (yyyy-MM-dd). Empty if that weekday is off. */
export function workingHoursToIntervals(hours: CoachWorkingHours, date: string): TimeInterval[] {
  const day = weekdayFromDateKey(date);
  const schedule = getDaySchedule(normalizeCoachWorkingHours(hours), day);
  if (!schedule.enabled) return [];
  return sortWorkingWindows(schedule.windows).map((w) => ({
    startMin: w.startMin,
    endMin: w.endMin,
  }));
}

export function isIntervalWithinWorkingHours(
  interval: TimeInterval,
  hours: CoachWorkingHours,
  date: string
): boolean {
  return workingHoursToIntervals(hours, date).some(
    (w) => interval.startMin >= w.startMin && interval.endMin <= w.endMin
  );
}

export type DraftWindow = {
  id: string;
  startValue: string;
  endValue: string;
};

export type DraftDay = {
  enabled: boolean;
  windows: DraftWindow[];
};

export function workingHoursFromDraft(draft: DraftDay[]): CoachWorkingHours {
  const days: DaySchedule[] = Array.from({ length: 7 }, (_, i) => {
    const row = draft[i] ?? { enabled: false, windows: [] };
    return {
      enabled: row.enabled,
      windows: row.windows.map((w) => ({
        id: w.id,
        startMin: parseTimeToMinutes(w.startValue),
        endMin: parseTimeToMinutes(w.endValue),
      })),
    };
  });
  return { version: 2, days };
}

export function workingHoursToDraft(hours: CoachWorkingHours): DraftDay[] {
  const normalized = normalizeCoachWorkingHours(hours);
  return normalized.days.map((day) => ({
    enabled: day.enabled,
    windows: sortWorkingWindows(day.windows).map((w) => ({
      id: w.id,
      startValue: minutesToHtmlValue(w.startMin),
      endValue: minutesToHtmlValue(w.endMin),
    })),
  }));
}

export function createWorkingHoursWindowId(): string {
  return `wh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function validateWindows(windows: WorkingHoursWindow[], dayLabel?: string): string | null {
  const prefix = dayLabel ? `${dayLabel}: ` : "";
  if (windows.length === 0) return `${prefix}Add at least one time window.`;

  const sorted = sortWorkingWindows(windows);
  for (const window of sorted) {
    if (window.endMin <= window.startMin) return `${prefix}Each window must end after it starts.`;
    if (window.endMin - window.startMin < HOURLY_SESSION_MINUTES) {
      return `${prefix}Each window must span at least one hour.`;
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startMin < sorted[i - 1].endMin) {
      return `${prefix}Time windows cannot overlap.`;
    }
  }

  return null;
}

export function validateWorkingHours(hours: CoachWorkingHours): string | null {
  const normalized = normalizeCoachWorkingHours(hours);
  const enabledDays = normalized.days.filter((d) => d.enabled);
  if (enabledDays.length === 0) return "Turn on at least one day.";

  for (let i = 0; i < 7; i++) {
    const day = normalized.days[i];
    if (!day.enabled) continue;
    const error = validateWindows(day.windows, WEEKDAY_FULL_LABELS[i]);
    if (error) return error;
  }

  return null;
}

/** Copy one day's schedule onto Mon–Fri (keeps Sat/Sun as-is). */
export function copyDayToWeekdays(hours: CoachWorkingHours, sourceDay: number): CoachWorkingHours {
  const normalized = normalizeCoachWorkingHours(hours);
  const source = getDaySchedule(normalized, sourceDay);
  const days = normalized.days.map((day, i) =>
    i >= 1 && i <= 5
      ? { enabled: source.enabled, windows: cloneWindows(source.windows) }
      : { enabled: day.enabled, windows: cloneWindows(day.windows) }
  );
  return { version: 2, days };
}

/** Copy one day's schedule onto all seven days. */
export function copyDayToAllDays(hours: CoachWorkingHours, sourceDay: number): CoachWorkingHours {
  const normalized = normalizeCoachWorkingHours(hours);
  const source = getDaySchedule(normalized, sourceDay);
  return {
    version: 2,
    days: Array.from({ length: 7 }, () => ({
      enabled: source.enabled,
      windows: cloneWindows(source.windows),
    })),
  };
}

type LegacyWorkingHours = { startMin: number; endMin: number };
type LegacyWindowsHours = { windows: WorkingHoursWindow[] };

function isLegacyWorkingHours(value: unknown): value is LegacyWorkingHours {
  return (
    typeof value === "object" &&
    value !== null &&
    "startMin" in value &&
    "endMin" in value &&
    !("windows" in value) &&
    !("days" in value)
  );
}

function isLegacyWindowsHours(value: unknown): value is LegacyWindowsHours {
  return (
    typeof value === "object" &&
    value !== null &&
    "windows" in value &&
    Array.isArray((value as LegacyWindowsHours).windows) &&
    !("days" in value)
  );
}

function isV2Hours(value: unknown): value is CoachWorkingHours {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    (value as CoachWorkingHours).version === 2 &&
    Array.isArray((value as CoachWorkingHours).days)
  );
}

function sanitizeWindows(raw: unknown[]): WorkingHoursWindow[] {
  return raw
    .filter(
      (w): w is WorkingHoursWindow =>
        typeof w === "object" &&
        w !== null &&
        typeof (w as WorkingHoursWindow).id === "string" &&
        typeof (w as WorkingHoursWindow).startMin === "number" &&
        typeof (w as WorkingHoursWindow).endMin === "number"
    )
    .map((w) => ({ id: w.id, startMin: w.startMin, endMin: w.endMin }));
}

export function normalizeCoachWorkingHours(value: unknown): CoachWorkingHours {
  if (isV2Hours(value)) {
    const days = Array.from({ length: 7 }, (_, i) => {
      const raw = value.days[i];
      if (!raw || typeof raw !== "object") {
        return { enabled: false, windows: cloneWindows(DEFAULT_WINDOWS) };
      }
      const windows = sanitizeWindows(Array.isArray(raw.windows) ? raw.windows : []);
      return {
        enabled: Boolean(raw.enabled) && windows.length > 0,
        windows: windows.length > 0 ? windows : cloneWindows(DEFAULT_WINDOWS),
      };
    });
    return { version: 2, days };
  }

  if (isLegacyWorkingHours(value)) {
    return workingHoursFromWindows([{ id: "legacy", startMin: value.startMin, endMin: value.endMin }]);
  }

  if (isLegacyWindowsHours(value)) {
    const windows = sanitizeWindows(value.windows);
    if (windows.length > 0 && !validateWindows(windows)) {
      return workingHoursFromWindows(windows);
    }
  }

  return DEFAULT_WORKING_HOURS;
}

export function getBlockedSlotsForDate(slots: BlockedSlot[], date: string): BlockedSlot[] {
  return slots.filter((s) => s.date === date);
}

export function blockedSlotId(date: string, startMin: number): string {
  return `${date}-${startMin}`;
}

export function isIntervalBlocked(
  blocked: BlockedSlot[],
  date: string,
  interval: TimeInterval
): BlockedSlot | undefined {
  return getBlockedSlotsForDate(blocked, date).find((slot) =>
    intervalsOverlap(interval, { startMin: slot.startMin, endMin: slot.endMin })
  );
}

export function blockedSlotsToBusyIntervals(slots: BlockedSlot[], date: string): TimeInterval[] {
  return getBlockedSlotsForDate(slots, date).map((s) => ({
    startMin: s.startMin,
    endMin: s.endMin,
  }));
}
