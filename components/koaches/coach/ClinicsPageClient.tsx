"use client";

import { useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { AddClinicSheet } from "@/components/koaches/coach/AddClinicSheet";
import { CoachFab, EmptyState } from "@/components/koaches/coach/CoachUi";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachClinicListSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { useCoachClinics } from "@/hooks/useCoachClinics";
import { clinicExpectedRevenue, formatClinicPriceSummary } from "@/lib/koaches/clinic-pricing";
import { formatCurrency } from "@/lib/utils";

export function ClinicsPageClient() {
  const coachId = usePortalCoachId();
  const { clinics, loading } = useCoachClinics(coachId);
  const [createOpen, setCreateOpen] = useState(false);

  if (!coachId || loading) return <CoachClinicListSkeleton />;

  const active = clinics.filter((c) => c.status !== "canceled");

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Clinics"
        subtitle="Multi-hour and multi-day group clinics"
      />

      {active.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="No clinics yet"
            description="Create a group clinic with one or more dates, then add players from your roster."
            action={
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="coach-btn-primary max-w-xs"
              >
                Create clinic
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {active.map((clinic) => (
            <Link key={clinic.id} href={`/coach/clinics/${clinic.id}`} className="coach-card block p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-[#111827]">{clinic.name}</p>
                  {clinic.focus ? (
                    <p className="mt-0.5 text-sm text-[#6B7280]">{clinic.focus}</p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-[#9CA3AF]">
                    {clinic.enrolledStudentIds.length}/{clinic.capacity} enrolled ·{" "}
                    {formatClinicPriceSummary(clinic)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    clinic.status === "done"
                      ? "bg-[#E5EFE8] text-[#3D5C47]"
                      : clinic.status === "draft"
                        ? "bg-[#F3F4F6] text-[#6B7280]"
                        : "bg-[#EDE9FE] text-[#5B21B6]"
                  }`}
                >
                  {clinic.status}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#14532D]">
                {formatCurrency(clinicExpectedRevenue(clinic))}{" "}
                <span className="text-xs font-medium text-[#9CA3AF]">expected</span>
              </p>
            </Link>
          ))}
        </div>
      )}

      <CoachFab onClick={() => setCreateOpen(true)} label="New clinic" />
      <AddClinicSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </CoachPageShell>
  );
}
