"use client";

import { getInitials } from "@/lib/koaches/constants";
import { adminNavItems } from "@/components/koaches/admin/AdminSidebar";

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
    <header className="sticky top-0 z-30 flex min-h-[56px] items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]/95 px-4 py-3 backdrop-blur md:hidden">
      <h1 className="font-heading text-lg font-semibold text-[#111827]">{title}</h1>
      <div
        className="font-heading flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3A5F] text-sm font-semibold text-white"
        title="Koaches Admin"
      >
        {getInitials("Koaches Admin")}
      </div>
    </header>
  );
}
