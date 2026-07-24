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
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: TrendingUp,
    desc: "Validation metrics and trends",
  },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
    desc: "Review coach applications",
  },
  {
    href: "/admin/courts",
    label: "Courts",
    icon: MapPin,
    desc: "Platform court directory",
  },
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
      subtitle="Analytics, applications, and courts"
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
                "coach-card flex min-h-[64px] items-center gap-4 p-4 transition-colors",
                active && "ring-2 ring-[#16A34A]/30"
              )}
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
                <Icon className="h-5 w-5 text-[#166534]" />
                <NavCountBadge count={badge} pinned />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold text-[#111827]">{l.label}</p>
                <p className="text-xs text-[#6B7280]">{l.desc}</p>
              </div>
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
