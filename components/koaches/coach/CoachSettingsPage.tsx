"use client";

import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { useCoachAuth } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachChangePasswordCard } from "@/components/koaches/coach/CoachChangePasswordCard";
import { CoachSignOutButton } from "@/components/koaches/coach/CoachSignOutButton";
import { LegalSettingsSection } from "@/components/koaches/shared/LegalSettingsSection";

export function CoachSettingsPage() {
  const { email } = useCoachAuth();

  return (
    <CoachPageShell>
      <CoachPageHeader title="Settings" subtitle="Account and the fine print" />

      {email ? (
        <div className="coach-card mt-6 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Signed in as</p>
          <p className="mt-1 text-sm font-medium text-[#111827]">{email}</p>
        </div>
      ) : null}

      <Link
        href="/coach/guide"
        prefetch={false}
        className="coach-card mt-4 flex min-h-[64px] items-center gap-4 p-4 transition-colors hover:bg-[#F9FAFB]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <BookOpen className="h-5 w-5 text-[#1D4ED8]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-[#111827]">Coach guide</p>
          <p className="text-xs text-[#6B7280]">How the app works, in plain words</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-[#D1D5DB]" />
      </Link>

      <CoachChangePasswordCard />

      <LegalSettingsSection className="mt-4" />

      <CoachSignOutButton className="coach-btn-ghost-danger mt-6 w-full" />
    </CoachPageShell>
  );
}
