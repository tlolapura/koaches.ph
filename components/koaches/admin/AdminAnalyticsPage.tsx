"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, CreditCard, FileText } from "lucide-react";
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

export function AdminAnalyticsPage({ data }: AdminAnalyticsPageProps) {
  const { northStar, usage, growth, activation, billing, pipeline } = data;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Analytics" className="mb-6" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Active coaches · 7d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#14532D]">
            {northStar.activeCoaches7d}
          </p>
        </div>
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Active coaches · 30d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#1D4ED8]">
            {northStar.activeCoaches30d}
          </p>
        </div>
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Sessions · 7d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#111827]">
            {usage.sessionsCompleted7d}
          </p>
        </div>
        <div className={cn(cardClass, "p-4")}>
          <p className="text-xs font-medium text-[#6B7280]">Sessions · 30d</p>
          <p className="font-heading mt-1.5 text-2xl font-bold text-[#111827]">
            {usage.sessionsCompleted30d}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className={cn(cardClass, "p-5 lg:col-span-2")}>
          <h2 className="font-heading font-semibold text-[#111827]">Sessions</h2>
          <div className="mt-4">
            <AdminSessionsTrendChart data={usage.weeklyTrend} />
          </div>
        </section>

        <section className={cn(cardClass, "p-5")}>
          <h2 className="font-heading font-semibold text-[#111827]">Activation</h2>
          <p className="font-heading mt-4 text-4xl font-bold text-[#1D4ED8]">
            {activation.activationRate14d === null ? "—" : `${activation.activationRate14d}%`}
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            {activation.activatedWithin14d}/{activation.cohortSize30d} new coaches ran a session
            within 14 days
          </p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={cn(cardClass, "p-5")}>
          <h2 className="font-heading font-semibold text-[#111827]">Growth</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-[#F9FAFB] px-3 py-3">
              <dt className="text-xs text-[#6B7280]">New coaches · week</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#111827]">
                {growth.newCoachesThisWeek}
              </dd>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] px-3 py-3">
              <dt className="text-xs text-[#6B7280]">New students · week</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#111827]">
                {growth.newStudentsThisWeek}
              </dd>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] px-3 py-3">
              <dt className="text-xs text-[#6B7280]">New coaches · 30d</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#111827]">
                {growth.newCoaches30d}
              </dd>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] px-3 py-3">
              <dt className="text-xs text-[#6B7280]">New students · 30d</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#111827]">
                {growth.newStudents30d}
              </dd>
            </div>
          </dl>
        </section>

        <section className={cn(cardClass, "p-5")}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading font-semibold text-[#111827]">Billing</h2>
            <Link
              href="/admin/payments"
              className="text-sm font-semibold text-[#4F8FF7] hover:underline"
            >
              Payments
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-[#F0FDF4] px-3 py-3">
              <dt className="text-xs text-[#166534]/70">MRR</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#14532D]">
                {formatCurrency(billing.mrr)}
              </dd>
            </div>
            <div className="rounded-xl bg-[#FFF7ED] px-3 py-3">
              <dt className="text-xs text-[#9A3412]/70">Pending</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#9A3412]">
                {billing.pendingReceipts}
              </dd>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] px-3 py-3">
              <dt className="text-xs text-[#64748B]">Due / overdue</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#334155]">
                {billing.paymentDueOrOverdue}
              </dd>
            </div>
            <div className="rounded-xl bg-[#FEF2F2] px-3 py-3">
              <dt className="text-xs text-[#B91C1C]/70">Lapsed</dt>
              <dd className="font-heading mt-1 text-xl font-bold text-[#B91C1C]">{billing.lapsed}</dd>
            </div>
          </dl>

          {(pipeline.pendingApplications > 0 || billing.pendingReceipts > 0) && (
            <div className="mt-3 space-y-2">
              {pipeline.pendingApplications > 0 ? (
                <Link
                  href="/admin/applications"
                  className="flex min-h-[44px] items-center justify-between rounded-xl bg-[#EFF6FF] px-3.5 text-sm font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE]"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Applications
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {pipeline.pendingApplications}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : null}
              {billing.pendingReceipts > 0 ? (
                <Link
                  href="/admin/payments"
                  className="flex min-h-[44px] items-center justify-between rounded-xl bg-[#FFF7ED] px-3.5 text-sm font-semibold text-[#9A3412] hover:bg-[#FFEDD5]"
                >
                  <span className="inline-flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Receipts
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {billing.pendingReceipts}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
