import type { MonthlyMetric } from "@/lib/koaches/admin-data";

export type WeeklySessionPoint = {
  week: string;
  label: string;
  sessions: number;
};

export type AdminAnalyticsData = {
  generatedAt: string;
  northStar: {
    activeCoaches7d: number;
    activeCoaches30d: number;
    /** Coaches marked is_active in DB */
    listedActiveCoaches: number;
  };
  usage: {
    sessionsCompleted7d: number;
    sessionsCompleted30d: number;
    sessionsCompletedThisWeek: number;
    weeklyTrend: WeeklySessionPoint[];
  };
  growth: {
    newCoachesThisWeek: number;
    newStudentsThisWeek: number;
    newCoaches30d: number;
    newStudents30d: number;
  };
  activation: {
    /** Coaches created in last 30 days */
    cohortSize30d: number;
    /** Cohort coaches with ≥1 done session within 14 days of signup */
    activatedWithin14d: number;
    /** 0–100, null if cohort empty */
    activationRate14d: number | null;
  };
  billing: {
    mrr: number;
    pendingReceipts: number;
    paymentDueOrOverdue: number;
    lapsed: number;
    earlyBirdUsed: number;
    earlyBirdTotal: number;
  };
  pipeline: {
    pendingApplications: number;
  };
  /** Reuse chart shape if we want revenue later */
  monthlySessionMetrics: MonthlyMetric[];
};
