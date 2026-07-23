"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Settings, Share2, User, Users } from "lucide-react";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSignOutButton } from "@/components/koaches/coach/CoachSignOutButton";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/coach/clinics",
    label: "Clinics",
    icon: Users,
    desc: "Group clinics with one roster across every day",
  },
  {
    href: "/coach/programs",
    label: "Programs",
    icon: FileText,
    desc: "Packages and skill lists you reuse with students",
  },
  {
    href: "/coach/social",
    label: "Social",
    icon: Share2,
    desc: "Share open court time on Instagram or Facebook",
  },
  {
    href: "/coach/profile",
    label: "Profile",
    icon: User,
    desc: "Your public page, rates, and hours",
  },
  {
    href: "/coach/settings",
    label: "Settings",
    icon: Settings,
    desc: "Account, billing, and the fine print",
  },
] as const;

type CoachMoreSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CoachMoreSheet({ open, onClose }: CoachMoreSheetProps) {
  const pathname = usePathname();

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="More"
      subtitle="Clinics, programs, and the rest of your tools"
    >
      <div className="space-y-2">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);

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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
                <Icon className="h-5 w-5 text-[#166534]" />
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
        <CoachSignOutButton
          className="coach-btn-ghost-danger w-full"
          aria-label="Sign out of coach account"
        />
      </div>
    </CoachBottomSheet>
  );
}
