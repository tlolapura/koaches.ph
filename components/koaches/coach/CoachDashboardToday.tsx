"use client";

import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Sun,
  TrendingUp,
} from "lucide-react";
import type { Court, ProgressCard, Session } from "@/lib/koaches/types";
import { courtNameFromLookup, useCourts } from "@/hooks/useCourts";
import { formatSessionParticipantNames } from "@/lib/koaches/session-participants";
import {
  formatRelativeSessionStart,
  formatSessionDuration,
  formatSessionTimeRange,
  parseDisplayTime,
  splitDisplayTime,
} from "@/lib/koaches/session-time";
import { useSessionPayment } from "@/hooks/useSessionPayment";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { getSessionDisplayStatus } from "@/lib/koaches/session-lifecycle";
import { cn, formatDisplayDate } from "@/lib/utils";

function sortByTime(sessions: Session[]) {
  return [...sessions].sort((a, b) => parseDisplayTime(a.time) - parseDisplayTime(b.time));
}

function shortCourt(lookup: Map<string, Court>, courtId: string) {
  const name = courtNameFromLookup(lookup, courtId);
  return name.replace(/\s+Pickleball\b.*$/i, "").trim() || name;
}

type TodayBucket = "wrapUp" | "later" | "finished";

function bucketSession(session: Session, cards: ProgressCard[]): TodayBucket {
  const display = getSessionDisplayStatus(session, cards);
  if (display !== "upcoming") return "finished";
  if (!session.date) return "later";
  const rel = formatRelativeSessionStart(session.date, session.time);
  if (rel === "Ended" || rel === "In progress") return "wrapUp";
  return "later";
}

function upcomingTimingLabel(session: Session): string | null {
  if (!session.date) return null;
  const rel = formatRelativeSessionStart(session.date, session.time);
  if (rel === "Ended" || rel === "In progress") return null;
  return rel;
}

function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "navy" | "amber" | "coral" | "sage";
}) {
  const tones = {
    neutral: "bg-[#F3F4F6] text-[#6B7280]",
    navy: "bg-[#1E3A5F] text-white",
    amber: "bg-[#FEF3C7] text-[#92400E]",
    coral: "bg-[#FDEEE9] text-[#8B4D3A]",
    sage: "bg-[#E5EFE8] text-[#3D5C47]",
  };
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-[10px] font-semibold leading-none",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function TimeColumn({
  time,
  muted = false,
}: {
  time: string;
  muted?: boolean;
}) {
  const { clock, period } = splitDisplayTime(time);
  return (
    <div className="w-[3.25rem] shrink-0 text-center">
      <p
        className={cn(
          "font-heading text-[15px] font-bold tabular-nums leading-none",
          muted ? "text-[#9CA3AF]" : "text-[#1E3A5F]"
        )}
      >
        {clock}
      </p>
      {period && (
        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9CA3AF]">
          {period}
        </p>
      )}
    </div>
  );
}

function SessionTags({ session }: { session: Session }) {
  const { paymentStatus } = useSessionPayment(session);
  const isProgram = session.type === "program";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Tag tone={isProgram ? "navy" : "amber"}>{isProgram ? "Program" : "Drop-in"}</Tag>
      {paymentStatus !== "paid" && <Tag tone="amber">Unpaid</Tag>}
      {paymentStatus === "paid" && <Tag tone="sage">Paid</Tag>}
    </div>
  );
}

function ProgressAction({ session }: { session: Session }) {
  const { displayStatus } = useSessionStatus(session);

  if (displayStatus === "pending_progress_review") {
    return (
      <Link
        href={`/coach/sessions/${session.id}`}
        className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#E07A5F] px-4 text-xs font-semibold text-white active:bg-[#C96A52]"
      >
        <ClipboardList className="h-3.5 w-3.5" aria-hidden />
        Add progress report
      </Link>
    );
  }

  if (displayStatus === "ready_to_share") {
    return (
      <Link
        href="/coach/progress"
        className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl bg-[#1E3A5F] px-4 text-xs font-semibold text-white active:bg-[#2D4A6F]"
      >
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        Create progress card
      </Link>
    );
  }

  return null;
}

type SessionRowProps = {
  session: Session;
  href: string;
  courtLookup: Map<string, Court>;
  muted?: boolean;
  timing?: string | null;
  highlight?: boolean;
  footer?: React.ReactNode;
};

function SessionRow({
  session,
  href,
  courtLookup,
  muted,
  timing,
  highlight,
  footer,
}: SessionRowProps) {
  const duration = formatSessionDuration(session.time, session.endTime);
  const subtitle = [shortCourt(courtLookup, session.courtId), duration].filter(Boolean).join(" · ");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-[0_2px_12px_rgba(30,58,95,0.06)]",
        highlight
          ? "border-[#E07A5F]/50 ring-2 ring-[#E07A5F]/15"
          : "border-[#E5E7EB]"
      )}
    >
      <Link href={href} className="flex items-center gap-3 px-3 py-3 active:bg-[#FAFAF8]">
        <TimeColumn time={session.time} muted={muted} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "font-heading truncate text-[15px] font-semibold",
                muted ? "text-[#6B7280]" : "text-[#111827]"
              )}
            >
              {formatSessionParticipantNames(session)}
            </p>
            {timing && (
              <Tag tone={highlight ? "coral" : "sage"}>{timing}</Tag>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">{subtitle}</p>
          <div className="mt-2">
            <SessionTags session={session} />
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" aria-hidden />
      </Link>
      {footer ? <div className="border-t border-[#F3F4F6] px-3 py-2.5">{footer}</div> : null}
    </div>
  );
}

function FinishedRow({
  session,
  courtLookup,
}: {
  session: Session;
  courtLookup: Map<string, Court>;
}) {
  const duration = formatSessionDuration(session.time, session.endTime);
  const subtitle = [shortCourt(courtLookup, session.courtId), duration].filter(Boolean).join(" · ");
  const action = <ProgressAction session={session} />;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(30,58,95,0.06)]">
      <div className="flex items-center gap-3 px-3 py-3">
        <TimeColumn time={session.time} muted />
        <div className="min-w-0 flex-1">
          <p className="font-heading truncate text-[15px] font-semibold text-[#374151]">
            {formatSessionParticipantNames(session)}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">{subtitle}</p>
          <div className="mt-2">
            <SessionTags session={session} />
          </div>
        </div>
      </div>
      {action ? (
        <div className="border-t border-[#F3F4F6] px-3 py-2.5">{action}</div>
      ) : (
        <Link
          href={`/coach/sessions/${session.id}`}
          className="flex min-h-[36px] items-center justify-center gap-1 border-t border-[#F3F4F6] text-xs font-medium text-[#6B7280] active:bg-[#FAFAF8]"
        >
          View session
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
      <span className="h-1 w-1 rounded-full bg-[#E07A5F]" aria-hidden />
      {children}
    </p>
  );
}

type DashboardMySessionsTodayProps = {
  sessions: Session[];
  progressCards: ProgressCard[];
  nextSessionId?: string | null;
};

export function DashboardMySessionsToday({
  sessions,
  progressCards,
  nextSessionId,
}: DashboardMySessionsTodayProps) {
  const { lookup } = useCourts();
  const sorted = sortByTime(sessions);
  const wrapUp = sorted.filter((s) => bucketSession(s, progressCards) === "wrapUp");
  const later = sorted.filter((s) => bucketSession(s, progressCards) === "later");
  const finished = sorted.filter((s) => bucketSession(s, progressCards) === "finished");

  if (sorted.length === 0) {
    return <DashboardEmptyDay />;
  }

  const nextLaterId =
    nextSessionId && later.some((s) => s.id === nextSessionId)
      ? nextSessionId
      : later[0]?.id;

  return (
    <div className="space-y-4">
      {wrapUp.length > 0 && (
        <div>
          <SectionLabel>Wrap up</SectionLabel>
          <div className="space-y-2">
            {wrapUp.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                href={`/coach/sessions/${s.id}`}
                courtLookup={lookup}
                footer={
                  <Link
                    href={`/coach/sessions/${s.id}`}
                    className="flex min-h-[40px] w-full items-center justify-center gap-1.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 text-xs font-semibold text-[#92400E] active:bg-[#FEF3C7]"
                  >
                    Mark session done
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                }
              />
            ))}
          </div>
        </div>
      )}

      {later.length > 0 && (
        <div>
          {wrapUp.length > 0 && <SectionLabel>Coming up</SectionLabel>}
          <div className="space-y-2">
            {later.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                href={`/coach/sessions/${s.id}`}
                courtLookup={lookup}
                highlight={s.id === nextLaterId}
                timing={upcomingTimingLabel(s)}
              />
            ))}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div>
          <SectionLabel>Finished</SectionLabel>
          <div className="space-y-2">
            {finished.map((s) => (
              <FinishedRow key={s.id} session={s} courtLookup={lookup} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardEmptyDay() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-10 text-center shadow-[0_2px_12px_rgba(30,58,95,0.04)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FDEEE9] to-[#E5EFE8]">
        <Sun className="h-7 w-7 text-[#E07A5F]" aria-hidden />
      </div>
      <p className="font-heading mt-4 text-lg font-semibold text-[#1E3A5F]">No sessions today</p>
      <p className="mt-1 text-sm text-[#6B7280]">Book a session or enjoy the day off.</p>
      <Link href="/coach/sessions" className="coach-btn-primary mx-auto mt-5 max-w-xs gap-2">
        <CalendarDays className="h-4 w-4" aria-hidden />
        Open schedule
      </Link>
    </div>
  );
}

type DashboardUpNextAwayProps = {
  session: Session;
};

export function DashboardUpNextAway({ session }: DashboardUpNextAwayProps) {
  const timing = session.date ? formatRelativeSessionStart(session.date, session.time) : null;
  const duration = formatSessionDuration(session.time, session.endTime);

  return (
    <Link
      href={`/coach/sessions/${session.id}`}
      className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-3.5 py-3.5 shadow-[0_2px_12px_rgba(30,58,95,0.06)] transition-transform active:scale-[0.99]"
    >
      <TimeColumn time={session.time} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <CircleDot className="h-3.5 w-3.5 shrink-0 text-[#E07A5F]" aria-hidden />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Next
          </span>
          {timing && timing !== "Ended" && (
            <Tag tone="coral">{timing}</Tag>
          )}
        </div>
        <p className="font-heading mt-1 truncate text-[15px] font-semibold text-[#111827]">
          {formatSessionParticipantNames(session)}
        </p>
        <p className="mt-0.5 truncate text-xs text-[#9CA3AF]">
          {session.date ? formatDisplayDate(session.date) : "Date TBD"} · {formatSessionTimeRange(session.time, session.endTime)}
          {duration ? ` · ${duration}` : ""}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" aria-hidden />
    </Link>
  );
}
