"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavActiveClass } from "@/lib/koaches/coach-colors";
import { NavCountBadge } from "@/components/koaches/coach/NavCountBadge";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { adminBadgeForNavHref } from "@/lib/koaches/nav-badge-utils";

const tabs = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/applications", label: "Apps", icon: FileText },
  { href: "/admin/courts", label: "Courts", icon: MapPin },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const { counts } = useAdminNavBadges();

  return (
    <nav
      className="admin-bottom-nav fixed right-0 bottom-0 left-0 z-40 border-t border-[#E5E7EB] bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-[var(--portal-bottom-nav-height)] justify-around py-2">
        {tabs.map((tab) => {
          const active =
            tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          const badge = adminBadgeForNavHref(tab.href, counts);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "font-heading relative flex min-h-[44px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold",
                bottomNavActiveClass(pathname, tab.href, active)
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <NavCountBadge count={badge} pinned />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
