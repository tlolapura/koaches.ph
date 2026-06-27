"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, addWeeks, format, isToday, parse, startOfWeek } from "date-fns";
import { Ban, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Court, Session } from "@/lib/koaches/types";
import { courtNameFromLookup, useCourts } from "@/hooks/useCourts";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import {
  getHourlySlotRows,
  HOURLY_SESSION_MINUTES,
  slotFromRow,
  type AvailableSlot,
  type HourlySlotRow,
  type SlotGridOptions,
} from "@/lib/koaches/session-slots";
import { formatTimeDisplay } from "@/lib/koaches/session-time";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { workingHoursToIntervals } from "@/lib/koaches/coach-availability";
import type { CoachWorkingHours } from "@/lib/koaches/coach-availability";
import { cn } from "@/lib/utils";

const DESKTOP_GRID =
  "grid w-full grid-cols-[36px_repeat(7,minmax(0,1fr))] gap-1 lg:grid-cols-[44px_repeat(7,minmax(0,1fr))] lg:gap-1.5";

type CoachScheduleGridProps = {
  date: string;
  sessions: Session[];
  onDateChange: (date: string) => void;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
};

function parseDateKey(key: string) {
  return parse(key, "yyyy-MM-dd", new Date());
}

function weekKeys(anchor: string) {
  const weekStart = startOfWeek(parseDateKey(anchor), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));
}

function courtLabel(lookup: Map<string, Court>, courtId?: string) {
  if (!courtId) return "Court TBD";
  return courtNameFromLookup(lookup, courtId);
}

function courtShort(lookup: Map<string, Court>, courtId?: string) {
  const full = courtLabel(lookup, courtId);
  const word = full.split(/\s+/)[0] ?? full;
  return word.length > 9 ? `${word.slice(0, 8)}…` : word;
}

function compactTime(timeValue: string) {
  const h = parseInt(timeValue.split(":")[0], 10);
  return `${h % 12 || 12}${h >= 12 ? "p" : "a"}`;
}

const slotCellBase =
  "box-border flex w-full min-w-0 rounded-lg sm:rounded-xl min-h-[40px] sm:min-h-[44px] lg:min-h-[48px]";

function DayNavigator({
  date,
  onPrevDay,
  onNextDay,
}: {
  date: string;
  onPrevDay: () => void;
  onNextDay: () => void;
}) {
  const d = parseDateKey(date);

  return (
    <div className="flex items-center justify-between gap-1 sm:gap-2 md:hidden">
      <button
        type="button"
        onClick={onPrevDay}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#1D4ED8] hover:bg-[#EFF6FF] sm:h-10 sm:w-10"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="font-heading truncate text-sm font-bold text-[#1D4ED8]">
          {isToday(d) ? "Today" : format(d, "EEEE")}
        </p>
        <p className="text-xs text-[#6B7280]">{format(d, "MMMM d, yyyy")}</p>
      </div>
      <button
        type="button"
        onClick={onNextDay}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#1D4ED8] hover:bg-[#EFF6FF] sm:h-10 sm:w-10"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function WeekNavigator({
  weekDates,
  onPrevWeek,
  onNextWeek,
}: {
  weekDates: string[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
}) {
  const start = parseDateKey(weekDates[0]);
  const end = parseDateKey(weekDates[6]);

  return (
    <div className="hidden items-center justify-between gap-1 sm:gap-2 md:flex">
      <button
        type="button"
        onClick={onPrevWeek}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#1D4ED8] hover:bg-[#EFF6FF] sm:h-10 sm:w-10"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="font-heading truncate text-xs font-bold text-[#1D4ED8] sm:text-sm">
          <span className="sm:hidden">
            {format(start, "MMM d")} – {format(end, "d")}
          </span>
          <span className="hidden sm:inline">
            {format(start, "MMM d") === format(end, "MMM d")
              ? format(start, "MMMM d, yyyy")
              : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onNextWeek}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#1D4ED8] hover:bg-[#EFF6FF] sm:h-10 sm:w-10"
        aria-label="Next week"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

function DayHeaderButton({
  dateKey,
  selectedDate,
  onDateChange,
  compact,
}: {
  dateKey: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  compact?: boolean;
}) {
  const d = parseDateKey(dateKey);
  const active = dateKey === selectedDate;
  const today = isToday(d);

  return (
    <button
      type="button"
      onClick={() => onDateChange(dateKey)}
      className={cn(
        "box-border w-full min-w-0 rounded-lg px-0.5 py-1.5 text-center transition-colors sm:rounded-xl sm:px-1 sm:py-2",
        compact ? "min-h-[44px]" : "min-h-[40px] lg:min-h-[44px]",
        active ? "bg-[#4F8FF7] text-white shadow-sm" : today ? "bg-[#F0FDF4]" : "bg-[#F9FAFB]"
      )}
    >
      <p
        className={cn(
          "text-[8px] font-bold uppercase leading-none sm:text-[9px]",
          active ? "text-white/80" : today ? "text-[#166534]" : "text-[#6B7280]"
        )}
      >
        {compact ? format(d, "EEEEE") : today ? "Today" : format(d, "EEE")}
      </p>
      <p
        className={cn(
          "font-heading mt-0.5 text-xs font-bold leading-none sm:text-sm",
          active ? "text-white" : today ? "text-[#16A34A]" : "text-[#374151]"
        )}
      >
        {format(d, "d")}
      </p>
    </button>
  );
}

function OpenCell({
  dateKey,
  cell,
  compact,
  blockMode,
  onBookSlot,
  onBlockSlot,
}: {
  dateKey: string;
  cell: HourlySlotRow;
  compact?: boolean;
  blockMode?: boolean;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
  onBlockSlot: (date: string, cell: HourlySlotRow) => void;
}) {
  const label = blockMode ? "Block" : "Open";

  return (
    <button
      type="button"
      title={
        blockMode
          ? `Block ${format(parseDateKey(dateKey), "EEE MMM d")} ${cell.timeLabel}`
          : `Book ${format(parseDateKey(dateKey), "EEE MMM d")} ${cell.timeLabel}`
      }
      onClick={() =>
        blockMode ? onBlockSlot(dateKey, cell) : onBookSlot(dateKey, slotFromRow(cell))
      }
      className={cn(
        slotCellBase,
        blockMode
          ? "items-center justify-center border border-[#9CA3AF] bg-[#F3F4F6] font-bold text-[#6B7280] transition-all hover:border-[#6B7280] hover:bg-[#E5E7EB] active:scale-[0.98]"
          : "items-center justify-center border border-[#4F8FF7] bg-[#EFF6FF] font-bold text-[#4F8FF7] transition-all hover:border-[#3B82F6] hover:bg-[#DBEAFE] active:scale-[0.98]",
        compact ? "gap-1 px-2 text-xs" : "px-0.5 text-[8px] sm:text-[9px] lg:text-[10px]"
      )}
    >
      {compact ? (
        <>
          {blockMode ? (
            <Ban className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          ) : (
            <Plus className="h-3.5 w-3.5 shrink-0 text-[#4F8FF7]" strokeWidth={2.5} />
          )}
          {label}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function BlockedCell({
  cell,
  compact,
  onUnblockSlot,
}: {
  cell: HourlySlotRow;
  compact?: boolean;
  onUnblockSlot: (slotId: string) => void;
}) {
  return (
    <button
      type="button"
      title="Tap to unblock this time"
      onClick={() => cell.blockedSlotId && onUnblockSlot(cell.blockedSlotId)}
      className={cn(
        slotCellBase,
        "flex-col items-center justify-center gap-0.5 border border-[#D1D5DB] bg-[#E5E7EB] px-1 py-1 font-bold text-[#6B7280] transition-colors hover:bg-[#D1D5DB] sm:py-1.5"
      )}
    >
      <span className={cn("leading-tight", compact ? "text-[10px]" : "text-[9px] sm:text-[10px]")}>
        Blocked
      </span>
      <span className={cn("font-medium leading-tight text-[#9CA3AF]", compact ? "text-[9px]" : "text-[8px]")}>
        Tap to open
      </span>
    </button>
  );
}

function BookedCell({
  cell,
  compact,
  courtLookup,
}: {
  cell: HourlySlotRow;
  compact?: boolean;
  courtLookup: Map<string, Court>;
}) {
  const name = cell.bookedLabel ?? "Booked";
  const courtFull = courtLabel(courtLookup, cell.bookedCourtId);
  const court = compact ? courtShort(courtLookup, cell.bookedCourtId) : courtFull;
  const title = `${name} · ${courtFull}`;

  return (
    <Link
      href={cell.bookedSessionId ? `/coach/sessions/${cell.bookedSessionId}` : "#"}
      title={title}
      className={cn(
        slotCellBase,
        "flex-col items-center justify-center gap-0.5 border border-transparent bg-[#EDF2F7] px-1 py-1 transition-colors hover:bg-[#E2EAF3] sm:py-1.5"
      )}
    >
      <span
        className={cn(
          "line-clamp-1 w-full text-center font-bold leading-tight text-[#14532D]",
          compact ? "text-[10px]" : "text-[9px] sm:text-[10px]"
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "line-clamp-1 w-full text-center font-medium leading-tight text-[#6B7280]",
          compact ? "text-[9px]" : "text-[8px] lg:text-[9px]"
        )}
      >
        {compact ? (
          court
        ) : (
          <>
            <span className="lg:hidden">{courtShort(courtLookup, cell.bookedCourtId)}</span>
            <span className="hidden lg:inline">{courtFull}</span>
          </>
        )}
      </span>
    </Link>
  );
}

function slotGridOptions(
  workingHours: CoachWorkingHours,
  blockedForDate: (date: string) => Array<{ id: string; startMin: number; endMin: number }>,
  date: string
): SlotGridOptions {
  return {
    availabilityWindows: workingHoursToIntervals(workingHours),
    blockedIntervals: blockedForDate(date).map((s) => ({
      id: s.id,
      startMin: s.startMin,
      endMin: s.endMin,
    })),
  };
}

function MobileDayGrid({
  date,
  sessions,
  weekDates,
  slotOptions,
  blockMode,
  courtLookup,
  onDateChange,
  onBookSlot,
  onBlockSlot,
  onUnblockSlot,
}: {
  date: string;
  sessions: Session[];
  weekDates: string[];
  slotOptions: SlotGridOptions;
  blockMode: boolean;
  courtLookup: Map<string, Court>;
  onDateChange: (date: string) => void;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
  onBlockSlot: (date: string, cell: HourlySlotRow) => void;
  onUnblockSlot: (slotId: string) => void;
}) {
  const rows = useMemo(
    () => getHourlySlotRows(sessions, date, HOURLY_SESSION_MINUTES, slotOptions),
    [sessions, date, slotOptions]
  );

  return (
    <div className="space-y-3 md:hidden">
      <div className="grid grid-cols-7 gap-1">
        {weekDates.map((key) => (
          <DayHeaderButton
            key={key}
            dateKey={key}
            selectedDate={date}
            onDateChange={onDateChange}
            compact
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {rows.map((cell) => (
          <div key={cell.startValue} className="grid grid-cols-[52px_1fr] items-stretch gap-2">
            <div className="flex flex-col justify-center py-1 text-right">
              <span className="font-heading text-xs font-bold tabular-nums text-[#14532D]">
                {formatTimeDisplay(cell.startValue).replace(":00", "")}
              </span>
            </div>
            {cell.status === "open" ? (
              <OpenCell
                dateKey={date}
                cell={cell}
                compact
                blockMode={blockMode}
                onBookSlot={onBookSlot}
                onBlockSlot={onBlockSlot}
              />
            ) : cell.status === "blocked" ? (
              <BlockedCell cell={cell} compact onUnblockSlot={onUnblockSlot} />
            ) : (
              <BookedCell cell={cell} compact courtLookup={courtLookup} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopWeekGrid({
  weekDates,
  sessions,
  selectedDate,
  workingHours,
  blockedForDate,
  blockMode,
  courtLookup,
  onDateChange,
  onBookSlot,
  onBlockSlot,
  onUnblockSlot,
}: {
  weekDates: string[];
  sessions: Session[];
  selectedDate: string;
  workingHours: CoachWorkingHours;
  blockedForDate: (date: string) => Array<{ id: string; startMin: number; endMin: number }>;
  blockMode: boolean;
  courtLookup: Map<string, Court>;
  onDateChange: (date: string) => void;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
  onBlockSlot: (date: string, cell: HourlySlotRow) => void;
  onUnblockSlot: (slotId: string) => void;
}) {
  const hourRows = useMemo(
    () =>
      getHourlySlotRows(
        [],
        weekDates[0],
        HOURLY_SESSION_MINUTES,
        { availabilityWindows: workingHoursToIntervals(workingHours) }
      ),
    [weekDates, workingHours]
  );
  const grid = useMemo(
    () =>
      weekDates.map((dateKey) => ({
        dateKey,
        rows: getHourlySlotRows(
          sessions,
          dateKey,
          HOURLY_SESSION_MINUTES,
          slotGridOptions(workingHours, blockedForDate, dateKey)
        ),
      })),
    [weekDates, sessions, workingHours, blockedForDate]
  );

  return (
    <div className={cn(DESKTOP_GRID)}>
      <div aria-hidden />
      {weekDates.map((key) => (
        <DayHeaderButton
          key={key}
          dateKey={key}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      ))}

      {hourRows.map((hourRow) => (
        <div key={hourRow.startValue} className="contents">
          <div className="flex items-center justify-end self-stretch py-0.5 pr-0.5 lg:pr-1">
            <span className="font-heading text-[10px] font-bold tabular-nums text-[#14532D] lg:text-xs">
              <span className="lg:hidden">{compactTime(hourRow.startValue)}</span>
              <span className="hidden lg:inline">
                {formatTimeDisplay(hourRow.startValue).replace(":00", "")}
              </span>
            </span>
          </div>
          {grid.map(({ dateKey, rows }) => {
            const cell = rows.find((row) => row.startMin === hourRow.startMin);
            if (!cell) return <div key={dateKey} className="min-w-0" aria-hidden />;

            if (cell.status === "open") {
              return (
                <OpenCell
                  key={`${dateKey}-${cell.startValue}`}
                  dateKey={dateKey}
                  cell={cell}
                  blockMode={blockMode}
                  onBookSlot={onBookSlot}
                  onBlockSlot={onBlockSlot}
                />
              );
            }

            if (cell.status === "blocked") {
              return (
                <BlockedCell
                  key={`${dateKey}-${cell.startValue}`}
                  cell={cell}
                  onUnblockSlot={onUnblockSlot}
                />
              );
            }

            return <BookedCell key={`${dateKey}-${cell.startValue}`} cell={cell} courtLookup={courtLookup} />;
          })}
        </div>
      ))}
    </div>
  );
}

export function CoachScheduleGrid({
  date,
  sessions,
  onDateChange,
  onBookSlot,
}: CoachScheduleGridProps) {
  const coachId = usePortalCoachId();
  const { lookup } = useCourts();
  const weekDates = useMemo(() => weekKeys(date), [date]);
  const [blockMode, setBlockMode] = useState(false);
  const { workingHours, blockSlot, unblockSlot, blockedForDate } = useCoachAvailability(coachId);

  const mobileSlotOptions = useMemo(
    () => slotGridOptions(workingHours, blockedForDate, date),
    [workingHours, blockedForDate, date]
  );

  const shiftWeek = (delta: number) => {
    onDateChange(format(addWeeks(parseDateKey(date), delta), "yyyy-MM-dd"));
  };

  const shiftDay = (delta: number) => {
    onDateChange(format(addDays(parseDateKey(date), delta), "yyyy-MM-dd"));
  };

  const handleBlockSlot = (dateKey: string, cell: HourlySlotRow) => {
    blockSlot(dateKey, cell.startMin);
  };

  const handleUnblockSlot = (slotId: string) => {
    unblockSlot(slotId);
  };

  return (
    <div className="coach-card space-y-3 p-3 sm:space-y-4 sm:p-4">
      <DayNavigator date={date} onPrevDay={() => shiftDay(-1)} onNextDay={() => shiftDay(1)} />
      <WeekNavigator weekDates={weekDates} onPrevWeek={() => shiftWeek(-1)} onNextWeek={() => shiftWeek(1)} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setBlockMode((v) => !v)}
          className={cn(
            "inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors sm:text-xs",
            blockMode
              ? "bg-[#4F8FF7] text-white"
              : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
          )}
        >
          <Ban className="h-3.5 w-3.5" strokeWidth={2.25} />
          {blockMode ? "Blocking on" : "Block time"}
        </button>
      </div>

      <MobileDayGrid
        date={date}
        sessions={sessions}
        weekDates={weekDates}
        slotOptions={mobileSlotOptions}
        blockMode={blockMode}
        courtLookup={lookup}
        onDateChange={onDateChange}
        onBookSlot={onBookSlot}
        onBlockSlot={handleBlockSlot}
        onUnblockSlot={handleUnblockSlot}
      />

      <div className="max-md:hidden">
        <DesktopWeekGrid
          weekDates={weekDates}
          sessions={sessions}
          selectedDate={date}
          workingHours={workingHours}
          blockedForDate={blockedForDate}
          blockMode={blockMode}
          courtLookup={lookup}
          onDateChange={onDateChange}
          onBookSlot={onBookSlot}
          onBlockSlot={handleBlockSlot}
          onUnblockSlot={handleUnblockSlot}
        />
      </div>
    </div>
  );
}
