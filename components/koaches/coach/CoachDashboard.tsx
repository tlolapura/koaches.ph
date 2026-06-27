"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import {
  ChevronRight,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
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
import { CoachBillingAlertBanner } from "@/components/koaches/coach/CoachBillingAlertBanner";
import { CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachDashboardSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { coachGreetingLabel } from "@/lib/koaches/person-name";
import { isCollectedSession } from "@/lib/koaches/session-payment";
import { shouldShowCoachOnboarding } from "@/lib/koaches/coach-onboarding";
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

export function CoachDashboard() {
  const router = useRouter();
  const coachId = usePortalCoachId();
  const { coach } = useCoachProfile(coachId);
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLabel = format(today, "EEEE, MMM d");
  const { sessions: allSessions, loading } = useCoachSessions(coachId);
  const { cards, candidates } = useProgressCards(coachId);
  useEffect(() => {
    if (coach && shouldShowCoachOnboarding(coach)) {
      router.replace("/coach/onboarding");
    }
  }, [coach, router]);

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

  if (!coachId) {
    return <CoachDashboardSkeleton />;
  }

  const greetingName = coach ? coachGreetingLabel(coach) : "Coach";
  const sessionsLoading = loading && allSessions.length === 0;

  const attentionItems: AttentionItem[] = [];
  if (candidates.length > 0) {
    attentionItems.push({
      key: "progress",
      href: "/coach/students",
      label: `${candidates.length} progress card${candidates.length === 1 ? "" : "s"}`,
      detail: "Ready to share — open a student profile",
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

        <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] border-t border-[#E5E7EB] bg-white">
          {[
            { value: String(todayStats.upcomingCount), label: "Upcoming", color: "text-[#16A34A]" },
            { value: formatCurrency(todayStats.booked), label: "Expected", color: "text-[#4F8FF7]" },
            { value: String(todayStats.weekSessions), label: "This week", color: "text-[#111827]" },
          ].map((stat) => (
            <div key={stat.label} className="px-2 py-3.5 text-center">
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

      {coach ? <CoachBillingAlertBanner coach={coach} className="mt-4" /> : null}

      <section className="mt-4 px-4">
        <Link
          href="/coach/sessions"
          className="coach-btn-primary gap-2 shadow-[0_4px_14px_rgba(22,163,74,0.28)]"
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
            className="shrink-0 text-xs font-semibold text-[#4F8FF7] hover:underline"
          >
            Full schedule
          </Link>
        </div>

        {sessionsLoading ? (
          <div className="coach-card animate-pulse p-8" aria-hidden>
            <div className="h-4 w-32 rounded bg-[#E5E7EB]" />
            <div className="mt-3 h-16 rounded-xl bg-[#E5E7EB]/80" />
          </div>
        ) : todaySessions.length === 0 ? (
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
