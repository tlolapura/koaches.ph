"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, FileText, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavActiveClass } from "@/lib/koaches/coach-colors";
import { NavCountBadge } from "@/components/koaches/coach/NavCountBadge";
import { useCoachNavBadges } from "@/hooks/useCoachNavBadges";
import { coachBadgeForNavHref } from "@/lib/koaches/nav-badge-utils";

const tabs = [
  { href: "/coach/dashboard", label: "Home", icon: Home },
  { href: "/coach/sessions", label: "Schedule", icon: CalendarDays },
  { href: "/coach/students", label: "Students", icon: Users },
  { href: "/coach/programs", label: "Programs", icon: FileText },
  { href: "/coach/more", label: "More", icon: Menu },
];

export function CoachBottomNav() {
  const pathname = usePathname();
  const { counts } = useCoachNavBadges();

  return (
    <nav
      className="coach-bottom-nav fixed right-0 bottom-0 left-0 z-40 border-t border-[#E5E7EB] bg-white lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href ||
            (tab.href === "/coach/dashboard" && pathname === "/coach") ||
            (tab.href !== "/coach/dashboard" && tab.href !== "/coach/more" && pathname.startsWith(tab.href)) ||
            (tab.href === "/coach/more" &&
              ["/coach/profile", "/coach/social", "/coach/billing"].some((p) =>
                pathname.startsWith(p)
              ));
          const Icon = tab.icon;
          const badge = coachBadgeForNavHref(tab.href, counts);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch
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
