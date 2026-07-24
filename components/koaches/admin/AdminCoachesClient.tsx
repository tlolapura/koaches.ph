"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarClock,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import type { Court } from "@/lib/koaches/types";
import {
  extendCoachSubscriptionAction,
  deleteCoachAction,
  setCoachActiveAction,
  updateCoachCourtIdsAction,
  type CreateCoachManuallyResult,
} from "@/lib/koaches/actions/coaches";
import { AdminAddCoachSheet } from "@/components/koaches/admin/AdminAddCoachSheet";
import { AdminEditCoachSheet } from "@/components/koaches/admin/AdminEditCoachSheet";
import {
  BILLING_STATUS_STYLES,
  getSubscriptionBillingInfo,
  type SubscriptionBillingStatus,
} from "@/lib/koaches/subscription-billing";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { SITE_DOMAIN } from "@/lib/koaches/constants";
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils";

type AdminCoachesClientProps = {
  coaches: CoachProfile[];
  courts: Court[];
};

type FilterId = "all" | "active" | "attention" | "inactive";

function coachInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function needsAttention(status: SubscriptionBillingStatus) {
  return (
    status === "payment_due" ||
    status === "overdue" ||
    status === "lapsed" ||
    status === "not_set"
  );
}

export function AdminCoachesClient({
  coaches: initialCoaches,
  courts,
}: AdminCoachesClientProps) {
  const router = useRouter();
  const [coaches, setCoaches] = useState(initialCoaches);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editCoach, setEditCoach] = useState<CoachProfile | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [courtEditId, setCourtEditId] = useState<string | null>(null);
  const [courtDraft, setCourtDraft] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CoachProfile | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const courtById = new Map(courts.map((c) => [c.id, c]));

  useEffect(() => {
    setCoaches(initialCoaches);
  }, [initialCoaches]);

  const stats = useMemo(() => {
    let active = 0;
    let attention = 0;
    let inactive = 0;
    for (const c of coaches) {
      if (!c.isActive) inactive += 1;
      else active += 1;
      const billing = getSubscriptionBillingInfo(c);
      if (needsAttention(billing.status)) attention += 1;
    }
    return { active, attention, inactive, total: coaches.length };
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coaches.filter((c) => {
      const billing = getSubscriptionBillingInfo(c);
      if (filter === "active" && !c.isActive) return false;
      if (filter === "inactive" && c.isActive) return false;
      if (filter === "attention" && !needsAttention(billing.status)) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.specialization?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [coaches, filter, query]);

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

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "active", label: "Active", count: stats.active },
    { id: "attention", label: "Needs attention", count: stats.attention },
    { id: "inactive", label: "Inactive", count: stats.inactive },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Coaches"
        subtitle={`${stats.total} on the platform`}
        className="mb-6"
        actions={
          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D] md:w-auto"
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
        <div
          className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-4 ring-1 ring-[#BBF7D0]/80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#166534]/70">
            Active
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-[#14532D]">{stats.active}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-white p-4 ring-1 ring-[#FED7AA]/80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9A3412]/70">
            Attention
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-[#9A3412]">{stats.attention}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-white p-4 ring-1 ring-[#E2E8F0]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
            Inactive
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-[#334155]">{stats.inactive}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or slug…"
            className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3 text-sm text-[#111827] outline-none ring-[#16A34A]/30 placeholder:text-[#9CA3AF] focus:border-[#86EFAC] focus:ring-2"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                filter === f.id
                  ? "bg-[#111827] text-white"
                  : "bg-white text-[#4B5563] ring-1 ring-[#E5E7EB] hover:bg-[#F9FAFB]"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  filter === f.id ? "bg-white/20" : "bg-[#F3F4F6] text-[#6B7280]"
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {filteredCoaches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-12 text-center">
            <p className="text-sm font-medium text-[#374151]">No coaches match</p>
            <p className="mt-1 text-sm text-[#6B7280]">Try a different search or filter.</p>
          </div>
        ) : (
          filteredCoaches.map((c) => {
            const billing = getSubscriptionBillingInfo(c);
            const styles = BILLING_STATUS_STYLES[billing.status];
            const assignedCourts = c.courtIds.map((id) => courtById.get(id)).filter(Boolean);
            const isBusy = busyId === c.id;
            const attention = needsAttention(billing.status);

            return (
              <article
                key={c.id}
                className={cn(
                  "overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1",
                  attention ? "ring-[#FDBA74]/70" : "ring-[#E5E7EB]/80"
                )}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                      {c.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- coach photo URL
                        <img
                          src={c.photo}
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover ring-1 ring-black/5 sm:h-16 sm:w-16"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-sm font-bold text-white sm:h-16 sm:w-16 sm:text-base">
                          {coachInitials(c.name)}
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-white",
                          c.isActive ? "bg-[#16A34A]" : "bg-[#9CA3AF]"
                        )}
                        title={c.isActive ? "Active" : "Inactive"}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-heading truncate text-base font-semibold text-[#111827] sm:text-lg">
                            {c.name}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-[#6B7280] sm:text-sm">
                            {SITE_DOMAIN}/coach/{c.slug}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading text-base font-bold text-[#14532D]">
                            {formatCurrency(billing.amount)}
                            <span className="text-xs font-normal text-[#6B7280]">/mo</span>
                          </p>
                          <p className="text-[11px] text-[#6B7280]">{billing.planLabel} plan</p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            c.isActive
                              ? "bg-[#E5EFE8] text-[#3D5C47]"
                              : "bg-[#F3F4F6] text-[#6B7280]"
                          )}
                        >
                          {c.isActive ? "Active" : "Inactive"}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            styles.badge
                          )}
                        >
                          {billing.label}
                        </span>
                        {c.specialization && (
                          <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8]">
                            {c.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {attention && (
                    <div
                      className={cn(
                        "mt-4 rounded-xl px-3 py-2.5 text-xs leading-relaxed",
                        styles.panel
                      )}
                    >
                      {billing.adminNote}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        <Users className="h-3 w-3" />
                        Students
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">{c.totalStudents}</p>
                    </div>
                    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        <CalendarClock className="h-3 w-3" />
                        Sessions
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">{c.totalSessions}</p>
                    </div>
                    <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5">
                      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        <Calendar className="h-3 w-3" />
                        Renews
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">
                        {billing.renewalDate
                          ? formatDisplayDate(billing.renewalDate)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                        <MapPin className="h-3 w-3" />
                        Courts
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
                      <p className="mt-1.5 text-sm text-[#9CA3AF]">No courts assigned</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-1.5">
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
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-[#F3F4F6] bg-[#FAFBFC] px-4 py-3 sm:px-5">
                  <CoachButton
                    type="button"
                    variant="outline"
                    className="!h-10 !min-h-0 !w-auto px-3.5 py-0 text-sm"
                    onClick={() => setEditCoach(c)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </CoachButton>
                  <CoachButton
                    type="button"
                    variant={c.isActive ? "outline" : "primary"}
                    className={cn(
                      "!h-10 !min-h-0 !w-auto px-3.5 py-0 text-sm",
                      c.isActive && "border-[#FECACA] text-[#B91C1C] hover:bg-[#FEF2F2]"
                    )}
                    loading={isBusy}
                    loadingLabel="Saving…"
                    onClick={() => void handleToggleActive(c)}
                  >
                    {c.isActive ? "Deactivate" : "Reactivate"}
                  </CoachButton>
                  {attention && (
                    <CoachButton
                      type="button"
                      variant="outline"
                      className="!h-10 !min-h-0 !w-auto px-3.5 py-0 text-sm"
                      disabled={isBusy}
                      onClick={() => void handleExtend(c.id)}
                    >
                      Extend 1 mo
                    </CoachButton>
                  )}
                  <button
                    type="button"
                    disabled={isBusy}
                    className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] disabled:opacity-50"
                    onClick={() => {
                      setErrorMessage(null);
                      setDeleteTarget(c);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <AdminAddCoachSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />

      <AdminEditCoachSheet
        coach={editCoach}
        open={editCoach !== null}
        onClose={() => setEditCoach(null)}
        onSaved={(updated) => {
          updateCoach(updated.id, updated);
          setSuccessMessage(`Saved changes for ${updated.name}.`);
          router.refresh();
        }}
      />

      <ConfirmSheet
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        message={deleteTarget ? `Delete ${deleteTarget.name}?` : "Delete coach?"}
        description={
          deleteTarget
            ? `This permanently deletes ${deleteTarget.name} and all attached data:\nstudents, sessions, programs, clinics, progress cards, invoices, and login access.\n\nThis cannot be undone.`
            : undefined
        }
        confirmLabel="Delete everything"
        onConfirm={async () => {
          if (!deleteTarget) return;
          setBusyId(deleteTarget.id);
          setErrorMessage(null);
          const result = await deleteCoachAction(deleteTarget.id);
          setBusyId(null);
          if (!result.ok) {
            setErrorMessage(result.error);
            throw new Error(result.error);
          }
          setCoaches((prev) => prev.filter((coach) => coach.id !== deleteTarget.id));
          setSuccessMessage(`Deleted ${deleteTarget.name} and all related data.`);
          router.refresh();
        }}
      />
    </AdminPageShell>
  );
}
