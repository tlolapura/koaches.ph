"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  CalendarDays,
  FileText,
  Share2,
  CreditCard,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCoachAuth } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { CoachSignOutButton } from "@/components/koaches/coach/CoachSignOutButton";
import { KoachesWordmark, KoachesMark } from "@/components/koaches/coach/CoachIcons";

const navItems = [
  { href: "/coach/dashboard", label: "Dashboard", icon: Home },
  { href: "/coach/sessions", label: "Schedule", icon: CalendarDays },
  { href: "/coach/students", label: "Students", icon: Users },
  { href: "/coach/programs", label: "Programs", icon: FileText },
  { href: "/coach/social", label: "Social", icon: Share2 },
  { href: "/coach/billing", label: "Billing", icon: CreditCard },
  { href: "/coach/profile", label: "Profile", icon: User },
];

function coachInitial(name: string) {
  return name.replace(/^Coach\s+/i, "").charAt(0).toUpperCase() || "?";
}

function SidebarAccount() {
  const { coachId, email } = useCoachAuth();
  const { coach } = useCoachProfile(coachId);
  const displayName = coach?.name.replace(/^Coach\s+/i, "") ?? "Coach";

  return (
    <div className="border-t border-[#E5E7EB] p-3">
      <Link
        href="/coach/profile"
        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#F9FAFB]"
      >
        <span className="font-heading flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F] text-sm font-semibold text-white">
          {coachInitial(coach?.name ?? "?")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-[#111827]">{displayName}</p>
          <p className="truncate text-xs text-[#9CA3AF]">{email ?? "View profile"}</p>
        </div>
      </Link>
      <CoachSignOutButton
        className="mt-1 w-full rounded-xl px-3 py-2 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#374151]"
      />
    </div>
  );
}

export function CoachSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white lg:flex">
      <div className="shrink-0 px-5 py-6">
        <KoachesWordmark />
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-heading flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                active ? "bg-[#E07A5F] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0">
        <SidebarAccount />
      </div>
    </aside>
  );
}

export function CoachSidebarCompact() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white md:flex lg:hidden">
      <div className="flex shrink-0 justify-center py-5">
        <KoachesMark size="sm" />
      </div>
      <nav className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                active ? "bg-[#E07A5F] text-white" : "text-[#6B7280] hover:bg-[#F9FAFB]"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-[#E5E7EB] p-2">
        <CoachSignOutButton
          showIcon
          label=""
          aria-label="Sign out"
          className="flex h-11 w-full items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F9FAFB]"
        />
      </div>
    </aside>
  );
}
