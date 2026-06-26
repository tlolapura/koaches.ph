import { addDays, format, parse, startOfWeek } from "date-fns";
import type { Session } from "./types";
import { blockedSlotsToBusyIntervals, workingHoursToIntervals } from "./coach-availability";
import type { CoachWorkingHours } from "./coach-availability";
import type { BlockedSlot } from "./coach-availability";
import { getHourlySlotRows, type HourlySlotRow, type SlotCellStatus } from "./session-slots";
import { formatTimeDisplay, minutesToHtmlValue } from "./session-time";

export type SocialStoryTemplate = "daily-slots" | "week-calendar";

export const SOCIAL_STORY_TEMPLATES: Array<{
  id: SocialStoryTemplate;
  label: string;
  description: string;
}> = [
  {
    id: "daily-slots",
    label: "Today's openings",
    description: "Open hourly slots for one day",
  },
  {
    id: "week-calendar",
    label: "Week calendar",
    description: "Weekly grid with booked & open slots",
  },
];

export type DailyStorySlot = {
  timeLabel: string;
};

export type CalendarStoryCell = {
  status: SlotCellStatus | "off";
  bookedLabel?: string;
};

export type CalendarStoryHour = {
  timeLabel: string;
};

export type CalendarStoryDay = {
  date: string;
  dayLabel: string;
  dateNum: string;
  cells: CalendarStoryCell[];
};

export type CalendarStoryWeek = {
  weekLabel: string;
  hours: CalendarStoryHour[];
  days: CalendarStoryDay[];
  openCount: number;
  bookedCount: number;
};

const MAX_CALENDAR_HOURS = 9;

function compactHour(timeValue: string): string {
  const h = parseInt(timeValue.split(":")[0], 10);
  return `${h % 12 || 12}${h >= 12 ? "p" : "a"}`;
}

function slotGridOptions(
  workingHours: CoachWorkingHours,
  blockedSlots: BlockedSlot[],
  date: string
) {
  return {
    availabilityWindows: workingHoursToIntervals(workingHours),
    blockedIntervals: blockedSlotsToBusyIntervals(blockedSlots, date),
  };
}

function openRows(rows: HourlySlotRow[]): DailyStorySlot[] {
  return rows
    .filter((row) => row.status === "open")
    .map((row) => ({ timeLabel: formatTimeDisplay(row.startValue).replace(":00", "") }));
}

export function getDailyStorySlots(
  sessions: Session[],
  date: string,
  workingHours: CoachWorkingHours,
  blockedSlots: BlockedSlot[]
): DailyStorySlot[] {
  const rows = getHourlySlotRows(
    sessions,
    date,
    60,
    slotGridOptions(workingHours, blockedSlots, date)
  );
  return openRows(rows);
}

export function getCalendarStoryWeek(
  sessions: Session[],
  anchorDate: string,
  workingHours: CoachWorkingHours,
  blockedSlots: BlockedSlot[]
): CalendarStoryWeek {
  const weekStart = startOfWeek(parse(anchorDate, "yyyy-MM-dd", new Date()), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const dateKeys = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));

  const rowsByDay = dateKeys.map((date) =>
    getHourlySlotRows(sessions, date, 60, slotGridOptions(workingHours, blockedSlots, date))
  );

  const hourSet = new Set<number>();
  for (const rows of rowsByDay) {
    for (const row of rows) {
      hourSet.add(row.startMin);
    }
  }

  const sortedHours = [...hourSet].sort((a, b) => a - b).slice(0, MAX_CALENDAR_HOURS);
  const hours: CalendarStoryHour[] = sortedHours.map((startMin) => ({
    timeLabel: compactHour(minutesToHtmlValue(startMin)),
  }));

  let openCount = 0;
  let bookedCount = 0;

  const days: CalendarStoryDay[] = dateKeys.map((date, dayIndex) => {
    const rowMap = new Map(rowsByDay[dayIndex].map((row) => [row.startMin, row]));
    const d = parse(date, "yyyy-MM-dd", new Date());
    const cells: CalendarStoryCell[] = sortedHours.map((startMin) => {
      const row = rowMap.get(startMin);
      if (!row) return { status: "off" };
      if (row.status === "open") openCount += 1;
      if (row.status === "booked") bookedCount += 1;
      return {
        status: row.status,
        bookedLabel: row.bookedLabel,
      };
    });

    return {
      date,
      dayLabel: format(d, "EEE"),
      dateNum: format(d, "d"),
      cells,
    };
  });

  return {
    weekLabel: `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`,
    hours,
    days,
    openCount,
    bookedCount,
  };
}
