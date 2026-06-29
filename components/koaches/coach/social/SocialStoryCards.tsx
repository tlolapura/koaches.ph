"use client";

import { format, parse } from "date-fns";
import type { CoachProfile } from "@/lib/koaches/types";
import type {
  CalendarStoryWeek,
  DailyStoryDay,
} from "@/lib/koaches/social-stories";
import {
  SocialStoryBrandBar,
  SocialStoryFooter,
  SocialStoryHeader,
  SocialStoryLegend,
  SocialStoryPreview,
  SocialStoryStatBadge,
  storySlotCellClass,
  storySlotLabel,
} from "@/components/koaches/coach/social/SocialStoryFrame";
import { socialStoryCoachName } from "@/lib/koaches/person-name";
import { cn } from "@/lib/utils";

type SocialStoryCardProps = {
  coach: CoachProfile;
  profileUrl: string;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  previewWidth?: number;
};

function cellClass(status: CalendarStoryWeek["days"][0]["cells"][0]["status"]) {
  return storySlotCellClass(status === "off" ? undefined : status);
}

export function SocialStoryDailyCard({
  coach,
  date,
  day,
  profileUrl,
  exportRef,
  previewWidth,
}: SocialStoryCardProps & { date: string; day: DailyStoryDay }) {
  const d = parse(date, "yyyy-MM-dd", new Date());
  const dayName = format(d, "EEEE");
  const dateShort = format(d, "MMM d");
  const { rows, openCount, bookedCount } = day;
  const hasSlots = rows.length > 0;

  const coachLabel = socialStoryCoachName(coach);

  return (
    <SocialStoryPreview exportRef={exportRef} previewWidth={previewWidth}>
      <SocialStoryBrandBar />
      <SocialStoryHeader
        coachName={coachLabel}
        eyebrow="Today's schedule"
        photo={coach.photo}
        specialization={coach.specialization}
      />
      <div className="flex flex-1 flex-col px-10 py-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-heading text-[72px] font-bold leading-none text-[#14532D]">{dayName}</p>
            <p className="mt-2 text-[32px] font-semibold text-[#6B7280]">{dateShort}</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <SocialStoryStatBadge
              label="Open"
              value={openCount > 0 ? String(openCount) : "—"}
              className="!px-4 !py-3"
            />
            <SocialStoryStatBadge
              label="Booked"
              value={bookedCount > 0 ? String(bookedCount) : "—"}
              className="!px-4 !py-3"
            />
          </div>
        </div>

        {!hasSlots ? (
          <div className="mt-10 rounded-3xl border-2 border-dashed border-[#D1D5DB] bg-white px-8 py-12 text-center">
            <p className="font-heading text-[36px] font-semibold text-[#14532D]">No sessions today</p>
            <p className="mt-3 text-[28px] leading-relaxed text-[#6B7280]">
              Update your availability in Schedule or pick another day.
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-1 flex-col overflow-hidden rounded-3xl border-2 border-[#E5EFE8] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-[88px_1fr] gap-2">
              {rows.map((row) => (
                <div key={row.timeLabel} className="contents">
                  <div className="flex items-center justify-end pr-2 text-[24px] font-semibold text-[#6B7280]">
                    {row.timeLabel}
                  </div>
                  <div
                    className={cn(
                      "flex min-h-[56px] items-center justify-center rounded-xl px-2 text-center font-bold",
                      storySlotCellClass(row.status)
                    )}
                  >
                    {storySlotLabel(row.status) ? (
                      <span
                        className={cn(
                          "text-[20px] font-bold uppercase tracking-wide",
                          row.status === "open" ? "text-[#166534]" : "text-[#6B7280]"
                        )}
                      >
                        {storySlotLabel(row.status)}
                      </span>
                    ) : row.status === "blocked" ? (
                      <span className="text-[18px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                        Blocked
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
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

  const coachLabel = socialStoryCoachName(coach);

  return (
    <SocialStoryPreview exportRef={exportRef} previewWidth={previewWidth}>
      <SocialStoryBrandBar />
      <SocialStoryHeader
        coachName={coachLabel}
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
                    return (
                      <div
                        key={`${day.date}-${hour.timeLabel}`}
                        className={cn(
                          "flex min-h-[52px] items-center justify-center rounded-xl px-1 text-center font-bold",
                          cellClass(cell?.status ?? "off")
                        )}
                      >
                        {cell?.status === "open" || cell?.status === "booked" ? (
                          <span
                            className={cn(
                              "text-[14px] font-bold uppercase tracking-wide",
                              cell.status === "open" ? "text-[#166534]" : "text-[#6B7280]"
                            )}
                          >
                            {storySlotLabel(cell.status)}
                          </span>
                        ) : cell?.status === "blocked" ? (
                          <span className="text-[12px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                            Blocked
                          </span>
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
