import { formatTimeDisplay, minutesToHtmlValue, parseTimeToMinutes } from "./session-time";
import type { TimeInterval } from "./session-slots";
import { HOURLY_SESSION_MINUTES, intervalsOverlap } from "./session-slots";

export type WorkingHoursWindow = {
  id: string;
  startMin: number;
  endMin: number;
};

export type CoachWorkingHours = {
  windows: WorkingHoursWindow[];
};

export type BlockedSlot = {
  id: string;
  date: string;
  startMin: number;
  endMin: number;
};

export const DEFAULT_WORKING_HOURS: CoachWorkingHours = {
  windows: [{ id: "default", startMin: 8 * 60, endMin: 22 * 60 }],
};

export function formatWorkingHoursWindow(window: Pick<WorkingHoursWindow, "startMin" | "endMin">): string {
  return `${formatTimeDisplay(minutesToHtmlValue(window.startMin))} – ${formatTimeDisplay(minutesToHtmlValue(window.endMin))}`;
}

export function formatWorkingHoursSummary(hours: CoachWorkingHours): string {
  return sortWorkingWindows(hours.windows)
    .map((w) => formatWorkingHoursWindow(w))
    .join(", ");
}

export function sortWorkingWindows(windows: WorkingHoursWindow[]): WorkingHoursWindow[] {
  return [...windows].sort((a, b) => a.startMin - b.startMin);
}

export function workingHoursToIntervals(hours: CoachWorkingHours): TimeInterval[] {
  return sortWorkingWindows(hours.windows).map((w) => ({
    startMin: w.startMin,
    endMin: w.endMin,
  }));
}

export function isIntervalWithinWorkingHours(
  interval: TimeInterval,
  hours: CoachWorkingHours
): boolean {
  return hours.windows.some(
    (w) => interval.startMin >= w.startMin && interval.endMin <= w.endMin
  );
}

export function workingHoursFromDraft(
  draft: Array<{ id: string; startValue: string; endValue: string }>
): CoachWorkingHours {
  return {
    windows: draft.map((row) => ({
      id: row.id,
      startMin: parseTimeToMinutes(row.startValue),
      endMin: parseTimeToMinutes(row.endValue),
    })),
  };
}

export function workingHoursToDraft(hours: CoachWorkingHours) {
  return sortWorkingWindows(hours.windows).map((w) => ({
    id: w.id,
    startValue: minutesToHtmlValue(w.startMin),
    endValue: minutesToHtmlValue(w.endMin),
  }));
}

export function createWorkingHoursWindowId(): string {
  return `wh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function validateWorkingHours(hours: CoachWorkingHours): string | null {
  if (hours.windows.length === 0) return "Add at least one availability window.";

  const sorted = sortWorkingWindows(hours.windows);
  for (const window of sorted) {
    if (window.endMin <= window.startMin) return "Each window must end after it starts.";
    if (window.endMin - window.startMin < HOURLY_SESSION_MINUTES) {
      return "Each window must span at least one hour.";
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startMin < sorted[i - 1].endMin) {
      return "Time windows cannot overlap.";
    }
  }

  return null;
}

type LegacyWorkingHours = { startMin: number; endMin: number };

function isLegacyWorkingHours(value: unknown): value is LegacyWorkingHours {
  return (
    typeof value === "object" &&
    value !== null &&
    "startMin" in value &&
    "endMin" in value &&
    !("windows" in value)
  );
}

export function normalizeCoachWorkingHours(value: unknown): CoachWorkingHours {
  if (isLegacyWorkingHours(value)) {
    return {
      windows: [{ id: "legacy", startMin: value.startMin, endMin: value.endMin }],
    };
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "windows" in value &&
    Array.isArray((value as CoachWorkingHours).windows)
  ) {
    const windows = (value as CoachWorkingHours).windows
      .filter(
        (w) =>
          typeof w?.id === "string" &&
          typeof w?.startMin === "number" &&
          typeof w?.endMin === "number"
      )
      .map((w) => ({ id: w.id, startMin: w.startMin, endMin: w.endMin }));

    if (windows.length > 0 && !validateWorkingHours({ windows })) {
      return { windows };
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
