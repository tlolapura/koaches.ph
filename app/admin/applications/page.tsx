"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import {
  fetchApplicationsAction,
  rejectApplicationAction,
  type ApproveCoachApplicationResult,
} from "@/lib/koaches/actions/applications";
import { ApproveCoachApplicationSheet } from "@/components/koaches/admin/ApproveCoachApplicationSheet";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import {
  AdminPageHeader,
  AdminPageShell,
  adminListClass,
  adminListEmptyClass,
  adminListRowClass,
} from "@/components/koaches/admin/AdminPageLayout";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<CoachApplication | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CoachApplication | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setExpandedId(null);
    void fetchApplicationsAction(tab).then((data) => {
      setApps(data);
      setLoading(false);
    });
  }, [tab]);

  const handleApproved = (result: Extract<ApproveCoachApplicationResult, { ok: true }>) => {
    if (approveTarget) {
      setApps((prev) => prev.filter((a) => a.id !== approveTarget.id));
    }
    const name = approveTarget?.fullName ?? "Coach";
    if (result.welcomeEmailSent) {
      setSuccessMessage(
        `${name} approved. Welcome email sent to ${result.loginEmail} · /coach/${result.slug}`
      );
    } else {
      setSuccessMessage(
        `${name} approved (${result.loginEmail} · /coach/${result.slug}), but welcome email failed: ${result.welcomeEmailError ?? "unknown error"}.${
          result.temporaryPassword
            ? ` Temporary password: ${result.temporaryPassword}`
            : ""
        }`
      );
    }
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
      <AdminPageHeader title="Applications" className="mb-6" />

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

      <div className={cn(adminListClass, "mt-5")}>
        {apps.length === 0 ? (
          <div className={cn(adminListEmptyClass, "border-0")}>No {tab} applications</div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {apps.map((a) => {
              const levels = a.coachingLevels
                .map((id) => SKILL_RUBRICS[id as keyof typeof SKILL_RUBRICS]?.name ?? id)
                .filter(Boolean);
              const links = socialLinks(a);
              const expanded = expandedId === a.id;

              return (
                <li key={a.id} className={adminListRowClass()}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : a.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-[11px] font-bold text-white">
                      {coachInitials(a.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                        {a.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                        {a.specialization || "Coach"}
                        {a.currentStudentCount > 0 ? (
                          <>
                            <span className="text-[#D1D5DB]"> · </span>
                            {a.currentStudentCount} students
                          </>
                        ) : null}
                        <span className="text-[#D1D5DB]"> · </span>
                        {a.email}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>

                  {expanded ? (
                    <div className="mt-3 space-y-3 border-t border-[#F3F4F6] pt-3">
                      {a.bio ? (
                        <p className="text-sm leading-relaxed text-[#6B7280]">{a.bio}</p>
                      ) : null}

                      <div className="space-y-1 text-xs text-[#6B7280]">
                        <p>
                          <span className="font-semibold text-[#374151]">Mobile</span> {a.mobile}
                        </p>
                        {a.preferredSlug ? (
                          <p>
                            <span className="font-semibold text-[#374151]">Slug</span> /coach/
                            {a.preferredSlug}
                          </p>
                        ) : null}
                        {levels.length > 0 ? (
                          <p>
                            <span className="font-semibold text-[#374151]">Levels</span>{" "}
                            {levels.join(", ")}
                          </p>
                        ) : null}
                        {links.length > 0 ? (
                          <p className="flex flex-wrap gap-x-2 gap-y-1">
                            {links.map((link) => (
                              <a
                                key={link}
                                href={link.startsWith("http") ? link : `https://${link}`}
                                className="font-semibold text-[#4F8FF7] hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {link}
                              </a>
                            ))}
                          </p>
                        ) : null}
                      </div>

                      {tab === "pending" ? (
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 text-xs font-semibold text-white hover:bg-[#15803D]"
                            onClick={() => {
                              setSuccessMessage(null);
                              setApproveTarget(a);
                            }}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={rejectingId === a.id}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
                            onClick={() => setRejectTarget(a)}
                          >
                            <X className="h-3.5 w-3.5" />
                            {rejectingId === a.id ? "…" : "Reject"}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : tab === "pending" ? (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 pl-[52px]">
                      <button
                        type="button"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#16A34A] px-3 text-xs font-semibold text-white hover:bg-[#15803D]"
                        onClick={() => {
                          setSuccessMessage(null);
                          setApproveTarget(a);
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={rejectingId === a.id}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
                        onClick={() => setRejectTarget(a)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ApproveCoachApplicationSheet
        application={approveTarget}
        onClose={() => setApproveTarget(null)}
        onApproved={handleApproved}
      />

      <ConfirmSheet
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        message={rejectTarget ? `Reject ${rejectTarget.fullName}?` : ""}
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
