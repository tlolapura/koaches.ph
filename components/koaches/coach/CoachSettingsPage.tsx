"use client";

import Link from "next/link";
import { ChevronRight, CreditCard } from "lucide-react";
import { useCoachAuth } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachChangePasswordCard } from "@/components/koaches/coach/CoachChangePasswordCard";
import { CoachSignOutButton } from "@/components/koaches/coach/CoachSignOutButton";
import { LegalSettingsSection } from "@/components/koaches/shared/LegalSettingsSection";

export function CoachSettingsPage() {
  const { email } = useCoachAuth();

  return (
    <CoachPageShell>
      <CoachPageHeader title="Settings" subtitle="Account, billing, and the fine print" />

      {email ? (
        <div className="coach-card mt-6 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Signed in as</p>
          <p className="mt-1 text-sm font-medium text-[#111827]">{email}</p>
        </div>
      ) : null}

      <div className="coach-card mt-4 overflow-hidden p-4">
        <p className="font-heading font-semibold text-[#111827]">Billing</p>
        <p className="mt-1 text-sm text-[#6B7280]">Subscription, invoices, and payment receipts</p>
        <Link
          href="/coach/settings/billing"
          className="mt-3 flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F9FAFB]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0FDF4]">
              <CreditCard className="h-4 w-4 text-[#166534]" />
            </span>
            Manage billing
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
        </Link>
      </div>

      <CoachChangePasswordCard />

      <LegalSettingsSection className="mt-4" />

      <CoachSignOutButton className="coach-btn-ghost-danger mt-6 w-full" />
    </CoachPageShell>
  );
}
