"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays, BarChart3, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { bottomNavActiveClass } from "@/lib/koaches/coach-colors";
import { CoachMoreSheet } from "@/components/koaches/coach/CoachMoreSheet";

const tabs = [
  { id: "home", href: "/coach/dashboard", label: "Home", icon: Home },
  { id: "schedule", href: "/coach/sessions", label: "Schedule", icon: CalendarDays },
  { id: "students", href: "/coach/students", label: "Students", icon: Users },
  { id: "reports", href: "/coach/reports", label: "Reports", icon: BarChart3 },
  { id: "more", label: "More", icon: Menu },
] as const;

const moreSectionPrefixes = ["/coach/profile", "/coach/social", "/coach/billing", "/coach/programs"];

export function CoachBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className="coach-bottom-nav fixed right-0 bottom-0 left-0 z-40 border-t border-[#E5E7EB] bg-white md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-[var(--portal-bottom-nav-height)] justify-around py-2">
          {tabs.map((tab) => {
            const isMore = tab.id === "more";
            const active = isMore
              ? moreSectionPrefixes.some((p) => pathname.startsWith(p))
              : tab.href === "/coach/dashboard"
                ? pathname === tab.href || pathname === "/coach"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            const Icon = tab.icon;
            const className = cn(
              "font-heading relative flex min-h-[44px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold",
              bottomNavActiveClass(pathname, isMore ? "/coach/more" : tab.href!, active)
            );

            if (isMore) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className={className}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  </span>
                  {tab.label}
                </button>
              );
            }

            return (
              <Link key={tab.id} href={tab.href!} prefetch={false} className={className}>
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <CoachMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
