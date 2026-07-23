"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import { isCollectedSession, sessionCollectedAmount } from "@/lib/koaches/session-payment";
import {
  mapApplication,
  mapCoach,
  mapSession,
  type DbApplication,
  type DbCoach,
  type DbSession,
  type DbStudent,
} from "@/lib/koaches/db/mappers";
import {
  ADMIN_COACH_SUMMARY_COLUMNS,
  ADMIN_SESSION_AGG_COLUMNS,
  ADMIN_STUDENT_AGG_COLUMNS,
} from "@/lib/koaches/db/columns";
import { SUBSCRIPTION_PRICES, type AdminDashboardData, type CoachSummary } from "@/lib/koaches/admin-data";
import { EARLY_BIRD_SLOTS_TOTAL } from "@/lib/koaches/early-bird";

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export async function fetchAdminDashboardAction(): Promise<AdminDashboardData> {
  await requireAdmin();
  const supabase = createServiceClient();
  const month = currentMonthKey();

  const [
    { data: coaches, error: coachesError },
    { data: sessions, error: sessionsError },
    { data: students, error: studentsError },
    { data: applications, error: appsError },
    { count: courtCount, error: courtsError },
    { count: progressCardCount, error: progressError },
    { count: pendingPaymentCount, error: paymentsError },
    { count: doneSessionCount, error: doneCountError },
  ] = await Promise.all([
    supabase.from("coaches").select(ADMIN_COACH_SUMMARY_COLUMNS as "*"),
    supabase.from("sessions").select(ADMIN_SESSION_AGG_COLUMNS as "*"),
    supabase.from("students").select(ADMIN_STUDENT_AGG_COLUMNS as "*"),
    supabase
      .from("coach_applications")
      .select(
        "id, full_name, mobile, email, bio, specialization, instagram, facebook, skill_template_id, coaching_levels, session_pricing, preferred_slug, current_student_count, status, applied_at"
      )
      .order("applied_at", { ascending: false })
      .limit(50),
    supabase.from("courts").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("progress_cards").select("*", { count: "exact", head: true }),
    supabase
      .from("coach_payment_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "done"),
  ]);

  if (coachesError) throw coachesError;
  if (sessionsError) throw sessionsError;
  if (studentsError) throw studentsError;
  if (appsError) throw appsError;
  if (courtsError) throw courtsError;
  if (progressError) throw progressError;
  if (paymentsError) throw paymentsError;
  if (doneCountError) throw doneCountError;

  const coachRows = (coaches ?? []) as DbCoach[];
  const sessionRows = ((sessions ?? []) as DbSession[]).map(mapSession);
  const studentRows = (students ?? []) as Pick<DbStudent, "id" | "coach_id" | "is_archived">[];
  const appRows = ((applications ?? []) as DbApplication[]).map(mapApplication);

  const pendingApps = appRows.filter((a) => a.status === "pending");
  const collectedThisMonth = sessionRows.filter(
    (s) => isCollectedSession(s) && Boolean(s.date?.startsWith(month))
  );
  const doneThisMonth = sessionRows.filter(
    (s) => s.status === "done" && Boolean(s.date?.startsWith(month))
  );
  const revenueThisMonth = collectedThisMonth.reduce((sum, s) => sum + sessionCollectedAmount(s), 0);
  const totalRevenue = sessionRows
    .filter((s) => isCollectedSession(s))
    .reduce((sum, s) => sum + sessionCollectedAmount(s), 0);
  const activeCoaches = coachRows.filter((c) => c.is_active);
  const mrr = activeCoaches.reduce(
    (sum, c) => sum + SUBSCRIPTION_PRICES[c.subscription_plan as keyof typeof SUBSCRIPTION_PRICES],
    0
  );
  const earlyBirdUsed = activeCoaches.filter((c) => c.subscription_plan === "early-bird").length;
  const earlyBirdRemaining = Math.max(0, EARLY_BIRD_SLOTS_TOTAL - earlyBirdUsed);

  const studentsByCoach = new Map<string, number>();
  for (const s of studentRows) {
    if (!s.is_archived) {
      studentsByCoach.set(s.coach_id, (studentsByCoach.get(s.coach_id) ?? 0) + 1);
    }
  }

  const coachSummaries: CoachSummary[] = coachRows.map((c) => {
    const mapped = mapCoach(c);
    const coachSessions = sessionRows.filter((s) => s.coachId === c.id);
    const monthDone = coachSessions.filter(
      (s) => s.status === "done" && Boolean(s.date?.startsWith(month))
    );
    const monthRevenue = coachSessions
      .filter((s) => isCollectedSession(s) && Boolean(s.date?.startsWith(month)))
      .reduce((sum, s) => sum + sessionCollectedAmount(s), 0);

    return {
      id: mapped.id,
      name: mapped.name,
      slug: mapped.slug,
      students: studentsByCoach.get(c.id) ?? 0,
      sessionsThisMonth: monthDone.length,
      revenueThisMonth: monthRevenue,
      subscriptionPlan: mapped.subscriptionPlan,
      subscriptionExpiry: mapped.subscriptionExpiry,
      isActive: mapped.isActive,
      courtCount: mapped.courtIds.length,
    };
  });

  return {
    stats: {
      totalCoaches: coachRows.length,
      activeCoaches: activeCoaches.length,
      totalStudents: studentRows.filter((s) => !s.is_archived).length,
      totalSessions: doneSessionCount ?? sessionRows.filter((s) => s.status === "done").length,
      totalRevenue,
      revenueThisMonth,
      progressCardsGenerated: progressCardCount ?? 0,
      certificatesGenerated: 0,
    },
    courtCount: courtCount ?? 0,
    pendingApplications: pendingApps.length,
    revenueThisMonth,
    totalRevenue,
    sessionsThisMonth: doneThisMonth.length,
    mrr,
    earlyBirdRemaining,
    earlyBirdPercent: Math.round((earlyBirdUsed / EARLY_BIRD_SLOTS_TOTAL) * 100),
    earlyBirdSlotsUsed: earlyBirdUsed,
    earlyBirdSlotsTotal: EARLY_BIRD_SLOTS_TOTAL,
    monthlyMetrics: [],
    coachSummaries,
    recentActivity: [],
    pendingApps: pendingApps.slice(0, 3).map((a) => ({
      id: a.id,
      fullName: a.fullName,
      email: a.email,
      bio: a.bio,
      currentStudentCount: a.currentStudentCount,
      appliedAt: a.appliedAt,
      status: a.status,
    })),
    pendingPaymentCount: pendingPaymentCount ?? 0,
  };
}
