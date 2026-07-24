"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarCheck2, CreditCard, LayoutDashboard, Menu, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavActiveClass } from "@/lib/koaches/coach-colors";
import { NavCountBadge } from "@/components/koaches/coach/NavCountBadge";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { adminBadgeForNavHref } from "@/lib/koaches/nav-badge-utils";
import {
  AdminMoreSheet,
  adminMoreSectionPrefixes,
} from "@/components/koaches/admin/AdminMoreSheet";

const tabs = [
  { id: "home", href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { id: "sessions", href: "/admin/sessions", label: "Sessions", icon: CalendarCheck2 },
  { id: "coaches", href: "/admin/coaches", label: "Coaches", icon: Users },
  { id: "payments", href: "/admin/payments", label: "Pay", icon: CreditCard },
  { id: "more", label: "More", icon: Menu },
] as const;

export function AdminBottomNav() {
  const pathname = usePathname();
  const { counts } = useAdminNavBadges();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="admin-bottom-nav fixed right-0 bottom-0 left-0 z-40 border-t border-[#E5E7EB] bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-[var(--portal-bottom-nav-height)] justify-around py-2">
          {tabs.map((tab) => {
            const isMore = tab.id === "more";
            const active = isMore
              ? adminMoreSectionPrefixes.some((p) => pathname.startsWith(p)) ||
                pathname === "/admin/more" ||
                pathname.startsWith("/admin/more/")
              : "exact" in tab && tab.exact
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const Icon = tab.icon;
            const badge = isMore
              ? adminBadgeForNavHref("/admin/more", counts)
              : adminBadgeForNavHref(tab.href!, counts);
            const className = cn(
              "font-heading relative flex min-h-[44px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold",
              bottomNavActiveClass(pathname, isMore ? "/admin/more" : tab.href!, active)
            );

            if (isMore) {
              return (
                <button key={tab.id} type="button" onClick={() => setMoreOpen(true)} className={className}>
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                    <NavCountBadge count={badge} pinned />
                  </span>
                  {tab.label}
                </button>
              );
            }

            return (
              <Link key={tab.id} href={tab.href!} prefetch className={className}>
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

      <AdminMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
