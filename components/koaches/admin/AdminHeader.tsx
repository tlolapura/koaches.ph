"use client";

import { getInitials } from "@/lib/koaches/constants";
import { adminNavItems } from "@/components/koaches/admin/AdminSidebar";
import { AdminNotificationBell } from "@/components/koaches/admin/AdminNotificationBell";
import { CourtStripe } from "@/components/koaches/coach/CourtStripe";

const titles: Record<string, string> = Object.fromEntries(
  adminNavItems.map((item) => [item.href, item.label])
);
titles["/admin/more"] = "More";

export function AdminHeader({ pathname }: { pathname: string }) {
  const title =
    Object.entries(titles).find(([path]) =>
      path === "/admin" ? pathname === "/admin" : pathname === path || pathname.startsWith(`${path}/`)
    )?.[1] ?? "Admin";

  return (
    <header className="sticky top-0 z-30 md:hidden">
      <div className="flex min-h-[56px] items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]/95 px-4 py-3 backdrop-blur">
        <h1 className="font-heading text-lg font-semibold text-[#111827]">{title}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <AdminNotificationBell />
          <div
            className="font-heading flex h-10 w-10 items-center justify-center rounded-full bg-[#4F8FF7] text-sm font-semibold text-white"
            title="Koaches Admin"
          >
            {getInitials("Koaches Admin")}
          </div>
        </div>
      </div>
      <CourtStripe />
    </header>
  );
}
