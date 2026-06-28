"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  MapPin,
  Users,
} from "lucide-react";
import { KoachesMark, KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { AdminSignOutButton } from "@/components/koaches/admin/AdminSignOutButton";
import { CourtStripe } from "@/components/koaches/coach/CourtStripe";
import { NavCountBadge } from "@/components/koaches/coach/NavCountBadge";
import { cn } from "@/lib/utils";
import { navActiveClass } from "@/lib/koaches/coach-colors";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { adminBadgeForNavHref } from "@/lib/koaches/nav-badge-utils";

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/courts", label: "Courts", icon: MapPin },
  { href: "/admin/applications", label: "Applications", icon: FileText },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { counts } = useAdminNavBadges();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white lg:flex">
      <CourtStripe />
      <div className="shrink-0 px-5 py-6">
        <KoachesWordmark />
        <span className="mt-2 inline-block rounded-full bg-[#4F8FF7] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </span>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const badge = adminBadgeForNavHref(item.href, counts);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-heading flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                navActiveClass(pathname, item.href, "exact" in item ? item.exact : false)
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              <NavCountBadge count={badge} />
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-[#E5E7EB] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Signed in as</p>
        <p className="font-heading mt-1 truncate text-sm font-semibold text-[#111827]">PickleKoach Admin</p>
        <AdminSignOutButton className="mt-2 w-full justify-start rounded-xl px-0 py-2 text-[#6B7280] hover:text-[#374151]" />
      </div>
    </aside>
  );
}

export function AdminSidebarCompact() {
  const pathname = usePathname();
  const { counts } = useAdminNavBadges();

  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white md:flex lg:hidden">
      <CourtStripe />
      <div className="flex shrink-0 flex-col items-center py-5">
        <KoachesMark size="sm" />
        <span className="mt-1 text-[8px] font-bold uppercase text-[#4F8FF7]">Admin</span>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-2">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const badge = adminBadgeForNavHref(item.href, counts);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                navActiveClass(pathname, item.href, "exact" in item ? item.exact : false)
              )}
            >
              <Icon className="h-5 w-5" />
              <NavCountBadge count={badge} pinned />
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-[#E5E7EB] p-2">
        <AdminSignOutButton
          showIcon
          label=""
          className="flex h-11 w-full items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F9FAFB]"
        />
      </div>
    </aside>
  );
}
