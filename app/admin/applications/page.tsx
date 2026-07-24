"use client";

import { useEffect, useState } from "react";
import { Check, Mail, Phone, Users, X } from "lucide-react";
import {
  fetchApplicationsAction,
  rejectApplicationAction,
  type ApproveCoachApplicationResult,
} from "@/lib/koaches/actions/applications";
import { ApproveCoachApplicationSheet } from "@/components/koaches/admin/ApproveCoachApplicationSheet";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { AdminApplicationListSkeleton } from "@/components/koaches/admin/AdminSkeletons";
import { SKILL_RUBRICS } from "@/lib/koaches/program-templates";
import type { CoachApplication } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

const tabs = ["pending", "approved", "rejected"] as const;

function socialLinks(app: CoachApplication) {
  return [app.instagram, app.facebook].filter(Boolean) as string[];
}

function coachInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export default function ApplicationsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const [apps, setApps] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] = useState<CoachApplication | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CoachApplication | null>(null);
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

      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setSuccessMessage(null);
            }}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-3.5 py-2 text-xs font-semibold capitalize transition-colors",
              tab === t
                ? "bg-[#111827] text-white"
                : "bg-white text-[#4B5563] ring-1 ring-[#E5E7EB] hover:bg-[#F9FAFB]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {apps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-12 text-center">
            <p className="text-sm font-medium text-[#374151]">No {tab} applications</p>
            <p className="mt-1 text-sm text-[#6B7280]">New coach applications will show up here.</p>
          </div>
        )}

        {apps.map((a) => {
          const levels = a.coachingLevels
            .map((id) => SKILL_RUBRICS[id as keyof typeof SKILL_RUBRICS]?.name ?? id)
            .filter(Boolean);
          const links = socialLinks(a);

          return (
            <article
              key={a.id}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80"
            >
              <div className="p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-sm font-bold text-white">
                    {coachInitials(a.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-heading text-base font-semibold text-[#111827] sm:text-lg">
                          {a.fullName}
                        </h3>
                        {a.specialization && (
                          <p className="mt-0.5 text-sm font-medium text-[#4F8FF7]">
                            {a.specialization}
                          </p>
                        )}
                      </div>
                      {a.currentStudentCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[11px] font-semibold text-[#166534]">
                          <Users className="h-3 w-3" />
                          {a.currentStudentCount} students
                        </span>
                      )}
                    </div>

                    {levels.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {levels.map((level) => (
                          <span
                            key={level}
                            className="rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#6B7280]">{a.bio}</p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
                    <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      <Mail className="h-3 w-3" />
                      Email
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-[#111827]">{a.email}</p>
                  </div>
                  <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
                    <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      <Phone className="h-3 w-3" />
                      Mobile
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-[#111827]">{a.mobile}</p>
                  </div>
                  {a.preferredSlug && (
                    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5 sm:col-span-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        Preferred slug
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#111827]">
                        /coach/{a.preferredSlug}
                      </p>
                    </div>
                  )}
                </div>

                {links.length > 0 && (
                  <p className="mt-3 text-xs text-[#9CA3AF]">
                    {links.map((link, i) => (
                      <span key={link}>
                        {i > 0 && " · "}
                        <a
                          href={link.startsWith("http") ? link : `https://${link}`}
                          className="font-semibold text-[#4F8FF7] hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </div>

              {tab === "pending" && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[#F3F4F6] bg-[#FAFBFC] px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#16A34A] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D]"
                    onClick={() => {
                      setSuccessMessage(null);
                      setApproveTarget(a);
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={rejectingId === a.id}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] disabled:opacity-50"
                    onClick={() => setRejectTarget(a)}
                  >
                    <X className="h-4 w-4" />
                    {rejectingId === a.id ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <ApproveCoachApplicationSheet
        application={approveTarget}
        onClose={() => setApproveTarget(null)}
        onApproved={handleApproved}
      />

      <ConfirmSheet
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        message={rejectTarget ? `Reject application from ${rejectTarget.fullName}?` : ""}
        confirmLabel="Reject"
        onConfirm={async () => {
          if (!rejectTarget) return;
          await handleReject(rejectTarget.id);
          setRejectTarget(null);
        }}
      />
    </AdminPageShell>
  );
}
