import { addDays, format, parse, startOfWeek } from "date-fns";
import type { CoachProfile, Program, Session } from "./types";
import { blockedSlotsToBusyIntervals, workingHoursToIntervals } from "./coach-availability";
import type { CoachWorkingHours } from "./coach-availability";
import type { BlockedSlot } from "./coach-availability";
import { getHourlySlotRows, type HourlySlotRow } from "./session-slots";
import { formatTimeDisplay } from "./session-time";
import { formatDisplayDate } from "@/lib/utils";

export type SocialStoryTemplate = "daily-slots" | "weekly-slots" | "programs";

export const SOCIAL_STORY_TEMPLATES: Array<{
  id: SocialStoryTemplate;
  label: string;
  description: string;
}> = [
  {
    id: "daily-slots",
    label: "Today's openings",
    description: "Share open hourly slots for one day",
  },
  {
    id: "weekly-slots",
    label: "This week",
    description: "Weekly snapshot of availability",
  },
  {
    id: "programs",
    label: "Programs",
    description: "Promote your coaching bundles",
  },
];

export type DailyStorySlot = {
  timeLabel: string;
};

export type WeeklyStoryDay = {
  date: string;
  dayLabel: string;
  dateLabel: string;
  openSlots: DailyStorySlot[];
};

export type ProgramStoryItem = {
  name: string;
  summary: string;
  targetLevel: string;
};

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

export function getWeeklyStoryDays(
  sessions: Session[],
  anchorDate: string,
  workingHours: CoachWorkingHours,
  blockedSlots: BlockedSlot[]
): WeeklyStoryDay[] {
  const weekStart = startOfWeek(parse(anchorDate, "yyyy-MM-dd", new Date()), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const date = format(addDays(weekStart, i), "yyyy-MM-dd");
    const openSlots = getDailyStorySlots(sessions, date, workingHours, blockedSlots);
    const d = parse(date, "yyyy-MM-dd", new Date());
    return {
      date,
      dayLabel: format(d, "EEE"),
      dateLabel: format(d, "MMM d"),
      openSlots,
    };
  });
}

export function getProgramStoryItems(programs: Program[]): ProgramStoryItem[] {
  return programs
    .filter((p) => p.isActive)
    .map((p) => ({
      name: p.name,
      summary: `${p.sessionCount} sessions · ₱${p.price.toLocaleString("en-PH")} / person`,
      targetLevel: p.targetLevel,
    }));
}

export function buildStoryCaption(
  template: SocialStoryTemplate,
  coach: CoachProfile,
  options: {
    date?: string;
    dailySlots?: DailyStorySlot[];
    weeklyDays?: WeeklyStoryDay[];
    programs?: ProgramStoryItem[];
    bookUrl: string;
  }
): string {
  const firstName = coach.name.replace(/^Coach\s+/i, "");
  if (template === "daily-slots" && options.date) {
    const times = options.dailySlots?.map((s) => s.timeLabel).join(", ") || "fully booked";
    return `Open pickleball slots with Coach ${firstName} on ${formatDisplayDate(options.date)}! ${times}. Book: ${options.bookUrl}`;
  }
  if (template === "weekly-slots") {
    const openDays =
      options.weeklyDays?.filter((d) => d.openSlots.length > 0).length ?? 0;
    return `This week's schedule with Coach ${firstName} — ${openDays} days with openings. Book: ${options.bookUrl}`;
  }
  const count = options.programs?.length ?? 0;
  return `${count} coaching program${count === 1 ? "" : "s"} with Coach ${firstName}. Bundle pricing per person. Join: ${options.bookUrl}`;
}
