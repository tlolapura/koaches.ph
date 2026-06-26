"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, CreditCard, Share2, TrendingUp, User } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachSignOutButton } from "@/components/koaches/coach/CoachSignOutButton";
import { useProgressCards } from "@/hooks/useProgressCards";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/coach/progress",
    label: "Progress cards",
    icon: TrendingUp,
    desc: "Sessions rated — ready to share",
  },
  {
    href: "/coach/social",
    label: "Social",
    icon: Share2,
    desc: "Story images for open slots",
  },
  {
    href: "/coach/billing",
    label: "Billing",
    icon: CreditCard,
    desc: "Subscription, invoices, and receipts",
  },
  {
    href: "/coach/profile",
    label: "Profile",
    icon: User,
    desc: "Bio, rates, hours, public page",
  },
] as const;

export default function MorePage() {
  const coachId = usePortalCoachId();
  const pathname = usePathname();
  const { candidates } = useProgressCards(coachId);

  return (
    <CoachPageShell className="pb-8">
      <CoachPageHeader title="More" subtitle="Progress, social, and account" />

      <div className="mt-6 space-y-2">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          const badge = l.href === "/coach/progress" && candidates.length > 0 ? candidates.length : null;

          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "coach-card flex min-h-[64px] items-center gap-4 p-4 transition-colors",
                active && "ring-2 ring-[#16A34A]/30"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
                <Icon className="h-5 w-5 text-[#166534]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-semibold text-[#111827]">{l.label}</p>
                  {badge != null && (
                    <span className="rounded-full bg-[#16A34A] px-2 py-0.5 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B7280]">{l.desc}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-[#D1D5DB]" />
            </Link>
          );
        })}
      </div>

      <CoachSignOutButton className="coach-card mt-8 w-full min-h-[52px] rounded-2xl p-4 text-[#6B7280] hover:bg-[#F9FAFB] lg:hidden" />
    </CoachPageShell>
  );
}
