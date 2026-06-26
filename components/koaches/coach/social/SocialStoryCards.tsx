"use client";

import { format, parse } from "date-fns";
import type { CoachProfile } from "@/lib/koaches/types";
import type { DailyStorySlot, ProgramStoryItem, WeeklyStoryDay } from "@/lib/koaches/social-stories";
import {
  SocialStoryFooter,
  SocialStoryHeader,
  SocialStoryPreview,
  SocialStorySlotPill,
  SocialStoryStatBadge,
} from "@/components/koaches/coach/social/SocialStoryFrame";

type SocialStoryCardProps = {
  coach: CoachProfile;
  bookUrl: string;
  exportRef?: React.RefObject<HTMLDivElement | null>;
};

export function SocialStoryDailyCard({
  coach,
  date,
  slots,
  bookUrl,
  exportRef,
}: SocialStoryCardProps & { date: string; slots: DailyStorySlot[] }) {
  const d = parse(date, "yyyy-MM-dd", new Date());
  const dayName = format(d, "EEEE");
  const dateShort = format(d, "MMM d");

  return (
    <SocialStoryPreview exportRef={exportRef}>
      <SocialStoryHeader
        coachName={coach.name}
        eyebrow="Open slots today"
        photo={coach.photo}
        specialization={coach.specialization}
      />
      <div className="flex flex-1 flex-col px-6 py-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-3xl font-bold leading-none">{dayName}</p>
            <p className="mt-1 text-sm font-medium text-white/70">{dateShort}</p>
          </div>
          <SocialStoryStatBadge
            label="Open"
            value={slots.length > 0 ? String(slots.length) : "—"}
            className="shrink-0"
          />
        </div>

        {slots.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center">
            <p className="font-heading text-base font-semibold text-white/90">Fully booked</p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Message me to join the waitlist or grab another day.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <SocialStorySlotPill key={slot.timeLabel} label={slot.timeLabel} />
            ))}
          </div>
        )}

        <p className="mt-auto pt-6 text-xs leading-relaxed text-white/55">
          Hourly drop-in sessions · tap the link below to book your spot.
        </p>
      </div>
      <SocialStoryFooter cta="Book a session" url={bookUrl} />
    </SocialStoryPreview>
  );
}

export function SocialStoryWeeklyCard({
  coach,
  days,
  bookUrl,
  exportRef,
}: SocialStoryCardProps & { days: WeeklyStoryDay[] }) {
  const openDays = days.filter((d) => d.openSlots.length > 0);
  const totalSlots = openDays.reduce((sum, day) => sum + day.openSlots.length, 0);

  return (
    <SocialStoryPreview exportRef={exportRef}>
      <SocialStoryHeader
        coachName={coach.name}
        eyebrow="This week's openings"
        photo={coach.photo}
        specialization={coach.specialization}
      />
      <div className="flex flex-1 flex-col px-6 py-4">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <SocialStoryStatBadge label="Open days" value={String(openDays.length)} />
          <SocialStoryStatBadge label="Total slots" value={String(totalSlots)} />
        </div>

        {openDays.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-center">
            <p className="text-sm leading-relaxed text-white/65">
              No open slots this week — DM me to plan ahead.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2 overflow-hidden">
            {openDays.map((day) => (
              <div
                key={day.date}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-heading text-sm font-bold">{day.dayLabel}</p>
                  <p className="text-[10px] text-white/55">{day.dateLabel}</p>
                </div>
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-[#FDE047]">
                  {day.openSlots.map((s) => s.timeLabel).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <SocialStoryFooter cta="Grab a slot" url={bookUrl} />
    </SocialStoryPreview>
  );
}

export function SocialStoryProgramsCard({
  coach,
  programs,
  bookUrl,
  exportRef,
}: SocialStoryCardProps & { programs: ProgramStoryItem[] }) {
  return (
    <SocialStoryPreview exportRef={exportRef}>
      <SocialStoryHeader
        coachName={coach.name}
        eyebrow="Coaching programs"
        photo={coach.photo}
        specialization={coach.specialization}
      />
      <div className="flex flex-1 flex-col px-6 py-4">
        {programs.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-center">
            <p className="text-sm leading-relaxed text-white/65">
              Programs coming soon — DM for private coaching.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
            {programs.slice(0, 4).map((program, index) => (
              <div
                key={program.name}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm"
              >
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#E07A5F]/30 text-[10px] font-bold text-[#FDE047]">
                  {index + 1}
                </span>
                <p className="pr-8 font-heading text-sm font-bold leading-tight">{program.name}</p>
                <p className="mt-1.5 text-xs font-semibold text-[#E07A5F]">{program.summary}</p>
                {program.targetLevel ? (
                  <p className="mt-1 text-[10px] text-white/55">{program.targetLevel}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
      <SocialStoryFooter cta="Join a program" url={bookUrl} />
    </SocialStoryPreview>
  );
}
