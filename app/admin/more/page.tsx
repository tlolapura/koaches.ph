import Link from "next/link";
import { ChevronRight, FileText, MapPin, TrendingUp } from "lucide-react";
import { AdminSignOutButton } from "@/components/koaches/admin/AdminSignOutButton";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";

const links = [
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: TrendingUp,
    desc: "Validation metrics and trends",
    tone: "green" as const,
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
    desc: "Review coach applications",
    tone: "blue" as const,
  },
  {
    href: "/admin/courts",
    label: "Courts",
    icon: MapPin,
    desc: "Platform court directory",
    tone: "blue" as const,
  },
];

export default function AdminMorePage() {
  return (
    <AdminPageShell>
      <AdminPageHeader title="More" subtitle="Additional admin tools" className="mb-6" />

      <div className="space-y-3">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-[72px] items-center gap-4 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80 transition-colors hover:bg-[#FAFBFC]"
            >
              <div
                className={
                  l.tone === "green"
                    ? "flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0FDF4]"
                    : "flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]"
                }
              >
                <Icon
                  className={
                    l.tone === "green" ? "h-5 w-5 text-[#166534]" : "h-5 w-5 text-[#1D4ED8]"
                  }
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold text-[#111827]">{l.label}</p>
                <p className="text-xs text-[#6B7280]">{l.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#9CA3AF]" />
            </Link>
          );
        })}
      </div>

      <AdminSignOutButton className="coach-btn-ghost-danger mt-8 w-full" />
    </AdminPageShell>
  );
}
