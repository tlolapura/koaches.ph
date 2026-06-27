"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Users, Wallet } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import {
  CoachPageHeader,
  CoachPageShell,
  CoachSectionTitle,
} from "@/components/koaches/coach/CoachPageLayout";
import { CoachReportsSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { DuprChip, EmptyState, InitialsAvatar } from "@/components/koaches/coach/CoachUi";
import {
  CoachEarningsTrendChart,
  CoachRevenueMixChart,
  CoachStudentsByLevelChart,
} from "@/components/koaches/coach/CoachReportCharts";
import {
  buildCoachReport,
  REPORT_PERIOD_LABELS,
  REPORT_PERIODS,
  type ReportPeriod,
  type StudentReportRow,
} from "@/lib/koaches/coach-reports";
import { formatCurrency, cn } from "@/lib/utils";

function PeriodChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-heading shrink-0 rounded-full px-4 py-2 text-sm font-semibold min-h-[44px]",
        active ? "bg-[#16A34A] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"
      )}
    >
      {label}
    </button>
  );
}

function StudentReportRowCard({ row, rank, metric }: { row: StudentReportRow; rank: number; metric: "sessions" | "revenue" }) {
  return (
    <Link href={`/coach/students/${row.studentId}`} className="coach-card block p-4">
      <div className="flex items-center gap-3">
        <span className="font-heading flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-bold text-[#6B7280]">
          {rank}
        </span>
        <InitialsAvatar name={row.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="font-heading truncate font-semibold text-[#111827]">{row.name}</p>
          <div className="mt-1">
            <DuprChip level={row.skillLevel} />
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-heading text-sm font-bold text-[#14532D]">
            {metric === "revenue" ? formatCurrency(row.revenue) : row.sessionCount}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            {metric === "revenue" ? "Collected" : row.sessionCount === 1 ? "Session" : "Sessions"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function CoachReportsPage() {
  const coachId = usePortalCoachId();
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const { sessions, loading: sessionsLoading } = useCoachSessions(coachId);
  const { students } = useCoachStudents(coachId, true);

  const report = useMemo(
    () => buildCoachReport(sessions, students, period),
    [sessions, students, period]
  );

  if (!coachId) {
    return <CoachReportsSkeleton />;
  }

  const loading = sessionsLoading && sessions.length === 0;

  return (
    <CoachPageShell>
      <CoachPageHeader title="Reports" subtitle="Earnings, sessions, and student activity" />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {REPORT_PERIODS.map((p) => (
          <PeriodChip
            key={p}
            active={period === p}
            label={REPORT_PERIOD_LABELS[p]}
            onClick={() => setPeriod(p)}
          />
        ))}
      </div>

      {loading ? (
        <div className="mt-4 animate-pulse space-y-3" aria-busy aria-label="Loading reports">
          <div className="h-28 rounded-2xl bg-[#E5E7EB]" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-2xl bg-[#E5E7EB]/80" />
            <div className="h-20 rounded-2xl bg-[#E5E7EB]/80" />
          </div>
        </div>
      ) : (
        <>
          <section className="mt-4">
            <CoachSectionTitle>Earnings</CoachSectionTitle>
            <div className="coach-card mt-3 overflow-hidden p-0">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                  Collected · {report.periodLabel}
                </p>
                <p className="font-heading mt-1 text-2xl font-bold text-[#111827]">
                  {formatCurrency(report.collected)}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {report.sessionsDone} completed session{report.sessionsDone === 1 ? "" : "s"}
                  {report.avgPerCollectedSession > 0 &&
                    ` · avg ${formatCurrency(report.avgPerCollectedSession)}`}
                </p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#E5E7EB] border-t border-[#E5E7EB]">
                <div className="px-3 py-3 text-center">
                  <p className="font-heading text-lg font-bold text-[#D97706]">
                    {formatCurrency(report.outstanding)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                    Outstanding
                  </p>
                </div>
                <div className="px-3 py-3 text-center">
                  <p className="font-heading text-lg font-bold text-[#4F8FF7]">
                    {formatCurrency(report.expected)}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                    Expected
                  </p>
                </div>
              </div>
            </div>

            <div className="coach-card mt-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Collected over time
              </p>
              <div className="mt-3">
                <CoachEarningsTrendChart data={report.earningsTrend} />
              </div>
            </div>

            <div className="coach-card mt-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Revenue mix
              </p>
              <div className="mt-3">
                <CoachRevenueMixChart
                  programRevenue={report.programRevenue}
                  dropInRevenue={report.dropInRevenue}
                />
              </div>
            </div>
          </section>

          <section className="mt-8">
            <CoachSectionTitle>Sessions</CoachSectionTitle>
            <div className="coach-card mt-3 grid grid-cols-3 divide-x divide-[#E5E7EB] p-0">
              {[
                { label: "Done", value: report.sessionsDone, tone: "text-[#111827]" },
                { label: "Upcoming", value: report.sessionsUpcoming, tone: "text-[#16A34A]" },
                { label: "Canceled", value: report.sessionsCanceled, tone: "text-[#6B7280]" },
              ].map((item) => (
                <div key={item.label} className="px-2 py-3 text-center">
                  <p className={cn("font-heading text-lg font-bold leading-none", item.tone)}>
                    {item.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <CoachSectionTitle>Students</CoachSectionTitle>
            <p className="mt-1 text-sm text-[#6B7280]">
              Roster and activity for {report.periodLabel.toLowerCase()}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Active", value: report.activeStudents },
                { label: "With sessions", value: report.studentsWithSessions },
                { label: "On program", value: report.studentsOnProgram },
                {
                  label: period === "all" ? "Total enrolled" : "New",
                  value: report.newEnrollments,
                },
              ].map((stat) => (
                <div key={stat.label} className="coach-card px-3 py-3 text-center">
                  <p className="font-heading text-xl font-bold text-[#111827]">{stat.value}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {report.studentsByLevel.length > 0 && (
              <div className="coach-card mt-4 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                  By DUPR level
                </p>
                <div className="mt-3">
                  <CoachStudentsByLevelChart levels={report.studentsByLevel} />
                </div>
              </div>
            )}

            <h3 className="font-heading mt-6 text-sm font-semibold text-[#111827]">Top by sessions</h3>
            {report.topStudentsBySessions.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={Users}
                  title="No completed sessions yet"
                  description={`Student rankings appear once sessions are done ${report.periodLabel.toLowerCase()}.`}
                />
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {report.topStudentsBySessions.map((row, i) => (
                  <StudentReportRowCard key={row.studentId} row={row} rank={i + 1} metric="sessions" />
                ))}
              </div>
            )}

            <h3 className="font-heading mt-6 text-sm font-semibold text-[#111827]">Top by revenue</h3>
            {report.topStudentsByRevenue.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={Users}
                  title="No collected revenue yet"
                  description="Revenue rankings use paid sessions in this period."
                />
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {report.topStudentsByRevenue.map((row, i) => (
                  <StudentReportRowCard key={`rev-${row.studentId}`} row={row} rank={i + 1} metric="revenue" />
                ))}
              </div>
            )}

            <Link
              href="/coach/students"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4F8FF7] hover:underline"
            >
              View full roster
              <ChevronRight className="h-4 w-4" />
            </Link>
          </section>

          {(report.unpaidSessionCount > 0 || report.outstanding > 0) && (
            <section className="mt-8">
              <CoachSectionTitle>Needs attention</CoachSectionTitle>
              <div className="mt-3 space-y-2">
                {report.unpaidSessionCount > 0 && (
                  <Link
                    href="/coach/sessions?view=list"
                    className="coach-card flex items-center gap-3 p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D97706] text-white">
                      <Wallet className="h-[18px] w-[18px]" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold text-[#111827]">
                        {report.unpaidSessionCount} unpaid session
                        {report.unpaidSessionCount === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-[#6B7280]">Mark payment when collected</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
                  </Link>
                )}
                <Link
                  href="/coach/billing"
                  className="coach-card flex items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-heading text-sm font-semibold text-[#111827]">
                      Subscription & billing
                    </p>
                    <p className="text-xs text-[#6B7280]">Invoices and payment receipts</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </CoachPageShell>
  );
}
