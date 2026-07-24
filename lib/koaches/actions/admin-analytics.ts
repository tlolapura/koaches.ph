"use server";

import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import {
  ADMIN_COACH_SUMMARY_COLUMNS,
  ADMIN_SESSION_AGG_COLUMNS,
} from "@/lib/koaches/db/columns";
import { mapCoach, mapSession, type DbCoach, type DbSession } from "@/lib/koaches/db/mappers";
import { SUBSCRIPTION_PRICES } from "@/lib/koaches/admin-data";
import type { AdminAnalyticsData, WeeklySessionPoint } from "@/lib/koaches/admin-analytics";
import { EARLY_BIRD_SLOTS_TOTAL } from "@/lib/koaches/early-bird";
import { getSubscriptionBillingInfo } from "@/lib/koaches/subscription-billing";

function parseDay(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const d = parseISO(value.slice(0, 10));
    return Number.isNaN(d.getTime()) ? null : startOfDay(d);
  } catch {
    return null;
  }
}

function inLastDays(date: Date, today: Date, days: number): boolean {
  const start = startOfDay(subDays(today, days - 1));
  return date >= start && date <= today;
}

function buildWeeklyTrend(
  doneDates: Date[],
  today: Date,
  weeks = 8
): WeeklySessionPoint[] {
  const points: WeeklySessionPoint[] = [];
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const weekStart = startOfDay(subDays(thisWeekStart, i * 7));
    const weekEnd = startOfDay(addDays(weekStart, 6));
    const count = doneDates.filter((d) => d >= weekStart && d <= weekEnd).length;
    points.push({
      week: format(weekStart, "yyyy-MM-dd"),
      label: format(weekStart, "MMM d"),
      sessions: count,
    });
  }
  return points;
}

export async function fetchAdminAnalyticsAction(): Promise<AdminAnalyticsData> {
  await requireAdmin();
  const supabase = createServiceClient();
  const today = startOfDay(new Date());

  const [
    { data: coaches, error: coachesError },
    { data: sessions, error: sessionsError },
    { data: students, error: studentsError },
    { count: pendingApps, error: appsError },
    { count: pendingReceipts, error: paymentsError },
  ] = await Promise.all([
    supabase.from("coaches").select(ADMIN_COACH_SUMMARY_COLUMNS as "*"),
    supabase.from("sessions").select(ADMIN_SESSION_AGG_COLUMNS as "*"),
    supabase
      .from("students")
      .select("id, coach_id, is_archived, enrolled_date")
      .eq("is_archived", false),
    supabase
      .from("coach_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("coach_payment_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  if (coachesError) throw coachesError;
  if (sessionsError) throw sessionsError;
  if (studentsError) throw studentsError;
  if (appsError) throw appsError;
  if (paymentsError) throw paymentsError;

  const coachRows = (coaches ?? []) as DbCoach[];
  const sessionRows = ((sessions ?? []) as DbSession[]).map(mapSession);
  const studentRows = (students ?? []) as Array<{
    id: string;
    coach_id: string;
    is_archived: boolean;
    enrolled_date: string;
  }>;

  const doneSessions = sessionRows.filter((s) => s.status === "done");
  const doneDates = doneSessions
    .map((s) => parseDay(s.date))
    .filter((d): d is Date => Boolean(d));

  const activeCoachIds7d = new Set<string>();
  const activeCoachIds30d = new Set<string>();
  for (const s of doneSessions) {
    const d = parseDay(s.date);
    if (!d) continue;
    if (inLastDays(d, today, 7)) activeCoachIds7d.add(s.coachId);
    if (inLastDays(d, today, 30)) activeCoachIds30d.add(s.coachId);
  }

  const sessionsCompleted7d = doneDates.filter((d) => inLastDays(d, today, 7)).length;
  const sessionsCompleted30d = doneDates.filter((d) => inLastDays(d, today, 30)).length;
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const sessionsCompletedThisWeek = doneDates.filter((d) => d >= weekStart && d <= today).length;

  const newCoachesThisWeek = coachRows.filter((c) => {
    const created = parseDay(c.created_at);
    return created ? created >= weekStart && created <= today : false;
  }).length;

  const newStudentsThisWeek = studentRows.filter((s) => {
    const enrolled = parseDay(s.enrolled_date);
    return enrolled ? enrolled >= weekStart && enrolled <= today : false;
  }).length;

  const newCoaches30d = coachRows.filter((c) => {
    const created = parseDay(c.created_at);
    return created ? inLastDays(created, today, 30) : false;
  });

  const newStudents30d = studentRows.filter((s) => {
    const enrolled = parseDay(s.enrolled_date);
    return enrolled ? inLastDays(enrolled, today, 30) : false;
  }).length;

  const doneByCoach = new Map<string, Date[]>();
  for (const s of doneSessions) {
    const d = parseDay(s.date);
    if (!d) continue;
    const list = doneByCoach.get(s.coachId) ?? [];
    list.push(d);
    doneByCoach.set(s.coachId, list);
  }

  let activatedWithin14d = 0;
  for (const c of newCoaches30d) {
    const created = parseDay(c.created_at);
    if (!created) continue;
    const dates = doneByCoach.get(c.id) ?? [];
    const activated = dates.some((d) => differenceInCalendarDays(d, created) <= 14 && d >= created);
    if (activated) activatedWithin14d += 1;
  }

  const listedActive = coachRows.filter((c) => c.is_active);
  const mrr = listedActive.reduce(
    (sum, c) => sum + SUBSCRIPTION_PRICES[c.subscription_plan as keyof typeof SUBSCRIPTION_PRICES],
    0
  );
  const earlyBirdUsed = listedActive.filter((c) => c.subscription_plan === "early-bird").length;

  let paymentDueOrOverdue = 0;
  let lapsed = 0;
  for (const c of coachRows) {
    const billing = getSubscriptionBillingInfo(mapCoach(c));
    if (billing.status === "payment_due" || billing.status === "overdue" || billing.status === "send_invoice") {
      paymentDueOrOverdue += 1;
    }
    if (billing.status === "lapsed") lapsed += 1;
  }

  const cohortSize30d = newCoaches30d.length;

  return {
    generatedAt: new Date().toISOString(),
    northStar: {
      activeCoaches7d: activeCoachIds7d.size,
      activeCoaches30d: activeCoachIds30d.size,
      listedActiveCoaches: listedActive.length,
    },
    usage: {
      sessionsCompleted7d,
      sessionsCompleted30d,
      sessionsCompletedThisWeek,
      weeklyTrend: buildWeeklyTrend(doneDates, today, 8),
    },
    growth: {
      newCoachesThisWeek,
      newStudentsThisWeek,
      newCoaches30d: cohortSize30d,
      newStudents30d,
    },
    activation: {
      cohortSize30d,
      activatedWithin14d,
      activationRate14d:
        cohortSize30d > 0 ? Math.round((activatedWithin14d / cohortSize30d) * 100) : null,
    },
    billing: {
      mrr,
      pendingReceipts: pendingReceipts ?? 0,
      paymentDueOrOverdue,
      lapsed,
      earlyBirdUsed,
      earlyBirdTotal: EARLY_BIRD_SLOTS_TOTAL,
    },
    pipeline: {
      pendingApplications: pendingApps ?? 0,
    },
    monthlySessionMetrics: [],
  };
}
