"use client";

import { format, parse } from "date-fns";
import type { CoachProfile } from "@/lib/koaches/types";
import type {
  CalendarStoryWeek,
  DailyStorySlot,
} from "@/lib/koaches/social-stories";
import {
  SocialStoryBrandBar,
  SocialStoryFooter,
  SocialStoryHeader,
  SocialStoryLegend,
  SocialStoryPreview,
  SocialStorySlotPill,
  SocialStoryStatBadge,
} from "@/components/koaches/coach/social/SocialStoryFrame";
import { cn } from "@/lib/utils";

type SocialStoryCardProps = {
  coach: CoachProfile;
  profileUrl: string;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  previewWidth?: number;
};

function cellClass(status: CalendarStoryWeek["days"][0]["cells"][0]["status"]) {
  if (status === "open") return "bg-[#EFF6FF] ring-2 ring-[#4F8FF7]";
  if (status === "booked") return "bg-[#EDF2F7] ring-1 ring-[#D1D5DB]";
  if (status === "blocked") return "bg-[#E5E7EB] ring-1 ring-[#9CA3AF]";
  return "bg-transparent";
}

export function SocialStoryDailyCard({
  coach,
  date,
  slots,
  profileUrl,
  exportRef,
  previewWidth,
}: SocialStoryCardProps & { date: string; slots: DailyStorySlot[] }) {
  const d = parse(date, "yyyy-MM-dd", new Date());
  const dayName = format(d, "EEEE");
  const dateShort = format(d, "MMM d");

  return (
    <SocialStoryPreview exportRef={exportRef} previewWidth={previewWidth}>
      <SocialStoryBrandBar />
      <SocialStoryHeader
        coachName={coach.name}
        eyebrow="Open slots today"
        photo={coach.photo}
        specialization={coach.specialization}
      />
      <div className="flex flex-1 flex-col px-10 py-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-heading text-[72px] font-bold leading-none text-[#14532D]">{dayName}</p>
            <p className="mt-2 text-[32px] font-semibold text-[#6B7280]">{dateShort}</p>
          </div>
          <SocialStoryStatBadge
            label="Open"
            value={slots.length > 0 ? String(slots.length) : "—"}
            className="shrink-0"
          />
        </div>

        {slots.length === 0 ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-[#D1D5DB] bg-white px-8 py-12 text-center">
            <p className="font-heading text-[36px] font-semibold text-[#14532D]">Fully booked</p>
            <p className="mt-3 text-[28px] leading-relaxed text-[#6B7280]">
              Message me to join the waitlist or grab another day.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-3 gap-4">
            {slots.map((slot) => (
              <SocialStorySlotPill key={slot.timeLabel} label={slot.timeLabel} />
            ))}
          </div>
        )}

        <p className="mt-auto pt-8 text-[26px] leading-relaxed text-[#6B7280]">
          Hourly drop-in sessions · tap the link below to book your spot.
        </p>
      </div>
      <SocialStoryFooter url={profileUrl} />
    </SocialStoryPreview>
  );
}

export function SocialStoryCalendarCard({
  coach,
  week,
  profileUrl,
  exportRef,
  previewWidth,
}: SocialStoryCardProps & { week: CalendarStoryWeek }) {
  const hasGrid = week.hours.length > 0;

  return (
    <SocialStoryPreview exportRef={exportRef} previewWidth={previewWidth}>
      <SocialStoryBrandBar />
      <SocialStoryHeader
        coachName={coach.name}
        eyebrow="Week at a glance"
        photo={coach.photo}
        specialization={coach.specialization}
      />
      <div className="flex flex-1 flex-col px-10 py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-heading text-[40px] font-bold text-[#14532D]">{week.weekLabel}</p>
            <p className="mt-1 text-[24px] font-medium text-[#6B7280]">Mon – Sun schedule</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <SocialStoryStatBadge label="Booked" value={String(week.bookedCount)} className="!px-4 !py-3" />
            <SocialStoryStatBadge label="Open" value={String(week.openCount)} className="!px-4 !py-3" />
          </div>
        </div>

        {!hasGrid ? (
          <div className="flex flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-[#D1D5DB] bg-white px-8 py-12 text-center">
            <p className="text-[28px] leading-relaxed text-[#6B7280]">
              No hours set this week — update your availability in Schedule.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border-2 border-[#E5EFE8] bg-white p-4 shadow-sm">
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `56px repeat(${week.days.length}, minmax(0, 1fr))`,
              }}
            >
              <div />
              {week.days.map((day) => (
                <div key={day.date} className="text-center">
                  <p className="text-[20px] font-bold uppercase text-[#6B7280]">{day.dayLabel}</p>
                  <p className="font-heading text-[28px] font-bold text-[#14532D]">{day.dateNum}</p>
                </div>
              ))}

              {week.hours.map((hour, rowIndex) => (
                <div key={hour.timeLabel} className="contents">
                  <div className="flex items-center justify-end pr-2 text-[20px] font-semibold text-[#6B7280]">
                    {hour.timeLabel}
                  </div>
                  {week.days.map((day) => {
                    const cell = day.cells[rowIndex];
                    const initial =
                      cell?.bookedLabel?.trim().split(/\s+/)[0]?.[0]?.toUpperCase() ?? "";
                    return (
                      <div
                        key={`${day.date}-${hour.timeLabel}`}
                        className={cn(
                          "flex min-h-[52px] items-center justify-center rounded-xl text-[18px] font-bold",
                          cellClass(cell?.status ?? "off")
                        )}
                      >
                        {cell?.status === "booked" && initial ? (
                          <span className="text-[#374151]">{initial}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <SocialStoryLegend />
        </div>
      </div>
      <SocialStoryFooter url={profileUrl} />
    </SocialStoryPreview>
  );
}
