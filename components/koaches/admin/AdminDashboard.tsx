"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, FileText } from "lucide-react";
import type { AdminDashboardData } from "@/lib/koaches/admin-data";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import dynamic from "next/dynamic";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const AdminRevenueChart = dynamic(
  () =>
    import("@/components/koaches/admin/AdminRevenueChart").then((m) => m.AdminRevenueChart),
  {
    ssr: false,
    loading: () => <div className="h-48 animate-pulse rounded-2xl bg-[#E5E7EB]/60" />,
  }
);

type AdminDashboardProps = {
  data: AdminDashboardData;
};

const cardClass =
  "overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80";

function coachInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const hasPending =
    data.pendingApplications > 0 || data.pendingPaymentCount > 0;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Dashboard" className="mb-6" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Coaches",
            value: data.stats.activeCoaches,
            href: "/admin/coaches",
          },
          {
            label: "Sessions",
            value: data.sessionsThisMonth,
            href: "/admin/sessions",
          },
          {
            label: "Revenue",
            value: formatCurrency(data.revenueThisMonth),
          },
          {
            label: "MRR",
            value: formatCurrency(data.mrr),
            href: "/admin/payments",
          },
        ].map((m) => {
          const inner = (
            <div className={cn(cardClass, "p-4", m.href && "transition-colors hover:bg-[#FAFBFC]")}>
              <p className="text-xs font-medium text-[#6B7280]">{m.label}</p>
              <p className="font-heading mt-1.5 text-2xl font-bold text-[#111827]">{m.value}</p>
            </div>
          );
          return m.href ? (
            <Link key={m.label} href={m.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={m.label}>{inner}</div>
          );
        })}
      </div>

      {hasPending ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {data.pendingApplications > 0 ? (
            <Link
              href="/admin/applications"
              className={cn(
                cardClass,
                "flex min-h-[48px] flex-1 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#FAFBFC]"
              )}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <FileText className="h-4 w-4 text-[#4F8FF7]" />
                {data.pendingApplications} application
                {data.pendingApplications === 1 ? "" : "s"}
              </span>
              <ArrowRight className="h-4 w-4 text-[#9CA3AF]" />
            </Link>
          ) : null}
          {data.pendingPaymentCount > 0 ? (
            <Link
              href="/admin/payments"
              className={cn(
                cardClass,
                "flex min-h-[48px] flex-1 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[#FAFBFC]"
              )}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#111827]">
                <CreditCard className="h-4 w-4 text-[#C2410C]" />
                {data.pendingPaymentCount} receipt
                {data.pendingPaymentCount === 1 ? "" : "s"}
              </span>
              <ArrowRight className="h-4 w-4 text-[#9CA3AF]" />
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className={cn(cardClass, "p-5 lg:col-span-2")}>
          <h2 className="font-heading font-semibold text-[#111827]">Revenue</h2>
          <div className="mt-4">
            <AdminRevenueChart data={data.monthlyMetrics} />
          </div>
        </div>

        <div className={cn(cardClass, "p-5")}>
          <h2 className="font-heading font-semibold text-[#111827]">Early bird</h2>
          <p className="font-heading mt-3 text-3xl font-bold text-[#1D4ED8]">
            {data.earlyBirdSlotsUsed}
            <span className="text-lg font-semibold text-[#9CA3AF]">
              /{data.earlyBirdSlotsTotal}
            </span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F3F4F6]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4F8FF7] to-[#16A34A]"
              style={{ width: `${data.earlyBirdPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#6B7280]">
            {data.earlyBirdRemaining} left · ₱299/mo
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className={cn(cardClass, "p-5")}>
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-[#111827]">Applications</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-[#4F8FF7]">
              View all
            </Link>
          </div>
          {data.pendingApps.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B7280]">None pending.</p>
          ) : (
            <ul className="mt-4 space-y-2.5">
              {data.pendingApps.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 ring-1 ring-[#E5E7EB]/60"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-[11px] font-bold text-white">
                      {coachInitials(a.fullName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading truncate font-semibold text-[#111827]">
                        {a.fullName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#9CA3AF]">
                        {formatDisplayDate(a.appliedAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={cn(cardClass, "p-5")}>
          <h2 className="font-heading font-semibold text-[#111827]">Recent</h2>
          {data.recentActivity.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B7280]">No activity yet.</p>
          ) : (
            <ul className="mt-4">
              {data.recentActivity.map((a, i) => (
                <li
                  key={a.id}
                  className={cn("py-3", i > 0 && "border-t border-[#F3F4F6]")}
                >
                  <p className="text-sm font-medium text-[#111827]">{a.label}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{a.time}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
