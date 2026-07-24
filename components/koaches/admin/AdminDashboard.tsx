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

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
  tone = "green",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: "green" | "blue" | "amber";
}) {
  const iconWrap =
    tone === "blue"
      ? "bg-[#EFF6FF] text-[#1D4ED8]"
      : tone === "amber"
        ? "bg-[#FFF7ED] text-[#C2410C]"
        : "bg-[#F0FDF4] text-[#166534]";
  const valueColor =
    tone === "blue"
      ? "text-[#1D4ED8]"
      : tone === "amber"
        ? "text-[#9A3412]"
        : "text-[#14532D]";

  const inner = (
    <div className={cn(cardClass, "flex h-full flex-col p-4 transition-colors hover:bg-[#FAFBFC]")}>
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
        {href && <ArrowRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" />}
      </div>
      <p className={cn("font-heading mt-3 text-2xl font-bold leading-none", valueColor)}>{value}</p>
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

function coachInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <AdminPageShell>
      <AdminPageHeader title="Dashboard" subtitle="Platform overview" className="mb-6" />

      <div className={cn(cardClass, "relative overflow-hidden p-5 sm:p-6")}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F0FDF4] via-transparent to-[#EFF6FF]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              PickleKoach Admin
            </p>
            <p className="font-heading mt-1 text-2xl font-bold text-[#111827] sm:text-3xl">
              Platform overview
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {data.stats.activeCoaches} active coaches · {data.courtCount} courts
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] px-5 py-4 text-right text-white shadow-lg shadow-[#16A34A]/20">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">MRR</p>
            <p className="font-heading text-2xl font-bold sm:text-3xl">{formatCurrency(data.mrr)}</p>
            <p className="text-xs text-white/70">{data.stats.activeCoaches} active coaches</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Active coaches"
          value={data.stats.activeCoaches}
          sub={`${data.stats.totalCoaches} total`}
          href="/admin/coaches"
          tone="green"
        />
        <StatCard
          icon={MapPin}
          label="Courts"
          value={data.courtCount}
          sub="Platform directory"
          href="/admin/courts"
          tone="blue"
        />
        <StatCard
          icon={Users}
          label="Students"
          value={data.stats.totalStudents}
          sub="Across all coaches"
          tone="green"
        />
        <StatCard
          icon={Calendar}
          label="Sessions this month"
          value={data.sessionsThisMonth}
          sub={`${data.stats.totalSessions} all-time`}
          href="/admin/sessions"
          tone="blue"
        />
        <StatCard
          icon={PhilippinePeso}
          label="Revenue this month"
          value={formatCurrency(data.revenueThisMonth)}
          sub={`${formatCurrency(data.totalRevenue)} total`}
          tone="green"
        />
        <StatCard
          icon={FileText}
          label="Pending applications"
          value={data.pendingApplications}
          sub="Awaiting review"
          href="/admin/applications"
          tone={data.pendingApplications > 0 ? "amber" : "blue"}
        />
        {data.pendingPaymentCount > 0 && (
          <StatCard
            icon={CreditCard}
            label="Payment receipts"
            value={data.pendingPaymentCount}
            sub="Awaiting approval"
            href="/admin/payments"
            tone="amber"
          />
        )}
        <StatCard
          icon={TrendingUp}
          label="Progress cards"
          value={data.stats.progressCardsGenerated}
          sub={`${data.stats.certificatesGenerated} certificates`}
          href="/admin/sessions"
          tone="blue"
        />
        <StatCard
          icon={CreditCard}
          label="MRR"
          value={formatCurrency(data.mrr)}
          sub="Monthly recurring"
          href="/admin/payments"
          tone="green"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className={cn(cardClass, "p-5 lg:col-span-2")}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-heading font-semibold text-[#111827]">Session revenue</h2>
              <p className="text-sm text-[#6B7280]">Completed sessions — last 6 months</p>
            </div>
            <Link
              href="/admin/coaches"
              className="hidden text-sm font-semibold text-[#4F8FF7] hover:underline sm:inline"
            >
              Manage coaches →
            </Link>
          </div>
          <div className="mt-4">
            <AdminRevenueChart data={data.monthlyMetrics} />
          </div>
        </div>

        <div className="space-y-4">
          <div className={cn(cardClass, "p-5")}>
            <h2 className="font-heading font-semibold text-[#111827]">Early bird slots</h2>
            <p className="mt-1 text-sm text-[#6B7280]">₱299/mo founding coach pricing</p>
            <p className="font-heading mt-4 text-3xl font-bold text-[#1D4ED8]">
              {data.earlyBirdSlotsUsed}
              <span className="text-lg font-semibold text-[#9CA3AF]">
                /{data.earlyBirdSlotsTotal}
              </span>
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#F3F4F6]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4F8FF7] to-[#16A34A] transition-all"
                style={{ width: `${data.earlyBirdPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              {data.earlyBirdRemaining} slots remaining · {data.earlyBirdPercent}% filled
            </p>
          </div>

          <div className={cn(cardClass, "p-5")}>
            <h2 className="font-heading font-semibold text-[#111827]">Quick actions</h2>
            <div className="mt-3 space-y-2">
              {[
                { href: "/admin/sessions", label: "Review sessions", tone: "green" as const },
                { href: "/admin/analytics", label: "View analytics", tone: "green" as const },
                { href: "/admin/applications", label: "Review applications", tone: "blue" as const },
                { href: "/admin/coaches", label: "Manage coaches", tone: "green" as const },
                {
                  href: "/admin/payments",
                  label:
                    data.pendingPaymentCount > 0
                      ? `Review ${data.pendingPaymentCount} payment receipt${data.pendingPaymentCount === 1 ? "" : "s"}`
                      : "Review payments",
                  tone: "blue" as const,
                },
                { href: "/admin/courts", label: "Add a court", tone: "green" as const },
              ].map((a) => (
                <Link
                  key={`${a.href}-${a.label}`}
                  href={a.href}
                  className={cn(
                    "flex min-h-[44px] items-center justify-between rounded-xl px-3.5 text-sm font-semibold transition-colors",
                    a.tone === "green"
                      ? "bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7]"
                      : "bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
                  )}
                >
                  {a.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {data.pendingPaymentCount > 0 && (
          <section className={cn(cardClass, "border-0 p-5 ring-[#86EFAC]/60 lg:col-span-2")}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
                  <CreditCard className="h-5 w-5 text-[#166534]" />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-[#111827]">
                    Pending payment receipts
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {data.pendingPaymentCount} receipt
                    {data.pendingPaymentCount === 1 ? " needs" : "s need"} review.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/payments"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D] sm:w-auto"
              >
                Review now
              </Link>
            </div>
          </section>
        )}

        <section className={cn(cardClass, "p-5")}>
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-[#111827]">Pending applications</h2>
            <Link href="/admin/applications" className="text-sm font-semibold text-[#4F8FF7]">
              View all
            </Link>
          </div>
          {data.pendingApps.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B7280]">No pending applications.</p>
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
                      <p className="line-clamp-2 text-sm text-[#6B7280]">{a.bio}</p>
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        {a.currentStudentCount} students · applied{" "}
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
          <h2 className="font-heading font-semibold text-[#111827]">Recent activity</h2>
          {data.recentActivity.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B7280]">
              Activity will appear as coaches run sessions.
            </p>
          ) : (
            <ul className="mt-4 space-y-0">
              {data.recentActivity.map((a, i) => (
                <li
                  key={a.id}
                  className={cn(
                    "py-3",
                    i > 0 && "border-t border-[#F3F4F6]"
                  )}
                >
                  <p className="text-sm font-medium text-[#111827]">{a.label}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{a.time}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={cn(cardClass, "mt-4")}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3F4F6] p-5">
          <div>
            <h2 className="font-heading font-semibold text-[#111827]">All coaches</h2>
            <p className="text-sm text-[#6B7280]">Revenue and activity this month</p>
          </div>
          <Link
            href="/admin/coaches"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D]"
          >
            Manage coaches
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-[#FAFBFC] text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
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
                <tr key={c.id} className="border-t border-[#F3F4F6] hover:bg-[#FAFBFC]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-[10px] font-bold text-white">
                        {coachInitials(c.name)}
                      </div>
                      <div>
                        <p className="font-heading font-semibold">
                          <Link href="/admin/coaches" className="hover:text-[#4F8FF7]">
                            {c.name}
                          </Link>
                        </p>
                        <Link
                          href={`/coach/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#6B7280] hover:text-[#4F8FF7]"
                        >
                          /coach/{c.slug}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{c.students}</td>
                  <td className="px-5 py-3">{c.sessionsThisMonth}</td>
                  <td className="px-5 py-3 font-semibold text-[#1D4ED8]">
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
