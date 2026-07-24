"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin, Plus, Search, Trash2 } from "lucide-react";
import type { Court } from "@/lib/koaches/types";
import {
  createCourtAction,
  deleteCourtAction,
  updateCourtActiveAction,
} from "@/lib/koaches/actions/courts";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { cn } from "@/lib/utils";

type AdminCourtsClientProps = {
  initialCourts: Court[];
};

const ADD_COURT_FORM_ID = "admin-add-court-form";

type FilterId = "all" | "active" | "inactive";

export function AdminCourtsClient({ initialCourts }: AdminCourtsClientProps) {
  const router = useRouter();
  const [courtList, setCourtList] = useState(initialCourts);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("Metro Manila");
  const [mapsUrl, setMapsUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyCourtId, setBusyCourtId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const resetForm = () => {
    setName("");
    setAddress("");
    setCity("");
    setRegion("Metro Manila");
    setMapsUrl("");
  };

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const c of courtList) {
      if (c.isActive === false) inactive += 1;
      else active += 1;
    }
    return { active, inactive, total: courtList.length };
  }, [courtList]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courtList.filter((c) => {
      const isActive = c.isActive !== false;
      if (filter === "active" && !isActive) return false;
      if (filter === "inactive" && isActive) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        (c.city?.toLowerCase().includes(q) ?? false) ||
        (c.region?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [courtList, filter, query]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const result = await createCourtAction({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        region: region.trim(),
        mapsUrl: mapsUrl.trim() || undefined,
      });
      if (!result.ok || !result.id) {
        setError(result.ok ? "Could not create court." : result.error);
        return;
      }
      const newId = result.id;
      setCourtList((prev) => [
        ...prev,
        {
          id: newId,
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          region: region.trim(),
          mapsUrl: mapsUrl.trim() || undefined,
          isActive: true,
        },
      ]);
      resetForm();
      setAddOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (court: Court) => {
    setBusyCourtId(court.id);
    const next = court.isActive === false;
    setError(null);
    try {
      const result = await updateCourtActiveAction(court.id, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCourtList((prev) => prev.map((c) => (c.id === court.id ? { ...c, isActive: next } : c)));
      router.refresh();
    } finally {
      setBusyCourtId(null);
    }
  };

  const removeCourt = async (id: string) => {
    setBusyCourtId(id);
    setError(null);
    try {
      const result = await deleteCourtAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCourtList((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } finally {
      setBusyCourtId(null);
    }
  };

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: "all", label: "All", count: stats.total },
    { id: "active", label: "Active", count: stats.active },
    { id: "inactive", label: "Inactive", count: stats.inactive },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Courts"
        subtitle="Platform directory for coach assignments"
        className="mb-6"
        actions={
          <button
            type="button"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D] md:w-auto"
            onClick={() => {
              setError(null);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add court
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-4 ring-1 ring-[#BBF7D0]/80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#166534]/70">
            Total
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-[#14532D]">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-white p-4 ring-1 ring-[#BFDBFE]/80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1D4ED8]/70">
            Active
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-[#1D4ED8]">{stats.active}</p>
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
            placeholder="Search courts…"
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

      <CoachBottomSheet
        open={addOpen}
        onClose={() => {
          if (saving) return;
          setAddOpen(false);
          resetForm();
        }}
        title="Add court"
        subtitle="Create a new court for coach assignments"
        footer={
          <div className="flex gap-2">
            <CoachButton
              type="button"
              variant="outline"
              className="flex-1"
              disabled={saving}
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
            >
              Cancel
            </CoachButton>
            <CoachButton
              type="submit"
              form={ADD_COURT_FORM_ID}
              className="flex-1"
              loading={saving}
              loadingLabel="Saving…"
            >
              Save court
            </CoachButton>
          </div>
        }
      >
        <form id={ADD_COURT_FORM_ID} className="coach-form" onSubmit={(e) => void handleAdd(e)}>
          <CoachSheetField label="Court name" htmlFor="court-name">
            <input
              id="court-name"
              className="coach-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayala Malls Pickleball Courts"
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Address" htmlFor="court-address">
            <input
              id="court-address"
              className="coach-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, building, or court complex"
              required
            />
          </CoachSheetField>
          <CoachSheetField label="City" htmlFor="court-city">
            <input
              id="court-city"
              className="coach-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Makati"
            />
          </CoachSheetField>
          <CoachSheetField label="Region" htmlFor="court-region">
            <input
              id="court-region"
              className="coach-input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="NCR"
            />
          </CoachSheetField>
          <CoachSheetField label="Google Maps link (optional)" htmlFor="court-maps">
            <input
              id="court-maps"
              className="coach-input"
              type="url"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </CoachSheetField>
        </form>
      </CoachBottomSheet>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-12 text-center lg:col-span-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4]">
              <MapPin className="h-5 w-5 text-[#166534]" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#374151]">
              {courtList.length === 0 ? "No courts yet" : "No courts match"}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {courtList.length === 0
                ? "Add your first court to get started."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const isActive = c.isActive !== false;
            const busy = busyCourtId === c.id;
            return (
              <article
                key={c.id}
                className={cn(
                  "overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-[#E5E7EB]/80",
                  !isActive && "opacity-75"
                )}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#EFF6FF]">
                      <MapPin className="h-5 w-5 text-[#166534]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-heading truncate text-base font-semibold text-[#111827]">
                            {c.name}
                          </h3>
                          <p className="mt-0.5 text-sm text-[#6B7280]">{c.address}</p>
                          {(c.city || c.region) && (
                            <p className="mt-0.5 text-xs text-[#9CA3AF]">
                              {[c.city, c.region].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                        {c.mapsUrl && (
                          <a
                            href={c.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#4F8FF7] transition-colors hover:bg-[#EFF6FF]"
                            title="Open in Maps"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            isActive
                              ? "bg-[#E5EFE8] text-[#3D5C47]"
                              : "bg-[#F3F4F6] text-[#6B7280]"
                          )}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-[#F3F4F6] bg-[#FAFBFC] px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    disabled={busy}
                    className={cn(
                      "inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-semibold transition-colors disabled:opacity-50",
                      isActive
                        ? "text-[#B91C1C] hover:bg-[#FEF2F2]"
                        : "text-[#166534] hover:bg-[#F0FDF4]"
                    )}
                    onClick={() => void toggleActive(c)}
                  >
                    {busy ? "…" : isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] disabled:opacity-50"
                    onClick={() => void removeCourt(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {busy ? "…" : "Remove"}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </AdminPageShell>
  );
}
