"use client";

import Link from "next/link";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleCheck,
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
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import {
  getSessionDisplayStatus,
  type SessionDisplayStatus,
} from "@/lib/koaches/session-lifecycle";
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
    navy: "bg-[#4F8FF7] text-white",
    amber: "bg-[#FEF3C7] text-[#92400E]",
    coral: "bg-[#F0FDF4] text-[#166534]",
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
          muted ? "text-[#9CA3AF]" : "text-[#4F8FF7]"
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

function ProgressActionLink({
  session,
  displayStatus,
  compact,
}: {
  session: Session;
  displayStatus: SessionDisplayStatus;
  compact?: boolean;
}) {
  const studentId =
    session.studentId ?? session.participants.find((p) => p.studentId)?.studentId;

  if (displayStatus === "pending_progress_review") {
    return (
      <Link
        href={`/coach/sessions/${session.id}`}
        className={cn(
          "inline-flex items-center gap-1 font-semibold text-[#166534]",
          compact
            ? "shrink-0 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[10px] active:bg-[#DCFCE7]"
            : "min-h-[40px] w-full justify-center gap-1.5 rounded-xl bg-[#16A34A] px-4 text-xs text-white active:bg-[#15803D]"
        )}
      >
        <ClipboardList className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
        {compact ? "Rate" : "Add progress report"}
      </Link>
    );
  }

  if (displayStatus === "ready_to_share") {
    const href = studentId
      ? `/coach/students/${studentId}`
      : `/coach/sessions/${session.id}`;
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 font-semibold text-[#166534]",
          compact
            ? "shrink-0 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[10px] active:bg-[#DCFCE7]"
            : "min-h-[40px] w-full justify-center gap-1.5 rounded-xl bg-[#14532D] px-4 text-xs text-white active:bg-[#166534]"
        )}
      >
        <TrendingUp className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
        {compact ? "Share" : "Share progress card"}
      </Link>
    );
  }

  return null;
}

function DashboardMarkDoneButton({ session }: { session: Session }) {
  const { markDone } = useSessionStatus(session);
  const { showToast } = useCoachToast();
  const [busy, setBusy] = useState(false);

  return (
    <CoachButton
      type="button"
      variant="outline"
      className="min-h-[40px] w-full border-[#FDE68A] bg-[#FFFBEB] px-4 text-xs font-semibold text-[#92400E] hover:bg-[#FEF3C7] active:bg-[#FEF3C7]"
      loading={busy}
      loadingLabel="Saving…"
      onClick={async () => {
        setBusy(true);
        try {
          await markDone();
          showToast("Session marked done");
        } catch (e) {
          showToast(e instanceof Error ? e.message : "Could not update session", "error");
        } finally {
          setBusy(false);
        }
      }}
    >
      Mark session done
    </CoachButton>
  );
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
          ? "border-[#16A34A]/50 ring-2 ring-[#16A34A]/15"
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

function FinishedSection({
  sessions,
  progressCards,
  courtLookup,
}: {
  sessions: Session[];
  progressCards: ProgressCard[];
  courtLookup: Map<string, Court>;
}) {
  type FinishedMeta = {
    session: Session;
    display: SessionDisplayStatus;
    studentId?: string;
    name: string;
  };

  const items: FinishedMeta[] = sessions.map((session) => ({
    session,
    display: getSessionDisplayStatus(session, progressCards),
    studentId:
      session.studentId ?? session.participants.find((p) => p.studentId)?.studentId,
    name: formatSessionParticipantNames(session),
  }));

  const shareGroups = new Map<string, FinishedMeta[]>();
  for (const item of items) {
    if (item.display !== "ready_to_share" || !item.studentId) continue;
    const list = shareGroups.get(item.studentId) ?? [];
    list.push(item);
    shareGroups.set(item.studentId, list);
  }

  const groupedStudentIds = new Set(
    [...shareGroups.entries()].filter(([, list]) => list.length > 1).map(([id]) => id)
  );

  const groupedFooters: { studentId: string; name: string; href: string }[] = [];
  for (const [studentId, list] of shareGroups) {
    if (list.length > 1) {
      groupedFooters.push({
        studentId,
        name: list[0].name,
        href: `/coach/students/${studentId}`,
      });
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(30,58,95,0.05)]">
      <div className="divide-y divide-[#F3F4F6]">
        {items.map(({ session, display, studentId, name }) => {
          const duration = formatSessionDuration(session.time, session.endTime);
          const subtitle = [shortCourt(courtLookup, session.courtId), duration]
            .filter(Boolean)
            .join(" · ");
          const hideInlineShare =
            display === "ready_to_share" &&
            studentId != null &&
            groupedStudentIds.has(studentId);

          return (
            <div key={session.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <TimeColumn time={session.time} muted />
              <Link
                href={`/coach/sessions/${session.id}`}
                className="min-w-0 flex-1 active:opacity-80"
              >
                <p className="font-heading truncate text-sm font-semibold text-[#374151]">
                  {name}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">{subtitle}</p>
                <div className="mt-1.5">
                  <SessionTags session={session} />
                </div>
              </Link>
              {!hideInlineShare && display !== "done" && display !== "canceled" && (
                <ProgressActionLink session={session} displayStatus={display} compact />
              )}
              {(display === "done" || display === "canceled" || hideInlineShare) && (
                <Link
                  href={`/coach/sessions/${session.id}`}
                  className="shrink-0 text-[#D1D5DB] active:text-[#9CA3AF]"
                  aria-label={`Open ${name}`}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {groupedFooters.map(({ studentId, name, href }) => (
        <Link
          key={studentId}
          href={href}
          className="flex min-h-[44px] items-center justify-between gap-3 border-t border-[#E5E7EB] bg-gradient-to-r from-[#F0FDF4] to-[#FAFAF8] px-4 py-3 active:bg-[#ECFDF5]"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#16A34A]/10">
              <TrendingUp className="h-4 w-4 text-[#166534]" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-heading truncate text-sm font-semibold text-[#14532D]">
                Share progress card
              </p>
              <p className="truncate text-[11px] text-[#6B7280]">For {name}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#16A34A]" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" aria-hidden />
      {children}
      {count != null && count > 0 && (
        <span className="rounded-full bg-[#F3F4F6] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#6B7280]">
          {count}
        </span>
      )}
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
                footer={<DashboardMarkDoneButton session={s} />}
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
          <SectionLabel count={finished.length}>Finished</SectionLabel>
          <FinishedSection
            sessions={finished}
            progressCards={progressCards}
            courtLookup={lookup}
          />
        </div>
      )}
    </div>
  );
}

export function DashboardEmptyDay() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-5 py-10 text-center shadow-[0_2px_12px_rgba(30,58,95,0.04)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#E5EFE8]">
        <Sun className="h-7 w-7 text-[#4F8FF7]" aria-hidden />
      </div>
      <p className="font-heading mt-4 text-lg font-semibold text-[#14532D]">No sessions today</p>
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
          <CircleDot className="h-3.5 w-3.5 shrink-0 text-[#4F8FF7]" aria-hidden />
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
