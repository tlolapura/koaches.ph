"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Menu, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/coaches", label: "Coaches", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/more", label: "More", icon: Menu },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#E5E7EB] bg-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active =
            tab.exact
              ? pathname === tab.href
              : pathname === tab.href ||
                pathname.startsWith(`${tab.href}/`) ||
                (tab.href === "/admin/more" && pathname.startsWith("/admin/courts"));
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "font-heading flex min-h-[44px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold",
                active ? "text-[#E07A5F]" : "text-[#6B7280]"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
