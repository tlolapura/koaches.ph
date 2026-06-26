"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  PhilippinePeso,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AdminDashboardData } from "@/lib/koaches/admin-data";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { AdminRevenueChart } from "@/components/koaches/admin/AdminRevenueChart";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type AdminDashboardProps = {
  data: AdminDashboardData;
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
  const inner = (
    <div className="coach-card flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEEE9]">
          <Icon className="h-5 w-5 text-[#8B4D3A]" />
        </div>
        {href && <ArrowRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />}
      </div>
      <p className="font-heading mt-3 text-2xl font-bold leading-none text-[#1E3A5F]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#6B7280]">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{sub}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full transition-transform active:scale-[0.98]">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <AdminPageShell wide>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Platform overview"
        className="mb-6"
      />

      <div className="coach-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="md:hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Platform overview
            </p>
            <p className="font-heading mt-1 text-2xl font-bold text-[#111827]">Koaches Admin</p>
          </div>
          <div className="rounded-xl bg-[#1E3A5F] px-4 py-3 text-right text-white md:ml-auto">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">MRR</p>
            <p className="font-heading text-2xl font-bold">{formatCurrency(data.mrr)}</p>
            <p className="text-xs text-white/60">{data.stats.activeCoaches} active coaches</p>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Active coaches"
          value={data.stats.activeCoaches}
          sub={`${data.stats.totalCoaches} total`}
          href="/admin/coaches"
        />
        <StatCard
          icon={MapPin}
          label="Courts"
          value={data.courtCount}
          sub="Platform directory"
          href="/admin/courts"
        />
        <StatCard
          icon={Users}
          label="Students"
          value={data.stats.totalStudents}
          sub="Across all coaches"
        />
        <StatCard
          icon={Calendar}
          label="Sessions this month"
          value={data.sessionsThisMonth}
          sub={`${data.stats.totalSessions} all-time`}
        />
        <StatCard
          icon={PhilippinePeso}
          label="Revenue this month"
          value={formatCurrency(data.revenueThisMonth)}
          sub={`${formatCurrency(data.totalRevenue)} total`}
        />
        <StatCard
          icon={FileText}
          label="Pending applications"
          value={data.pendingApplications}
          sub="Awaiting review"
          href="/admin/applications"
        />
        <StatCard
          icon={TrendingUp}
          label="Progress cards"
          value={data.stats.progressCardsGenerated}
          sub={`${data.stats.certificatesGenerated} certificates`}
        />
        <StatCard
          icon={CreditCard}
          label="MRR"
          value={formatCurrency(data.mrr)}
          sub="Monthly recurring"
          href="/admin/coaches"
        />
      </div>

      {/* Chart + sidebar panels */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="coach-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-heading font-semibold text-[#111827]">Session revenue</h2>
              <p className="text-sm text-[#6B7280]">Completed sessions — last 6 months</p>
            </div>
            <Link href="/admin/coaches" className="text-sm font-semibold text-[#E07A5F]">
              Manage coaches →
            </Link>
          </div>
          <div className="mt-4">
            <AdminRevenueChart data={data.monthlyMetrics} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="coach-card p-5">
            <h2 className="font-heading font-semibold text-[#111827]">Early bird slots</h2>
            <p className="mt-1 text-sm text-[#6B7280]">₱299/mo founding coach pricing</p>
            <p className="font-heading mt-4 text-3xl font-bold text-[#1E3A5F]">
              {data.earlyBirdSlotsUsed}
              <span className="text-lg font-semibold text-[#9CA3AF]">
                /{data.earlyBirdSlotsTotal}
              </span>
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full bg-[#E07A5F] transition-all"
                style={{ width: `${data.earlyBirdPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              {data.earlyBirdRemaining} slots remaining · {data.earlyBirdPercent}% filled
            </p>
          </div>

          <div className="coach-card p-5">
            <h2 className="font-heading font-semibold text-[#111827]">Quick actions</h2>
            <div className="mt-3 space-y-2">
              {[
                { href: "/admin/applications", label: "Review applications" },
                { href: "/admin/coaches", label: "Manage coaches & billing" },
                { href: "/admin/courts", label: "Add a court" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex min-h-[40px] items-center justify-between rounded-xl bg-[#FDEEE9] px-3 text-sm font-semibold text-[#8B4D3A] transition-colors hover:bg-[#F9E0D8]"
                >
                  {a.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending + activity */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="coach-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-[#111827]">Pending applications</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-[#E07A5F]">
              View all
            </Link>
          </div>
          {data.pendingApps.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B7280]">No pending applications.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.pendingApps.map((a) => (
                <li key={a.id} className="rounded-xl border border-[#E5E7EB] p-3">
                  <p className="font-heading font-semibold">{a.fullName}</p>
                  <p className="line-clamp-2 text-sm text-[#6B7280]">{a.bio}</p>
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    {a.currentStudentCount} students · applied {formatDisplayDate(a.appliedAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="coach-card p-5">
          <h2 className="font-heading font-semibold text-[#111827]">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-[#6B7280]">Activity will appear as coaches run sessions.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="activity-item">
                  <p className="text-sm font-medium text-[#111827]">{a.label}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{a.time}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Coaches table */}
      <section className="coach-card mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] p-5">
          <div>
            <h2 className="font-heading font-semibold text-[#111827]">All coaches</h2>
            <p className="text-sm text-[#6B7280]">Revenue and activity this month</p>
          </div>
          <Link href="/admin/coaches" className="coach-btn-primary w-auto px-5 py-2.5 text-sm">
            Manage coaches
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                <th className="px-5 py-3">Coach</th>
                <th className="px-5 py-3">Students</th>
                <th className="px-5 py-3">Sessions</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Courts</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.coachSummaries.map((c) => (
                <tr key={c.id} className="border-t border-[#E5E7EB]">
                  <td className="px-5 py-3">
                    <p className="font-heading font-semibold">{c.name}</p>
                    <p className="text-xs text-[#6B7280]">koaches.ph/{c.slug}</p>
                  </td>
                  <td className="px-5 py-3">{c.students}</td>
                  <td className="px-5 py-3">{c.sessionsThisMonth}</td>
                  <td className="px-5 py-3 font-semibold text-[#1E3A5F]">
                    {formatCurrency(c.revenueThisMonth)}
                  </td>
                  <td className="px-5 py-3 capitalize">{c.subscriptionPlan.replace("-", " ")}</td>
                  <td className="px-5 py-3">{c.courtCount}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        c.isActive ? "bg-[#E5EFE8] text-[#3D5C47]" : "bg-[#F3F4F6] text-[#6B7280]"
                      )}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}
