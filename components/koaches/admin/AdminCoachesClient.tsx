"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import type { Court } from "@/lib/koaches/types";
import {
  extendCoachSubscriptionAction,
  setCoachActiveAction,
  updateCoachCourtIdsAction,
  type CreateCoachManuallyResult,
} from "@/lib/koaches/actions/coaches";
import { AdminAddCoachSheet } from "@/components/koaches/admin/AdminAddCoachSheet";
import { AdminPendingPayments } from "@/components/koaches/admin/AdminPendingPayments";
import type { AdminPendingPayment } from "@/lib/koaches/actions/admin-billing";
import {
  BILLING_STATUS_STYLES,
  getSubscriptionBillingInfo,
} from "@/lib/koaches/subscription-billing";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils";

type AdminCoachesClientProps = {
  coaches: CoachProfile[];
  courts: Court[];
  pendingPayments: AdminPendingPayment[];
};

export function AdminCoachesClient({
  coaches: initialCoaches,
  courts,
  pendingPayments,
}: AdminCoachesClientProps) {
  const router = useRouter();
  const [coaches, setCoaches] = useState(initialCoaches);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courtEditId, setCourtEditId] = useState<string | null>(null);
  const [courtDraft, setCourtDraft] = useState<string[]>([]);
  const courtById = new Map(courts.map((c) => [c.id, c]));

  useEffect(() => {
    setCoaches(initialCoaches);
  }, [initialCoaches]);

  const updateCoach = (coachId: string, patch: Partial<CoachProfile>) => {
    setCoaches((prev) => prev.map((c) => (c.id === coachId ? { ...c, ...patch } : c)));
  };

  const handleToggleActive = async (coach: CoachProfile) => {
    setBusyId(coach.id);
    setErrorMessage(null);
    const next = !coach.isActive;
    const result = await setCoachActiveAction(coach.id, next);
    setBusyId(null);
    if (result.ok) {
      updateCoach(coach.id, { isActive: next });
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleExtend = async (coachId: string) => {
    setBusyId(coachId);
    setErrorMessage(null);
    const result = await extendCoachSubscriptionAction(coachId, 1);
    setBusyId(null);
    if (result.ok && result.subscriptionExpiry) {
      updateCoach(coachId, {
        subscriptionExpiry: result.subscriptionExpiry,
        isActive: true,
      });
    } else if (!result.ok) {
      setErrorMessage(result.error);
    }
  };

  const startCourtEdit = (coach: CoachProfile) => {
    setCourtEditId(coach.id);
    setCourtDraft([...coach.courtIds]);
    setErrorMessage(null);
  };

  const toggleCourtDraft = (courtId: string) => {
    setCourtDraft((prev) =>
      prev.includes(courtId) ? prev.filter((id) => id !== courtId) : [...prev, courtId]
    );
  };

  const saveCourtEdit = async (coachId: string) => {
    setBusyId(coachId);
    setErrorMessage(null);
    const result = await updateCoachCourtIdsAction(coachId, courtDraft);
    setBusyId(null);
    if (result.ok) {
      updateCoach(coachId, { courtIds: courtDraft });
      setCourtEditId(null);
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleCreated = (result: Extract<CreateCoachManuallyResult, { ok: true }>) => {
    setSuccessMessage(
      `Coach created. Login: ${result.loginEmail} · profile /coach/${result.slug}`
    );
    router.refresh();
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Coaches"
        subtitle={`${coaches.length} on the platform · assign courts per coach in Courts`}
        className="mb-6"
        actions={
          <button
            type="button"
            className="coach-btn-primary w-full gap-2 px-5 md:w-auto"
            onClick={() => {
              setSuccessMessage(null);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add coach
          </button>
        }
      />

      {successMessage && (
        <div className="mb-4 rounded-xl border border-[#E5EFE8] bg-[#F5FAF6] px-4 py-3 text-sm text-[#3D5C47]">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]" role="alert">
          {errorMessage}
        </div>
      )}

      <AdminPendingPayments initialPayments={pendingPayments} />

      <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#6B7280]">
        <p className="font-semibold text-[#374151]">Billing timeline</p>
        <p className="mt-1">
          Send invoice <span className="font-semibold text-[#111827]">7 days before</span> renewal ·
          payment <span className="font-semibold text-[#111827]">due on renewal date</span> ·{" "}
          <span className="font-semibold text-[#111827]">3-day grace</span> before lapsed
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {coaches.map((c) => {
          const billing = getSubscriptionBillingInfo(c);
          const styles = BILLING_STATUS_STYLES[billing.status];
          const assignedCourts = c.courtIds.map((id) => courtById.get(id)).filter(Boolean);
          const isBusy = busyId === c.id;

          return (
            <div key={c.id} className="coach-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading font-semibold">{c.name}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        c.isActive ? "bg-[#E5EFE8] text-[#3D5C47]" : "bg-[#F3F4F6] text-[#6B7280]"
                      )}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        styles.badge
                      )}
                    >
                      {billing.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280]">koaches.ph/{c.slug}</p>
                  {c.specialization && (
                    <p className="mt-1 text-sm text-[#6B7280]">{c.specialization}</p>
                  )}
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-[#14532D]">
                    {formatCurrency(billing.amount)}
                    <span className="text-xs font-normal text-[#6B7280]"> / mo</span>
                  </p>
                  <p className="text-xs text-[#6B7280]">{billing.planLabel} plan</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {billing.renewalDate
                      ? `Renews ${formatDisplayDate(billing.renewalDate)}`
                      : "No renewal date"}
                  </p>
                </div>
              </div>

              <div
                className={cn("mt-3 rounded-xl px-3 py-2.5 text-xs leading-relaxed", styles.panel)}
              >
                {billing.adminNote}
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#6B7280]">
                <span>{c.totalStudents} students</span>
                <span>{c.totalSessions} sessions</span>
                <span>From ₱{c.ratePerSession.toLocaleString("en-PH")} / session</span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Assigned courts
                  </p>
                  {courtEditId !== c.id ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#4F8FF7] hover:underline"
                      onClick={() => startCourtEdit(c)}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#6B7280] hover:underline"
                        onClick={() => setCourtEditId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        className="text-xs font-semibold text-[#4F8FF7] hover:underline"
                        onClick={() => void saveCourtEdit(c.id)}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                {courtEditId === c.id ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {courts.map((court) => {
                      const selected = courtDraft.includes(court.id);
                      return (
                        <button
                          key={court.id}
                          type="button"
                          onClick={() => toggleCourtDraft(court.id)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            selected
                              ? "bg-[#4F8FF7] text-white"
                              : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                          )}
                        >
                          {court.name}
                        </button>
                      );
                    })}
                  </div>
                ) : assignedCourts.length === 0 ? (
                  <p className="mt-1 text-sm text-[#6B7280]">No courts assigned</p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assignedCourts.map((court) => (
                      <span
                        key={court!.id}
                        className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#374151]"
                      >
                        {court!.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleToggleActive(c)}
                  className={cn(
                    "min-h-[40px] rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    c.isActive
                      ? "border border-[#FECACA] bg-white text-[#B91C1C] hover:bg-[#FEF2F2]"
                      : "coach-btn-primary w-auto"
                  )}
                >
                  {isBusy ? "Saving…" : c.isActive ? "Deactivate account" : "Reactivate account"}
                </button>
                {(billing.status === "payment_due" ||
                  billing.status === "overdue" ||
                  billing.status === "lapsed" ||
                  billing.status === "not_set") && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void handleExtend(c.id)}
                    className="coach-btn-outline min-h-[40px] w-auto px-4 py-2 text-sm"
                  >
                    Extend 1 month
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AdminAddCoachSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />
    </AdminPageShell>
  );
}
