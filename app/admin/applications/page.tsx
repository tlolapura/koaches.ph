"use client";

import { useEffect, useState } from "react";
import {
  fetchApplicationsAction,
  rejectApplicationAction,
  type ApproveCoachApplicationResult,
} from "@/lib/koaches/actions/applications";
import { ApproveCoachApplicationSheet } from "@/components/koaches/admin/ApproveCoachApplicationSheet";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { AdminApplicationListSkeleton } from "@/components/koaches/admin/AdminSkeletons";
import { SKILL_RUBRICS } from "@/lib/koaches/program-templates";
import type { CoachApplication } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

const tabs = ["pending", "approved", "rejected"] as const;

function socialLinks(app: CoachApplication) {
  return [app.instagram, app.facebook].filter(Boolean) as string[];
}

export default function ApplicationsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [apps, setApps] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<CoachApplication | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    void fetchApplicationsAction(tab).then((data) => {
      setApps(data);
      setLoading(false);
    });
  }, [tab]);

  const handleApproved = (result: Extract<ApproveCoachApplicationResult, { ok: true }>) => {
    if (approveTarget) {
      setApps((prev) => prev.filter((a) => a.id !== approveTarget.id));
    }
    setSuccessMessage(
      `${approveTarget?.fullName ?? "Coach"} approved. Login: ${result.loginEmail} · profile /coach/${result.slug}`
    );
    setApproveTarget(null);
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
    try {
      await rejectApplicationAction(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setRejectingId(null);
    }
  };

  if (loading) {
    return <AdminApplicationListSkeleton />;
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Applications"
        subtitle="Review and onboard new coaches"
        className="mb-6"
      />

      {successMessage && (
        <div className="mb-4 rounded-xl border border-[#E5EFE8] bg-[#F5FAF6] px-4 py-3 text-sm text-[#3D5C47]">
          {successMessage}
        </div>
      )}

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setSuccessMessage(null);
            }}
            className={cn(
              "font-heading min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold capitalize",
              tab === t ? "bg-[#E07A5F] text-white" : "border border-[#E5E7EB] bg-white text-[#6B7280]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {apps.length === 0 && (
          <p className="text-sm text-[#6B7280]">No {tab} applications.</p>
        )}
        {apps.map((a) => (
          <div key={a.id} className="coach-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-heading font-semibold">{a.fullName}</p>
                <p className="text-sm text-[#E07A5F]">{a.specialization}</p>
              </div>
              {a.coachingLevels.length > 0 && (
                <span className="rounded-full bg-[#1E3A5F] px-3 py-1 text-xs font-semibold text-white">
                  {a.coachingLevels.map((id) => SKILL_RUBRICS[id as keyof typeof SKILL_RUBRICS]?.name ?? id).join(" · ")}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[#6B7280]">{a.bio}</p>
            <dl className="mt-3 grid gap-1 text-xs text-[#6B7280] sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-[#374151]">Email</dt>
                <dd>{a.email}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#374151]">Mobile</dt>
                <dd>{a.mobile}</dd>
              </div>
              {a.preferredSlug && (
                <div>
                  <dt className="font-semibold text-[#374151]">Preferred slug</dt>
                  <dd>/coach/{a.preferredSlug}</dd>
                </div>
              )}
              <div>
                <dt className="font-semibold text-[#374151]">Player levels</dt>
                <dd>
                  {a.coachingLevels
                    .map((id) => SKILL_RUBRICS[id as keyof typeof SKILL_RUBRICS]?.name ?? id)
                    .join(", ") || "—"}
                </dd>
              </div>
              {a.currentStudentCount > 0 && (
                <div>
                  <dt className="font-semibold text-[#374151]">Current students</dt>
                  <dd>{a.currentStudentCount}</dd>
                </div>
              )}
            </dl>
            {socialLinks(a).length > 0 && (
              <p className="mt-2 text-xs text-[#9CA3AF]">
                {socialLinks(a).map((link, i) => (
                  <span key={link}>
                    {i > 0 && " · "}
                    <a href={link.startsWith("http") ? link : `https://${link}`} className="text-[#E07A5F]">
                      {link}
                    </a>
                  </span>
                ))}
              </p>
            )}
            {tab === "pending" && (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="coach-btn-primary w-auto px-4 py-2 text-sm"
                  onClick={() => {
                    setSuccessMessage(null);
                    setApproveTarget(a);
                  }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="coach-btn-outline w-auto px-4 py-2 text-sm"
                  disabled={rejectingId === a.id}
                  onClick={() => void handleReject(a.id)}
                >
                  {rejectingId === a.id ? "Rejecting…" : "Reject"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <ApproveCoachApplicationSheet
        application={approveTarget}
        onClose={() => setApproveTarget(null)}
        onApproved={handleApproved}
      />
    </AdminPageShell>
  );
}
