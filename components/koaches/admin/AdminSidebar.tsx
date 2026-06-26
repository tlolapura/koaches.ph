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
import { cn } from "@/lib/utils";

export const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/courts", label: "Courts", icon: MapPin },
  { href: "/admin/applications", label: "Applications", icon: FileText },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white lg:flex">
      <div className="shrink-0 px-5 py-6">
        <KoachesWordmark />
        <span className="mt-2 inline-block rounded-full bg-[#1E3A5F] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </span>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
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
      <div className="shrink-0 border-t border-[#E5E7EB] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Signed in as</p>
        <p className="font-heading mt-1 truncate text-sm font-semibold text-[#111827]">Koaches Admin</p>
      </div>
    </aside>
  );
}

export function AdminSidebarCompact() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB] bg-white md:flex lg:hidden">
      <div className="flex shrink-0 flex-col items-center py-5">
        <KoachesMark size="sm" />
        <span className="mt-1 text-[8px] font-bold uppercase text-[#1E3A5F]">Admin</span>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col items-center gap-2 overflow-y-auto px-2">
        {adminNavItems.map((item) => {
          const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
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
    </aside>
  );
}
