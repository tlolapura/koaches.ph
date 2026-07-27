"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, MapPin, TrendingUp } from "lucide-react";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { AdminSignOutButton } from "@/components/koaches/admin/AdminSignOutButton";
import { NavCountBadge } from "@/components/koaches/coach/NavCountBadge";
import { useAdminNavBadges } from "@/hooks/useAdminNavBadges";
import { adminBadgeForNavHref } from "@/lib/koaches/nav-badge-utils";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/courts", label: "Courts", icon: MapPin },
] as const;

export const adminMoreSectionPrefixes = links.map((l) => l.href);

type AdminMoreSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminMoreSheet({ open, onClose }: AdminMoreSheetProps) {
  const pathname = usePathname();
  const { counts } = useAdminNavBadges();

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="More"
    >
      <div className="space-y-2">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const badge = adminBadgeForNavHref(l.href, counts);

          return (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              onClick={onClose}
              className={cn(
                "coach-card flex min-h-[52px] items-center gap-4 px-4 py-3 transition-colors",
                active && "ring-2 ring-[#16A34A]/30"
              )}
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
                <Icon className="h-5 w-5 text-[#166534]" />
                <NavCountBadge count={badge} pinned />
              </div>
              <p className="font-heading min-w-0 flex-1 font-semibold text-[#111827]">{l.label}</p>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#D1D5DB]" />
            </Link>
          );
        })}
      </div>

      <div className="mt-4 border-t border-[#E5E7EB] pt-3">
        <AdminSignOutButton className="coach-btn-ghost-danger w-full" />
      </div>
    </CoachBottomSheet>
  );
}
