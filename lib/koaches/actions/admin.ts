"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { isCollectedSession } from "@/lib/koaches/session-payment";
import { mapApplication, mapCoach, mapSession, mapStudent, type DbApplication, type DbCoach, type DbSession, type DbStudent } from "@/lib/koaches/db/mappers";
import { SUBSCRIPTION_PRICES, type AdminDashboardData, type CoachSummary } from "@/lib/koaches/admin-data";

const EARLY_BIRD_SLOTS_TOTAL = 50;

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export async function fetchAdminDashboardAction(): Promise<AdminDashboardData> {
  const supabase = createServiceClient();
  const month = currentMonthKey();

  const [
    { data: coaches, error: coachesError },
    { data: sessions, error: sessionsError },
    { data: students, error: studentsError },
    { data: applications, error: appsError },
    { count: courtCount, error: courtsError },
    { count: progressCardCount, error: progressError },
  ] = await Promise.all([
    supabase.from("coaches").select("*"),
    supabase.from("sessions").select("*"),
    supabase.from("students").select("*"),
    supabase.from("coach_applications").select("*").order("applied_at", { ascending: false }),
    supabase.from("courts").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("progress_cards").select("*", { count: "exact", head: true }),
  ]);

  if (coachesError) throw coachesError;
  if (sessionsError) throw sessionsError;
  if (studentsError) throw studentsError;
  if (appsError) throw appsError;
  if (courtsError) throw courtsError;
  if (progressError) throw progressError;

  const coachRows = (coaches ?? []) as DbCoach[];
  const sessionRows = ((sessions ?? []) as DbSession[]).map(mapSession);
  const studentRows = (students ?? []) as DbStudent[];
  const appRows = ((applications ?? []) as DbApplication[]).map(mapApplication);

  const pendingApps = appRows.filter((a) => a.status === "pending");
  const collectedThisMonth = sessionRows.filter(
    (s) => isCollectedSession(s) && Boolean(s.date?.startsWith(month))
  );
  const doneThisMonth = sessionRows.filter(
    (s) => s.status === "done" && Boolean(s.date?.startsWith(month))
  );
  const revenueThisMonth = collectedThisMonth.reduce((sum, s) => sum + s.price, 0);
  const totalRevenue = sessionRows.filter((s) => isCollectedSession(s)).reduce((sum, s) => sum + s.price, 0);
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
      .reduce((sum, s) => sum + s.price, 0);

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
      totalSessions: sessionRows.filter((s) => s.status === "done").length,
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
  };
}
