"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Ban, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { cn } from "@/lib/utils";

const DESKTOP_GRID =
  "grid w-full grid-cols-[36px_repeat(7,minmax(0,1fr))] gap-1 lg:grid-cols-[44px_repeat(7,minmax(0,1fr))] lg:gap-1.5";

type CoachScheduleGridProps = {
  date: string;
  sessions: Session[];
  onDateChange: (date: string) => void;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
  /** Optional calendar label override (used for clinic blocks). */
  labelForSession?: (session: Session) => string | undefined;
};

function parseDateKey(key: string) {
  return parse(key, "yyyy-MM-dd", new Date());
}

function toDateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function weekKeys(anchor: string) {
  const weekStart = startOfWeek(parseDateKey(anchor), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStart, i)));
}

function todayKey() {
  return toDateKey(new Date());
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
  "box-border flex w-full min-w-0 rounded-lg sm:rounded-xl min-h-[36px] sm:min-h-[40px] lg:min-h-[44px]";

function buildScrollDates(selected: string): string[] {
  const today = parseDateKey(todayKey());
  const selectedDate = parseDateKey(selected);
  let start = startOfWeek(addDays(today, -21), { weekStartsOn: 1 });
  let end = addDays(today, 70);
  if (selectedDate < start) start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  if (selectedDate > end) end = addDays(selectedDate, 21);
  return eachDayOfInterval({ start, end }).map(toDateKey);
}

function MonthCalendarSheet({
  open,
  selected,
  onClose,
  onSelect,
}: {
  open: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (dateKey: string) => void;
}) {
  const selectedDate = parseDateKey(selected);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(selectedDate));

  useEffect(() => {
    if (open) setVisibleMonth(startOfMonth(parseDateKey(selected)));
  }, [open, selected]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
    const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [visibleMonth]);

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Jump to date"
      subtitle="Pick any day on the calendar"
    >
      <div className="space-y-4 px-1 pb-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-heading text-base font-bold text-[#111827]">
            {format(visibleMonth, "MMMM yyyy")}
          </p>
          <button
            type="button"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={`${d}-${i}`} className="py-1 text-[10px] font-bold uppercase text-[#9CA3AF]">
              {d}
            </span>
          ))}
          {weeks.flatMap((week) =>
            week.map((day) => {
              const key = toDateKey(day);
              const inMonth = isSameMonth(day, visibleMonth);
              const active = isSameDay(day, selectedDate);
              const today = isToday(day);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onSelect(key);
                    onClose();
                  }}
                  className={cn(
                    "font-heading flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                    !inMonth && "text-[#D1D5DB]",
                    inMonth && !active && !today && "text-[#374151] hover:bg-[#F3F4F6]",
                    today && !active && "bg-[#F0FDF4] text-[#16A34A]",
                    active && "bg-[#4F8FF7] text-white shadow-sm"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onSelect(todayKey());
            onClose();
          }}
          className="font-heading w-full rounded-xl border border-[#E5E7EB] bg-white py-3 text-sm font-semibold text-[#14532D] hover:bg-[#F9FAFB]"
        >
          Jump to today
        </button>
      </div>
    </CoachBottomSheet>
  );
}

function MobileDateStrip({
  selected,
  onDateChange,
  onOpenCalendar,
}: {
  selected: string;
  onDateChange: (dateKey: string) => void;
  onOpenCalendar: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dates = useMemo(() => buildScrollDates(selected), [selected]);
  const selectedIsToday = selected === todayKey();
  const monthLabel = format(parseDateKey(selected), "MMM yyyy");

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(`[data-date="${selected}"]`);
    if (!el) return;
    const left = el.offsetLeft - root.clientWidth / 2 + el.clientWidth / 2;
    root.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [selected, dates]);

  return (
    <div className="space-y-2 md:hidden">
      <div className="flex items-center gap-2">
        <p className="font-heading min-w-0 flex-1 truncate text-sm font-bold text-[#111827]">
          {format(parseDateKey(selected), "EEEE, MMM d")}
        </p>
        {!selectedIsToday ? (
          <button
            type="button"
            onClick={() => onDateChange(todayKey())}
            className="font-heading shrink-0 rounded-full bg-[#F0FDF4] px-3 py-1.5 text-xs font-semibold text-[#16A34A]"
          >
            Today
          </button>
        ) : null}
        <button
          type="button"
          onClick={onOpenCalendar}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#374151]"
          aria-label={`Open calendar (${monthLabel})`}
        >
          <CalendarDays className="h-4 w-4 text-[#4F8FF7]" />
          <span>{monthLabel}</span>
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x proximity" }}
      >
        {dates.map((key) => {
          const d = parseDateKey(key);
          const active = key === selected;
          const today = isToday(d);
          return (
            <button
              key={key}
              type="button"
              data-date={key}
              onClick={() => onDateChange(key)}
              style={{ scrollSnapAlign: "center" }}
              className={cn(
                "flex w-12 shrink-0 flex-col items-center justify-center rounded-2xl px-1 py-2 transition-colors",
                active
                  ? "bg-[#4F8FF7] text-white shadow-sm"
                  : today
                    ? "bg-[#F0FDF4] text-[#16A34A]"
                    : "bg-[#F3F4F6] text-[#374151]"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-bold uppercase leading-none",
                  active ? "text-white/80" : today ? "text-[#166534]" : "text-[#9CA3AF]"
                )}
              >
                {format(d, "EEEEE")}
              </span>
              <span className="font-heading mt-1 text-sm font-bold leading-none">{format(d, "d")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DesktopWeekChrome({
  weekDates,
  onPrevWeek,
  onNextWeek,
  onDateChange,
  onOpenCalendar,
}: {
  weekDates: string[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDateChange: (dateKey: string) => void;
  onOpenCalendar: () => void;
}) {
  const start = parseDateKey(weekDates[0]);
  const end = parseDateKey(weekDates[6]);
  const today = todayKey();
  const todayInWeek = weekDates.includes(today);

  const rangeLabel =
    format(start, "MMM") === format(end, "MMM")
      ? `${format(start, "MMM d")} – ${format(end, "d, yyyy")}`
      : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;

  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        type="button"
        onClick={onPrevWeek}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#1D4ED8] hover:bg-[#EFF6FF]"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1 text-center">
        <p className="font-heading text-sm font-bold text-[#111827]">{rangeLabel}</p>
      </div>

      {!todayInWeek ? (
        <button
          type="button"
          onClick={() => onDateChange(today)}
          className="font-heading shrink-0 rounded-full bg-[#F0FDF4] px-3 py-1.5 text-xs font-semibold text-[#16A34A]"
        >
          Today
        </button>
      ) : null}

      <button
        type="button"
        onClick={onOpenCalendar}
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB]"
        aria-label="Open calendar"
      >
        <CalendarDays className="h-4 w-4 text-[#4F8FF7]" />
        Calendar
      </button>

      <button
        type="button"
        onClick={onNextWeek}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#1D4ED8] hover:bg-[#EFF6FF]"
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
}: {
  dateKey: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
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
        "min-h-[40px] lg:min-h-[44px]",
        active ? "bg-[#4F8FF7] text-white shadow-sm" : today ? "bg-[#F0FDF4]" : "bg-[#F9FAFB]"
      )}
    >
      <p
        className={cn(
          "text-[8px] font-bold uppercase leading-none sm:text-[9px]",
          active ? "text-white/80" : today ? "text-[#166534]" : "text-[#6B7280]"
        )}
      >
        {today ? "Today" : format(d, "EEE")}
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
      {label}
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
  const title = `${name} · ${courtFull}`;
  const isClinic = cell.bookedSessionType === "clinic";

  if (compact) {
    return (
      <Link
        href={cell.bookedSessionId ? `/coach/sessions/${cell.bookedSessionId}` : "#"}
        title={title}
        className={cn(
          "flex min-h-[40px] w-full min-w-0 items-stretch overflow-hidden rounded-xl border transition-colors",
          isClinic
            ? "border-[#DDD6FE] bg-[#F5F3FF] active:bg-[#EDE9FE]"
            : "border-[#BBF7D0] bg-[#F0FDF4] active:bg-[#DCFCE7]"
        )}
      >
        <span
          className={cn("w-1 shrink-0", isClinic ? "bg-[#7C3AED]" : "bg-[#16A34A]")}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-1.5">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "font-heading truncate text-sm font-semibold leading-tight",
                isClinic ? "text-[#5B21B6]" : "text-[#14532D]"
              )}
            >
              {name}
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-[#6B7280]">
              {courtFull}
            </p>
          </div>
          <ChevronRight
            className={cn("h-4 w-4 shrink-0", isClinic ? "text-[#C4B5FD]" : "text-[#86EFAC]")}
            strokeWidth={2.25}
            aria-hidden
          />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={cell.bookedSessionId ? `/coach/sessions/${cell.bookedSessionId}` : "#"}
      title={title}
      className={cn(
        slotCellBase,
        "flex-col items-center justify-center gap-0.5 border px-1 py-1 transition-colors sm:py-1.5",
        isClinic
          ? "border-[#DDD6FE] bg-[#F5F3FF] hover:bg-[#EDE9FE]"
          : "border-[#BBF7D0] bg-[#F0FDF4] hover:bg-[#DCFCE7]"
      )}
    >
      <span
        className={cn(
          "line-clamp-1 w-full text-center text-[9px] font-bold leading-tight sm:text-[10px]",
          isClinic ? "text-[#5B21B6]" : "text-[#14532D]"
        )}
      >
        {name}
      </span>
      <span className="line-clamp-1 w-full text-center text-[8px] font-medium leading-tight text-[#6B7280] lg:text-[9px]">
        <span className="lg:hidden">{courtShort(courtLookup, cell.bookedCourtId)}</span>
        <span className="hidden lg:inline">{courtFull}</span>
      </span>
    </Link>
  );
}

function slotGridOptions(
  workingHours: CoachWorkingHours,
  blockedForDate: (date: string) => Array<{ id: string; startMin: number; endMin: number }>,
  date: string,
  labelForSession?: (session: Session) => string | undefined
): SlotGridOptions {
  return {
    availabilityWindows: workingHoursToIntervals(workingHours),
    blockedIntervals: blockedForDate(date).map((s) => ({
      id: s.id,
      startMin: s.startMin,
      endMin: s.endMin,
    })),
    labelForSession,
  };
}

function MobileDaySlots({
  date,
  sessions,
  slotOptions,
  blockMode,
  courtLookup,
  onBookSlot,
  onBlockSlot,
  onUnblockSlot,
}: {
  date: string;
  sessions: Session[];
  slotOptions: SlotGridOptions;
  blockMode: boolean;
  courtLookup: Map<string, Court>;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
  onBlockSlot: (date: string, cell: HourlySlotRow) => void;
  onUnblockSlot: (slotId: string) => void;
}) {
  const rows = useMemo(
    () => getHourlySlotRows(sessions, date, HOURLY_SESSION_MINUTES, slotOptions),
    [sessions, date, slotOptions]
  );

  return (
    <div className="space-y-1 md:hidden">
      {rows.map((cell) => (
        <div key={cell.startValue} className="grid grid-cols-[44px_1fr] items-center gap-2">
          <div className="text-right">
            <span className="font-heading text-[11px] font-bold tabular-nums text-[#6B7280]">
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
  labelForSession,
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
  labelForSession?: (session: Session) => string | undefined;
  onDateChange: (date: string) => void;
  onBookSlot: (date: string, slot: AvailableSlot) => void;
  onBlockSlot: (date: string, cell: HourlySlotRow) => void;
  onUnblockSlot: (slotId: string) => void;
}) {
  const hourRows = useMemo(
    () =>
      getHourlySlotRows([], weekDates[0], HOURLY_SESSION_MINUTES, {
        availabilityWindows: workingHoursToIntervals(workingHours),
      }),
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
          slotGridOptions(workingHours, blockedForDate, dateKey, labelForSession)
        ),
      })),
    [weekDates, sessions, workingHours, blockedForDate, labelForSession]
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

            return (
              <BookedCell key={`${dateKey}-${cell.startValue}`} cell={cell} courtLookup={courtLookup} />
            );
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
  labelForSession,
}: CoachScheduleGridProps) {
  const coachId = usePortalCoachId();
  const { lookup } = useCourts();
  const weekDates = useMemo(() => weekKeys(date), [date]);
  const [blockMode, setBlockMode] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { workingHours, blockSlot, unblockSlot, blockedForDate } = useCoachAvailability(coachId);

  const mobileSlotOptions = useMemo(
    () => slotGridOptions(workingHours, blockedForDate, date, labelForSession),
    [workingHours, blockedForDate, date, labelForSession]
  );

  const shiftWeek = (delta: number) => {
    onDateChange(toDateKey(addWeeks(parseDateKey(date), delta)));
  };

  const handleBlockSlot = (dateKey: string, cell: HourlySlotRow) => {
    blockSlot(dateKey, cell.startMin);
  };

  const handleUnblockSlot = (slotId: string) => {
    unblockSlot(slotId);
  };

  return (
    <div className="space-y-3 md:coach-card md:space-y-4 md:p-4">
      <MobileDateStrip
        selected={date}
        onDateChange={onDateChange}
        onOpenCalendar={() => setCalendarOpen(true)}
      />

      <DesktopWeekChrome
        weekDates={weekDates}
        onPrevWeek={() => shiftWeek(-1)}
        onNextWeek={() => shiftWeek(1)}
        onDateChange={onDateChange}
        onOpenCalendar={() => setCalendarOpen(true)}
      />

      <MobileDaySlots
        date={date}
        sessions={sessions}
        slotOptions={mobileSlotOptions}
        blockMode={blockMode}
        courtLookup={lookup}
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
          labelForSession={labelForSession}
          onDateChange={onDateChange}
          onBookSlot={onBookSlot}
          onBlockSlot={handleBlockSlot}
          onUnblockSlot={handleUnblockSlot}
        />
      </div>

      <div className="mt-1 space-y-2 border-t border-[#E5E7EB] pt-3 md:mt-0 md:flex md:justify-end md:space-y-0 md:border-0 md:pt-0">
        <button
          type="button"
          onClick={() => setBlockMode((v) => !v)}
          aria-pressed={blockMode}
          className={cn(
            "font-heading inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors active:scale-[0.99] md:w-auto md:min-h-[36px] md:rounded-full md:px-3.5 md:py-1.5 md:text-xs",
            blockMode
              ? "bg-[#4F8FF7] text-white shadow-sm"
              : "border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]"
          )}
        >
          <Ban className="h-4 w-4 md:h-3.5 md:w-3.5" strokeWidth={2.25} />
          {blockMode ? "Done blocking" : "Block time"}
        </button>
        {blockMode ? (
          <p className="text-center text-xs text-[#6B7280] md:hidden">
            Tap an open slot to block it. Tap a blocked slot to open it again.
          </p>
        ) : null}
      </div>

      <MonthCalendarSheet
        open={calendarOpen}
        selected={date}
        onClose={() => setCalendarOpen(false)}
        onSelect={onDateChange}
      />
    </div>
  );
}
