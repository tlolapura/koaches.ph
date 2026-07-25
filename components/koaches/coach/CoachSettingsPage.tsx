"use client";

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

      <CoachChangePasswordCard />

      <LegalSettingsSection className="mt-4" />

      <CoachSignOutButton className="coach-btn-ghost-danger mt-6 w-full" />
    </CoachPageShell>
  );
}
