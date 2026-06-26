"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCoachPageMeta } from "@/lib/koaches/coach-page-titles";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";

export function CoachMobileHeader() {
  const pathname = usePathname();
  const { title, back } = getCoachPageMeta(pathname);
  const coachId = usePortalCoachId();
  const { coach } = useCoachProfile(coachId);
  const isDashboard = pathname === "/coach/dashboard" || pathname === "/coach";

  return (
    <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-[#FAFAF8]/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {back ? (
          <Link
            href={back.href}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center gap-0.5 pr-1 text-sm font-medium text-[#6B7280]"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
            <span className="sr-only">{back.label}</span>
          </Link>
        ) : null}
        {isDashboard ? (
          <span className="font-heading text-lg font-bold tracking-tight">
            <span className="text-[#E07A5F]">Koaches</span>
            <span className="text-[#1E3A5F]">PH</span>
          </span>
        ) : (
          <h1 className="font-heading truncate text-lg font-semibold text-[#111827]">{title}</h1>
        )}
      </div>
      <Link
        href="/coach/profile"
        className="font-heading flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F] text-xs font-semibold text-white ring-2 ring-white"
        title={coach?.name ?? "Profile"}
      >
        {(coach?.name ?? "?").charAt(0).toUpperCase()}
      </Link>
    </header>
  );
}
