"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  Check,
  ChevronRight,
  Plus,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { parseDisplayTime, sessionStartsAt } from "@/lib/koaches/session-time";
import { formatCurrency, cn } from "@/lib/utils";
import { isCanceledStatus } from "@/lib/koaches/session-status";
import { getSessionDisplayStatus } from "@/lib/koaches/session-lifecycle";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { useProgressCards } from "@/hooks/useProgressCards";
import {
  DashboardEmptyDay,
  DashboardMySessionsToday,
  DashboardUpNextAway,
} from "@/components/koaches/coach/CoachDashboardToday";
import { CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachDashboardSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { coachGreetingLabel } from "@/lib/koaches/person-name";
import { isCollectedSession } from "@/lib/koaches/session-payment";
import type { Session } from "@/lib/koaches/types";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function sortByTime(sessions: Session[]) {
  return [...sessions].sort((a, b) => parseDisplayTime(a.time) - parseDisplayTime(b.time));
}

type AttentionItem = {
  key: string;
  href: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  tone: "coral" | "navy" | "amber";
};

type OverviewRange = "week" | "month";

export function CoachDashboard() {
  const coachId = usePortalCoachId();
  const { coach } = useCoachProfile(coachId);
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLabel = format(today, "EEEE, MMM d");
  const { sessions: allSessions, loading } = useCoachSessions(coachId);
  const { students: rosterStudents, loading: studentsLoading } = useCoachStudents(coachId);
  const { cards, candidates } = useProgressCards(coachId);
  const [overviewRange, setOverviewRange] = useState<OverviewRange>("week");

  const weekInterval = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
    return { start, end };
  }, [todayKey]);
  const monthInterval = useMemo(() => {
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    return { start, end };
  }, [todayKey]);

  const todaySessions = useMemo(
    () =>
      sortByTime(
        allSessions.filter((s) => s.date === todayKey && !isCanceledStatus(s.status))
      ),
    [allSessions, todayKey]
  );

  const todayUpcoming = useMemo(
    () => todaySessions.filter((s) => getSessionDisplayStatus(s, cards) === "upcoming"),
    [todaySessions, cards]
  );

  const todayStats = useMemo(
    () => ({ sessionCount: todaySessions.length }),
    [todaySessions]
  );

  const periodOverview = useMemo(() => {
    const interval = overviewRange === "week" ? weekInterval : monthInterval;
    const inRange = allSessions.filter((s) => {
      if (!s.date || isCanceledStatus(s.status)) return false;
      return isWithinInterval(parseISO(s.date), interval);
    });

    // Money already in the bank: sessions marked done and paid.
    const earned = inRange
      .filter((s) => isCollectedSession(s))
      .reduce((sum, s) => sum + s.price + (s.tip ?? 0), 0);

    // Money on the way: still-upcoming sessions this period.
    const upcoming = inRange.filter(
      (s) => getSessionDisplayStatus(s, cards) === "upcoming"
    );
    const coming = upcoming.reduce((sum, s) => sum + s.price + (s.tip ?? 0), 0);

    return {
      earned,
      sessionCount: inRange.length,
      coming,
    };
  }, [overviewRange, weekInterval, monthInterval, allSessions, cards]);

  const nextSession = useMemo(() => {
    const now = new Date();
    return (
      allSessions
        .filter((s) => s.status === "upcoming" && s.date)
        .map((s) => ({ s, at: sessionStartsAt(s.date!, s.time) }))
        .filter(({ at }) => at.getTime() > now.getTime() - 90 * 60_000)
        .sort((a, b) => a.at.getTime() - b.at.getTime())[0]?.s ?? null
    );
  }, [allSessions]);

  if (!coachId || loading) {
    return <CoachDashboardSkeleton />;
  }

  const greetingName = coach ? coachGreetingLabel(coach) : "Coach";

  const attentionItems: AttentionItem[] = [];
  if (candidates.length > 0) {
    const single = candidates.length === 1 ? candidates[0] : null;
    attentionItems.push({
      key: "progress",
      href: single ? `/coach/students/${single.studentId}` : "/coach/students",
      label: single
        ? `Send ${single.participantName}'s progress card`
        : `${candidates.length} progress cards to send`,
      detail: "Ratings are saved. Tap to send it to your student.",
      icon: TrendingUp,
      tone: "navy",
    });
  }
  const toneStyles = {
    coral: {
      card: "border-[#BBF7D0] bg-gradient-to-br from-[#F0FDF4] to-white",
      icon: "bg-[#16A34A] text-white",
    },
    navy: {
      card: "border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-white",
      icon: "bg-[#4F8FF7] text-white",
    },
    amber: {
      card: "border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] to-white",
      icon: "bg-[#D97706] text-white",
    },
  };

  return (
    <CoachPageShell className="px-0 pb-6 pt-0 md:px-4 md:pt-6">
      {/* Hero */}
      <div className="md:overflow-hidden md:rounded-2xl md:shadow-[0_12px_40px_rgba(22,163,74,0.12)]">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] via-[#1a8f48] to-[#4F8FF7] px-5 pb-5 pt-5 text-white">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#4F8FF7]/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#16A34A]/25 blur-3xl"
            aria-hidden
          />

          <div className="relative">
            <p className="text-sm font-medium text-white/70">{todayLabel}</p>
            <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight sm:text-[1.75rem]">
              {getGreeting()}, {greetingName}
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              {todayStats.sessionCount > 0
                ? `${todayStats.sessionCount} session${todayStats.sessionCount === 1 ? "" : "s"} on your court today`
                : "Your court is clear today"}
            </p>
          </div>
        </section>

        <div className="border-t border-[#E5E7EB] bg-white px-3 pt-2">
          <div className="mb-2 inline-flex rounded-lg bg-[#F3F4F6] p-1">
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                overviewRange === "week"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              )}
              onClick={() => setOverviewRange("week")}
            >
              This week
            </button>
            <button
              type="button"
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                overviewRange === "month"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#6B7280] hover:text-[#111827]"
              )}
              onClick={() => setOverviewRange("month")}
            >
              This month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 bg-white pb-1">
          {[
            { value: formatCurrency(periodOverview.earned), label: "Earned", color: "text-[#16A34A]" },
            { value: String(periodOverview.sessionCount), label: "Sessions", color: "text-[#111827]" },
            { value: formatCurrency(periodOverview.coming), label: "On the way", color: "text-[#4F8FF7]" },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className={cn(
                "relative px-2 py-3.5 text-center",
                idx < 2 &&
                  "after:absolute after:right-0 after:top-1/2 after:h-12 after:w-px after:-translate-y-1/2 after:bg-[#E5E7EB]/80"
              )}
            >
              <p className={cn("font-heading text-lg font-bold leading-none sm:text-xl", stat.color)}>
                {stat.value}
              </p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {!studentsLoading && (rosterStudents.filter((s) => !s.isArchived).length === 0 || allSessions.length === 0) ? (
        <FirstRunChecklist
          hasStudent={rosterStudents.some((s) => !s.isArchived)}
          hasSession={allSessions.length > 0}
        />
      ) : (
        <section className="mt-4 px-4">
          <Link
            href="/coach/sessions?add=1"
            className="coach-btn-primary gap-2 shadow-[0_4px_14px_rgba(22,163,74,0.28)]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Book a session
          </Link>
        </section>
      )}

      {/* Needs attention */}
      {attentionItems.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="font-heading mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Needs attention
          </h2>
          <div className="space-y-2">
            {attentionItems.map((item) => {
              const Icon = item.icon;
              const tone = toneStyles[item.tone];
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-3.5 transition-transform active:scale-[0.99]",
                    tone.card
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
                      tone.icon
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold text-[#111827]">{item.label}</p>
                    <p className="text-xs text-[#6B7280]">{item.detail}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Today */}
      <section className="mt-6 px-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#111827]">Today</h2>
            <p className="text-xs text-[#9CA3AF]">Sessions on your calendar</p>
          </div>
          <Link
            href="/coach/sessions"
            className="shrink-0 text-xs font-semibold text-[#4F8FF7] hover:underline"
          >
            Full schedule
          </Link>
        </div>

        {todaySessions.length === 0 ? (
          <DashboardEmptyDay />
        ) : (
          <DashboardMySessionsToday
            sessions={todaySessions}
            progressCards={cards}
            nextSessionId={
              nextSession?.date === todayKey ? nextSession.id : todayUpcoming[0]?.id
            }
          />
        )}
      </section>

      {nextSession?.date && nextSession.date !== todayKey && (
        <section className="mt-6 px-4">
          <h2 className="font-heading mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Coming up
          </h2>
          <DashboardUpNextAway session={nextSession} />
        </section>
      )}
    </CoachPageShell>
  );
}

function FirstRunChecklist({ hasStudent, hasSession }: { hasStudent: boolean; hasSession: boolean }) {
  const steps = [
    {
      key: "student",
      done: hasStudent,
      href: "/coach/students?add=1",
      icon: UserPlus,
      label: "Add your first student",
      detail: "Just a name is enough to start",
    },
    {
      key: "session",
      done: hasSession,
      href: "/coach/sessions?add=1",
      icon: Plus,
      label: "Book your first session",
      detail: "Pick the student, a date, and a time",
    },
  ];

  return (
    <section className="mt-4 px-4">
      <div className="rounded-2xl border border-[#BBF7D0] bg-gradient-to-br from-[#F0FDF4] to-white p-4">
        <h2 className="font-heading text-sm font-bold text-[#111827]">Let&apos;s get you started</h2>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          Two quick steps and you&apos;re coaching with everything in one place.
        </p>
        <div className="mt-3 space-y-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const content = (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    s.done ? "bg-[#16A34A] text-white" : "bg-white text-[#16A34A] shadow-sm"
                  )}
                >
                  {s.done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "font-heading block text-sm font-semibold",
                      s.done ? "text-[#6B7280] line-through" : "text-[#111827]"
                    )}
                  >
                    {s.label}
                  </span>
                  {!s.done ? <span className="block text-xs text-[#6B7280]">{s.detail}</span> : null}
                </span>
                {!s.done ? <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" /> : null}
              </>
            );

            if (s.done) {
              return (
                <div key={s.key} className="flex items-center gap-3 rounded-xl p-2">
                  {content}
                </div>
              );
            }
            return (
              <Link
                key={s.key}
                href={s.href}
                className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-2 transition-transform active:scale-[0.99]"
              >
                {content}
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[#6B7280]">
          After the session, mark it done and we&apos;ll help you send a progress card.
        </p>
      </div>
    </section>
  );
}
