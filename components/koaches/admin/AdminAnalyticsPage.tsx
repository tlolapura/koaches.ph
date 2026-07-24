"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Activity,
  ArrowRight,
  CreditCard,
  FileText,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { AdminAnalyticsData } from "@/lib/koaches/admin-analytics";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { cn, formatCurrency } from "@/lib/utils";

const AdminSessionsTrendChart = dynamic(
  () =>
    import("@/components/koaches/admin/AdminSessionsTrendChart").then(
      (m) => m.AdminSessionsTrendChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-2xl bg-[#E5E7EB]/60" />,
  }
);

type AdminAnalyticsPageProps = {
  data: AdminAnalyticsData;
};

const cardClass =
  "overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80";

function MetricTile({
  label,
  value,
  sub,
  tone = "green",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "green" | "blue" | "amber" | "slate";
}) {
  const valueColor =
    tone === "blue"
      ? "text-[#1D4ED8]"
      : tone === "amber"
        ? "text-[#9A3412]"
        : tone === "slate"
          ? "text-[#334155]"
          : "text-[#14532D]";

  return (
    <div className={cn(cardClass, "p-4")}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <p className={cn("font-heading mt-1.5 text-2xl font-bold leading-none", valueColor)}>
        {value}
      </p>
      {sub ? <p className="mt-1.5 text-xs text-[#6B7280]">{sub}</p> : null}
    </div>
  );
}

export function AdminAnalyticsPage({ data }: AdminAnalyticsPageProps) {
  const { northStar, usage, growth, activation, billing, pipeline } = data;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Analytics"
        subtitle="Early validation metrics — usage, activation, and billing health"
        className="mb-6"
      />

      <section className={cn(cardClass, "relative overflow-hidden p-5")}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F0FDF4] via-transparent to-[#EFF6FF]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
              North star
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold text-[#111827] sm:text-2xl">
              Coaches running sessions
            </h2>
            <p className="mt-1 max-w-lg text-sm text-[#6B7280]">
              Active = completed ≥1 session in the window. This is the clearest signal the product is
              being used.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-[#BBF7D0]/80">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#166534]/70">
                7 days
              </p>
              <p className="font-heading text-3xl font-bold text-[#14532D]">
                {northStar.activeCoaches7d}
              </p>
            </div>
            <div className="rounded-2xl bg-white/90 px-4 py-3 ring-1 ring-[#BFDBFE]/80">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1D4ED8]/70">
                30 days
              </p>
              <p className="font-heading text-3xl font-bold text-[#1D4ED8]">
                {northStar.activeCoaches30d}
              </p>
            </div>
          </div>
        </div>
        <p className="relative mt-3 text-xs text-[#6B7280]">
          {northStar.listedActiveCoaches} coaches marked active on billing · early bird{" "}
          {billing.earlyBirdUsed}/{billing.earlyBirdTotal}
        </p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Sessions · 7d"
          value={usage.sessionsCompleted7d}
          sub={`${usage.sessionsCompletedThisWeek} this week`}
          tone="green"
        />
        <MetricTile
          label="Sessions · 30d"
          value={usage.sessionsCompleted30d}
          sub="Completed only"
          tone="blue"
        />
        <MetricTile
          label="New coaches · week"
          value={growth.newCoachesThisWeek}
          sub={`${growth.newCoaches30d} in 30 days`}
          tone="green"
        />
        <MetricTile
          label="New students · week"
          value={growth.newStudentsThisWeek}
          sub={`${growth.newStudents30d} in 30 days`}
          tone="blue"
        />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className={cn(cardClass, "p-5 lg:col-span-2")}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#166534]">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-[#111827]">Sessions trend</h2>
              <p className="text-sm text-[#6B7280]">Completed sessions · last 8 weeks</p>
            </div>
          </div>
          <div className="mt-4">
            <AdminSessionsTrendChart data={usage.weeklyTrend} />
          </div>
        </section>

        <section className={cn(cardClass, "p-5")}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-[#111827]">Activation</h2>
              <p className="text-sm text-[#6B7280]">First session ≤14 days</p>
            </div>
          </div>
          <p className="font-heading mt-5 text-4xl font-bold text-[#1D4ED8]">
            {activation.activationRate14d === null ? "—" : `${activation.activationRate14d}%`}
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            {activation.activatedWithin14d} of {activation.cohortSize30d} coaches created in the last
            30 days completed a session within 14 days of signup.
          </p>
          {activation.cohortSize30d === 0 ? (
            <p className="mt-3 rounded-xl bg-[#F9FAFB] px-3 py-2 text-xs text-[#6B7280]">
              No new coaches in this window yet — rate appears once the cohort grows.
            </p>
          ) : null}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={cn(cardClass, "p-5")}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#C2410C]">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-[#111827]">Billing health</h2>
                <p className="text-sm text-[#6B7280]">Willingness to pay signals</p>
              </div>
            </div>
            <Link
              href="/admin/payments"
              className="text-sm font-semibold text-[#4F8FF7] hover:underline"
            >
              Payments
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F0FDF4] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#166534]/70">
                MRR
              </p>
              <p className="font-heading mt-1 text-xl font-bold text-[#14532D]">
                {formatCurrency(billing.mrr)}
              </p>
            </div>
            <div className="rounded-xl bg-[#FFF7ED] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9A3412]/70">
                Pending receipts
              </p>
              <p className="font-heading mt-1 text-xl font-bold text-[#9A3412]">
                {billing.pendingReceipts}
              </p>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                Due / overdue
              </p>
              <p className="font-heading mt-1 text-xl font-bold text-[#334155]">
                {billing.paymentDueOrOverdue}
              </p>
            </div>
            <div className="rounded-xl bg-[#FEF2F2] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#B91C1C]/70">
                Lapsed
              </p>
              <p className="font-heading mt-1 text-xl font-bold text-[#B91C1C]">{billing.lapsed}</p>
            </div>
          </div>
        </section>

        <section className={cn(cardClass, "p-5")}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0FDF4] text-[#166534]">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-[#111827]">Pipeline</h2>
              <p className="text-sm text-[#6B7280]">What needs your attention</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Link
              href="/admin/applications"
              className="flex min-h-[48px] items-center justify-between rounded-xl bg-[#EFF6FF] px-3.5 text-sm font-semibold text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
            >
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pending applications
              </span>
              <span className="inline-flex items-center gap-2">
                {pipeline.pendingApplications}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/admin/payments"
              className="flex min-h-[48px] items-center justify-between rounded-xl bg-[#FFF7ED] px-3.5 text-sm font-semibold text-[#9A3412] transition-colors hover:bg-[#FFEDD5]"
            >
              <span className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Receipts to review
              </span>
              <span className="inline-flex items-center gap-2">
                {billing.pendingReceipts}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link
              href="/admin/coaches"
              className="flex min-h-[48px] items-center justify-between rounded-xl bg-[#F0FDF4] px-3.5 text-sm font-semibold text-[#166534] transition-colors hover:bg-[#DCFCE7]"
            >
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage coaches
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 text-sm text-[#6B7280]">
              <span className="inline-flex items-center gap-2 font-semibold text-[#374151]">
                <UserPlus className="h-4 w-4 text-[#16A34A]" />
                This week
              </span>
              <p className="mt-1">
                {growth.newCoachesThisWeek} new coach
                {growth.newCoachesThisWeek === 1 ? "" : "es"} · {growth.newStudentsThisWeek} new
                student{growth.newStudentsThisWeek === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AdminPageShell>
  );
}
