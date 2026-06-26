export const SUBSCRIPTION_PRICES = {
  "early-bird": 299,
  regular: 499,
} as const;

export type MonthlyMetric = {
  month: string;
  sessions: number;
  revenue: number;
  coaches: number;
};

export type CoachSummary = {
  id: string;
  name: string;
  slug: string;
  students: number;
  sessionsThisMonth: number;
  revenueThisMonth: number;
  subscriptionPlan: string;
  subscriptionExpiry: string;
  isActive: boolean;
  courtCount: number;
};

export type AdminDashboardData = {
  stats: {
    totalCoaches: number;
    activeCoaches: number;
    totalStudents: number;
    totalSessions: number;
    totalRevenue: number;
    revenueThisMonth: number;
    progressCardsGenerated: number;
    certificatesGenerated: number;
  };
  courtCount: number;
  pendingApplications: number;
  revenueThisMonth: number;
  totalRevenue: number;
  sessionsThisMonth: number;
  mrr: number;
  earlyBirdRemaining: number;
  earlyBirdPercent: number;
  earlyBirdSlotsUsed: number;
  earlyBirdSlotsTotal: number;
  monthlyMetrics: MonthlyMetric[];
  coachSummaries: CoachSummary[];
  recentActivity: Array<{ id: string; label: string; time: string }>;
  pendingApps: Array<{
    id: string;
    fullName: string;
    email: string;
    bio: string;
    currentStudentCount: number;
    appliedAt: string;
    status: string;
  }>;
  pendingPaymentCount: number;
};
