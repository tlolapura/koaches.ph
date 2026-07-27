"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  ChevronDown,
  MapPin,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
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
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import {
  AdminPageHeader,
  AdminPageShell,
  adminListClass,
  adminListEmptyClass,
  adminListRowClass,
} from "@/components/koaches/admin/AdminPageLayout";
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [courtDraft, setCourtDraft] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CoachProfile | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

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

  const toggleExpanded = (coach: CoachProfile) => {
    if (expandedId === coach.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(coach.id);
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
    { id: "attention", label: "Attention", count: stats.attention },
    { id: "inactive", label: "Inactive", count: stats.inactive },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Coaches"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or slug…"
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

      <div className={cn(adminListClass, "mt-5")}>
        {filteredCoaches.length === 0 ? (
          <div className={cn(adminListEmptyClass, "border-0")}>No coaches</div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {filteredCoaches.map((c) => {
              const billing = getSubscriptionBillingInfo(c);
              const styles = BILLING_STATUS_STYLES[billing.status];
              const isBusy = busyId === c.id;
              const attention = needsAttention(billing.status);
              const expanded = expandedId === c.id;

              return (
                <li
                  key={c.id}
                  className={adminListRowClass({
                    muted: !c.isActive,
                    alert: attention,
                  })}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(c)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="relative shrink-0">
                      {c.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- coach photo URL
                        <img
                          src={c.photo}
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-black/5"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#16A34A] to-[#4F8FF7] text-[11px] font-bold text-white">
                          {coachInitials(c.name)}
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                          c.isActive ? "bg-[#16A34A]" : "bg-[#9CA3AF]"
                        )}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                          {c.name}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            styles.badge
                          )}
                        >
                          {billing.label}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                        /{c.slug}
                        <span className="text-[#D1D5DB]"> · </span>
                        {c.totalStudents} stu
                        <span className="text-[#D1D5DB]"> · </span>
                        {c.totalSessions} sess
                        {billing.renewalDate ? (
                          <>
                            <span className="text-[#D1D5DB]"> · </span>
                            {formatDisplayDate(billing.renewalDate)}
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <p className="font-heading text-sm font-bold tabular-nums text-[#14532D]">
                        {formatCurrency(billing.amount)}
                      </p>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[#9CA3AF] transition-transform",
                          expanded && "rotate-180"
                        )}
                      />
                    </div>
                  </button>

                  {expanded ? (
                    <div className="mt-3 space-y-3 border-t border-[#F3F4F6] pt-3">
                      {attention ? (
                        <p className={cn("rounded-lg px-2.5 py-1.5 text-xs", styles.panel)}>
                          {billing.adminNote}
                        </p>
                      ) : null}

                      <div>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                            <MapPin className="h-3 w-3" />
                            Courts
                          </p>
                          <button
                            type="button"
                            disabled={isBusy}
                            className="text-xs font-semibold text-[#4F8FF7] disabled:opacity-50"
                            onClick={() => void saveCourtEdit(c.id)}
                          >
                            Save courts
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {courts.length === 0 ? (
                            <p className="text-xs text-[#9CA3AF]">No courts in directory</p>
                          ) : (
                            courts.map((court) => {
                              const selected = courtDraft.includes(court.id);
                              return (
                                <button
                                  key={court.id}
                                  type="button"
                                  onClick={() => toggleCourtDraft(court.id)}
                                  className={cn(
                                    "min-h-9 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
                                    selected
                                      ? "bg-[#4F8FF7] text-white"
                                      : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                                  )}
                                >
                                  {court.name}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F3F4F6] px-2.5 text-xs font-semibold text-[#374151] hover:bg-[#E5E7EB]"
                          onClick={() => setEditCoach(c)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          className={cn(
                            "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold disabled:opacity-50",
                            c.isActive
                              ? "bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FECACA]/40"
                              : "bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7]"
                          )}
                          onClick={() => void handleToggleActive(c)}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {c.isActive ? "Deactivate" : "Activate"}
                        </button>
                        {attention ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-2.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#DBEAFE] disabled:opacity-50"
                            onClick={() => void handleExtend(c.id)}
                          >
                            <CalendarPlus className="h-3.5 w-3.5" />
                            Extend 1 mo
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={isBusy}
                          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
                          onClick={() => {
                            setErrorMessage(null);
                            setDeleteTarget(c);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
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
          setSuccessMessage(`Saved ${updated.name}.`);
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
          setSuccessMessage(`Deleted ${deleteTarget.name}.`);
          router.refresh();
        }}
      />
    </AdminPageShell>
  );
}
