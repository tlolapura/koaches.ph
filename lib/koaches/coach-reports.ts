import {
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import type { DuprLevel, Session, Student } from "@/lib/koaches/types";
import { isCanceledStatus, isDoneStatus } from "@/lib/koaches/session-status";
import { isCollectedSession } from "@/lib/koaches/session-payment";

export type ReportPeriod = "week" | "month" | "all";

export type StudentReportRow = {
  studentId: string;
  name: string;
  skillLevel: DuprLevel;
  sessionCount: number;
  revenue: number;
};

export type EarningsTrendPoint = {
  label: string;
  collected: number;
  sessions: number;
};

export type CoachReportSummary = {
  period: ReportPeriod;
  periodLabel: string;
  collected: number;
  outstanding: number;
  expected: number;
  sessionsDone: number;
  sessionsUpcoming: number;
  sessionsCanceled: number;
  unpaidSessionCount: number;
  programRevenue: number;
  dropInRevenue: number;
  activeStudents: number;
  studentsWithSessions: number;
  avgPerCollectedSession: number;
  topStudentsBySessions: StudentReportRow[];
  topStudentsByRevenue: StudentReportRow[];
  newEnrollments: number;
  studentsOnProgram: number;
  dropInStudents: number;
  studentsByLevel: { level: DuprLevel; count: number }[];
  earningsTrend: EarningsTrendPoint[];
};

const DUPR_ORDER: DuprLevel[] = ["2.0", "2.5", "3.0", "3.5", "4.0", "4.5+"];

function periodInterval(period: ReportPeriod, now = new Date()) {
  if (period === "all") return null;
  if (period === "week") {
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    };
  }
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

function periodLabel(period: ReportPeriod): string {
  switch (period) {
    case "week":
      return "This week";
    case "month":
      return "This month";
    case "all":
      return "All time";
  }
}

function dateInPeriod(date: string, period: ReportPeriod, now = new Date()): boolean {
  if (period === "all") return true;
  const interval = periodInterval(period, now);
  if (!interval) return true;
  return isWithinInterval(parseISO(date), interval);
}

function sessionInPeriod(session: Session, period: ReportPeriod, now = new Date()): boolean {
  if (period === "all") return true;
  if (!session.date) return false;
  return dateInPeriod(session.date, period, now);
}

function studentIdsOnSession(session: Session): string[] {
  const ids = new Set<string>();
  if (session.studentId) ids.add(session.studentId);
  for (const p of session.participants) {
    if (p.studentId) ids.add(p.studentId);
  }
  return [...ids];
}

function topRows(
  stats: Map<string, { sessionCount: number; revenue: number }>,
  students: Student[],
  sortBy: "sessionCount" | "revenue",
  limit = 5
): StudentReportRow[] {
  const lookup = new Map(students.map((s) => [s.id, s]));
  return [...stats.entries()]
    .map(([studentId, row]) => {
      const student = lookup.get(studentId);
      return {
        studentId,
        name: student?.name ?? "Student",
        skillLevel: student?.skillLevel ?? "3.0",
        sessionCount: row.sessionCount,
        revenue: row.revenue,
      };
    })
    .filter((row) => row.sessionCount > 0 || row.revenue > 0)
    .sort((a, b) => b[sortBy] - a[sortBy] || b.sessionCount - a.sessionCount)
    .slice(0, limit);
}

function buildEarningsTrend(
  sessions: Session[],
  period: ReportPeriod,
  now = new Date()
): EarningsTrendPoint[] {
  const collectedSessions = sessions.filter(
    (s) => s.date && isDoneStatus(s.status) && isCollectedSession(s)
  );

  if (period === "week") {
    const interval = periodInterval("week", now)!;
    return eachDayOfInterval(interval).map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const daySessions = collectedSessions.filter((s) => s.date === key);
      return {
        label: format(day, "EEE"),
        collected: daySessions.reduce((sum, s) => sum + s.price, 0),
        sessions: daySessions.length,
      };
    });
  }

  if (period === "month") {
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    let cursor = startOfWeek(monthStart, { weekStartsOn: 1 });
    const buckets: EarningsTrendPoint[] = [];
    let weekNum = 1;

    while (cursor <= monthEnd && weekNum <= 6) {
      const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 });
      const rangeStart = cursor < monthStart ? monthStart : cursor;
      const rangeEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
      const weekSessions = collectedSessions.filter((s) => {
        if (!s.date) return false;
        const d = parseISO(s.date);
        return d >= rangeStart && d <= rangeEnd;
      });
      buckets.push({
        label: `W${weekNum}`,
        collected: weekSessions.reduce((sum, s) => sum + s.price, 0),
        sessions: weekSessions.length,
      });
      cursor = addWeeks(cursor, 1);
      weekNum += 1;
    }
    return buckets;
  }

  const points: EarningsTrendPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(monthStart);
    const monthSessions = collectedSessions.filter((s) => {
      if (!s.date) return false;
      return isWithinInterval(parseISO(s.date), { start: monthStart, end: monthEnd });
    });
    points.push({
      label: format(monthStart, "MMM"),
      collected: monthSessions.reduce((sum, s) => sum + s.price, 0),
      sessions: monthSessions.length,
    });
  }
  return points;
}

export function buildCoachReport(
  sessions: Session[],
  students: Student[],
  period: ReportPeriod,
  now = new Date()
): CoachReportSummary {
  const inPeriod = sessions.filter((s) => sessionInPeriod(s, period, now));
  const countable = inPeriod.filter((s) => !isCanceledStatus(s.status));
  const activeStudents = students.filter((s) => !s.isArchived);

  let collected = 0;
  let outstanding = 0;
  let expected = 0;
  let programRevenue = 0;
  let dropInRevenue = 0;
  let sessionsDone = 0;
  let sessionsUpcoming = 0;
  let sessionsCanceled = 0;
  let unpaidSessionCount = 0;
  let collectedSessionCount = 0;

  const studentStats = new Map<string, { sessionCount: number; revenue: number }>();

  const bumpStudent = (studentId: string, sessions = 0, revenue = 0) => {
    const prev = studentStats.get(studentId) ?? { sessionCount: 0, revenue: 0 };
    studentStats.set(studentId, {
      sessionCount: prev.sessionCount + sessions,
      revenue: prev.revenue + revenue,
    });
  };

  for (const session of inPeriod) {
    if (isCanceledStatus(session.status)) {
      sessionsCanceled += 1;
      continue;
    }

    if (session.status === "upcoming") {
      sessionsUpcoming += 1;
      expected += session.price;
      if (session.paymentStatus !== "paid") unpaidSessionCount += 1;
      continue;
    }

    if (isDoneStatus(session.status)) {
      sessionsDone += 1;
      const ids = studentIdsOnSession(session);
      const share = ids.length > 0 ? session.price / ids.length : session.price;

      if (isCollectedSession(session)) {
        collected += session.price;
        collectedSessionCount += 1;
        if (session.type === "program") programRevenue += session.price;
        else dropInRevenue += session.price;
        for (const id of ids) bumpStudent(id, 1, share);
      } else {
        outstanding += session.price;
        unpaidSessionCount += 1;
        for (const id of ids) bumpStudent(id, 1, 0);
      }
    }
  }

  const studentIds = new Set<string>();
  for (const session of countable) {
    for (const id of studentIdsOnSession(session)) studentIds.add(id);
  }

  const newEnrollments =
    period === "all"
      ? students.length
      : activeStudents.filter((s) => s.enrolledDate && dateInPeriod(s.enrolledDate, period, now)).length;

  const studentsOnProgram = activeStudents.filter((s) => s.programId).length;
  const dropInStudents = activeStudents.length - studentsOnProgram;

  const levelCounts = new Map<DuprLevel, number>();
  for (const s of activeStudents) {
    levelCounts.set(s.skillLevel, (levelCounts.get(s.skillLevel) ?? 0) + 1);
  }
  const studentsByLevel = DUPR_ORDER.filter((l) => (levelCounts.get(l) ?? 0) > 0).map((level) => ({
    level,
    count: levelCounts.get(level) ?? 0,
  }));

  return {
    period,
    periodLabel: periodLabel(period),
    collected,
    outstanding,
    expected,
    sessionsDone,
    sessionsUpcoming,
    sessionsCanceled,
    unpaidSessionCount,
    programRevenue,
    dropInRevenue,
    activeStudents: activeStudents.length,
    studentsWithSessions: studentIds.size,
    avgPerCollectedSession:
      collectedSessionCount > 0 ? Math.round(collected / collectedSessionCount) : 0,
    topStudentsBySessions: topRows(studentStats, students, "sessionCount"),
    topStudentsByRevenue: topRows(studentStats, students, "revenue"),
    newEnrollments,
    studentsOnProgram,
    dropInStudents,
    studentsByLevel,
    earningsTrend: buildEarningsTrend(sessions, period, now),
  };
}

export const REPORT_PERIODS: ReportPeriod[] = ["week", "month", "all"];

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  week: "This week",
  month: "This month",
  all: "All time",
};

/** DUPR levels present on roster, sorted for filter chips */
export function duprLevelsOnRoster(students: Student[]): DuprLevel[] {
  const present = new Set(students.map((s) => s.skillLevel));
  return DUPR_ORDER.filter((l) => present.has(l));
}
