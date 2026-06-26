"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import {
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { pendingIntakeCountAction } from "@/lib/koaches/actions/intake";
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

const quickActions = [
  { href: "/coach/sessions", label: "Schedule", icon: CalendarDays },
  { href: "/coach/students", label: "Students", icon: Users },
  { href: "/coach/programs", label: "Programs", icon: FileText },
] as const;

type AttentionItem = {
  key: string;
  href: string;
  label: string;
  detail: string;
  icon: LucideIcon;
  tone: "coral" | "navy" | "amber";
};

export function CoachDashboard() {
  const coachId = usePortalCoachId();
  const { coach, loading: profileLoading } = useCoachProfile(coachId);
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLabel = format(today, "EEEE, MMM d");
  const { sessions: allSessions, loading } = useCoachSessions(coachId);
  const { cards, candidates } = useProgressCards(coachId);
  const [pendingSignups, setPendingSignups] = useState(0);

  useEffect(() => {
    const refresh = () => {
      void pendingIntakeCountAction(coachId).then(setPendingSignups);
    };
    refresh();
    window.addEventListener("koaches-intake-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("koaches-intake-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [coachId]);

  const weekInterval = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = endOfWeek(today, { weekStartsOn: 1 });
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

  const todayStats = useMemo(() => {
    const upcoming = todayUpcoming;
    const unpaid = upcoming.filter((s) => !isCollectedSession(s)).length;
    const booked = upcoming.reduce((sum, s) => sum + s.price, 0);
    const weekSessions = allSessions.filter((s) => {
      if (!s.date || isCanceledStatus(s.status)) return false;
      return isWithinInterval(parseISO(s.date), weekInterval);
    }).length;

    return {
      sessionCount: todaySessions.length,
      upcomingCount: upcoming.length,
      unpaid,
      booked,
      weekSessions,
    };
  }, [todaySessions, todayUpcoming, allSessions, weekInterval]);

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

  const firstName = coach?.name.replace(/^Coach\s+/i, "") ?? "Coach";

  const attentionItems: AttentionItem[] = [];
  if (pendingSignups > 0) {
    attentionItems.push({
      key: "intake",
      href: "/coach/students",
      label: `${pendingSignups} new sign-up${pendingSignups === 1 ? "" : "s"}`,
      detail: "Review intake forms",
      icon: UserPlus,
      tone: "coral",
    });
  }
  if (candidates.length > 0) {
    attentionItems.push({
      key: "progress",
      href: "/coach/progress",
      label: `${candidates.length} progress card${candidates.length === 1 ? "" : "s"}`,
      detail: "Ready to share with students",
      icon: TrendingUp,
      tone: "navy",
    });
  }
  if (todayStats.unpaid > 0) {
    attentionItems.push({
      key: "unpaid",
      href: "/coach/sessions?view=list",
      label: `${todayStats.unpaid} unpaid today`,
      detail: "Mark payment when collected",
      icon: Wallet,
      tone: "amber",
    });
  }

  const toneStyles = {
    coral: {
      card: "border-[#F4C4B8] bg-gradient-to-br from-[#FDEEE9] to-white",
      icon: "bg-[#E07A5F] text-white",
    },
    navy: {
      card: "border-[#C5D4E8] bg-gradient-to-br from-[#EDF2F7] to-white",
      icon: "bg-[#1E3A5F] text-white",
    },
    amber: {
      card: "border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] to-white",
      icon: "bg-[#D97706] text-white",
    },
  };

  if (loading || profileLoading || !coach) return <CoachDashboardSkeleton />;

  return (
    <CoachPageShell className="px-0 pb-6 pt-0 md:px-4 md:pt-6">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#264a73] to-[#1a3352] px-5 pb-6 pt-5 text-white md:mx-0 md:rounded-2xl md:shadow-[0_12px_40px_rgba(30,58,95,0.22)]">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#E07A5F]/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#6B9E78]/25 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <p className="text-sm font-medium text-white/70">{todayLabel}</p>
          <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight sm:text-[1.75rem]">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            {todayStats.sessionCount > 0
              ? `${todayStats.sessionCount} session${todayStats.sessionCount === 1 ? "" : "s"} on your court today`
              : "Your court is clear today"}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { value: String(todayStats.upcomingCount), label: "Upcoming" },
              { value: formatCurrency(todayStats.booked), label: "Expected" },
              { value: String(todayStats.weekSessions), label: "This week" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/10 bg-white/10 px-2 py-2.5 text-center backdrop-blur-sm"
              >
                <p className="font-heading text-base font-bold leading-none sm:text-lg">{stat.value}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/55">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mt-4 px-4">
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="coach-card flex flex-col items-center gap-1.5 px-2 py-3.5 text-center transition-transform active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDEEE9]">
                  <Icon className="h-4 w-4 text-[#E07A5F]" strokeWidth={2.25} />
                </span>
                <span className="font-heading text-[11px] font-semibold text-[#374151]">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
        <Link
          href="/coach/sessions"
          className="coach-btn-primary mt-3 gap-2 shadow-[0_4px_14px_rgba(224,122,95,0.28)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Book a session
        </Link>
      </section>

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
            className="shrink-0 text-xs font-semibold text-[#E07A5F] hover:underline"
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
