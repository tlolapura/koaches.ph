"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Court, CourtRequest } from "@/lib/koaches/types";
import {
  approveCourtRequestAction,
  createCourtAction,
  deleteCourtAction,
  linkCourtRequestToExistingAction,
  rejectCourtRequestAction,
  updateCourtAction,
  updateCourtActiveAction,
} from "@/lib/koaches/actions/courts";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  AdminPageHeader,
  AdminPageShell,
  adminListClass,
  adminListEmptyClass,
  adminListRowClass,
} from "@/components/koaches/admin/AdminPageLayout";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { cn } from "@/lib/utils";

type AdminCourtsClientProps = {
  initialCourts: Court[];
  initialRequests?: CourtRequest[];
};

const ADD_COURT_FORM_ID = "admin-add-court-form";
const EDIT_COURT_FORM_ID = "admin-edit-court-form";
const REVIEW_COURT_FORM_ID = "admin-review-court-form";

type CourtDraft = {
  name: string;
  address: string;
  city: string;
  region: string;
  mapsUrl: string;
};

type FilterId = "all" | "active" | "inactive";

function normalizeCourtName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match by court name. Exact / near-exact names win even if city differs. */
function findDuplicateCourts(courts: Court[], name: string, city?: string): Court[] {
  const needle = normalizeCourtName(name);
  if (!needle) return [];
  const cityNeedle = normalizeCourtName(city ?? "");
  const words = needle.split(" ").filter((w) => w.length > 2);

  const scored = courts
    .map((c) => {
      const existing = normalizeCourtName(c.name);
      if (!existing) return null;

      let score = 0;
      if (existing === needle) score = 100;
      else if (existing.includes(needle) || needle.includes(existing)) score = 80;
      else if (words.length > 0 && words.every((w) => existing.includes(w))) score = 60;
      else if (words.some((w) => w.length > 3 && existing.includes(w))) score = 30;
      else return null;

      if (cityNeedle) {
        const existingCity = normalizeCourtName(c.city ?? "");
        if (existingCity === cityNeedle) score += 10;
      }
      return { court: c, score };
    })
    .filter((x): x is { court: Court; score: number } => !!x && x.score >= 60)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((x) => x.court);
}

export function AdminCourtsClient({
  initialCourts,
  initialRequests = [],
}: AdminCourtsClientProps) {
  const router = useRouter();
  const [courtList, setCourtList] = useState(initialCourts);
  const [requests, setRequests] = useState(initialRequests);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("Metro Manila");
  const [mapsUrl, setMapsUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyCourtId, setBusyCourtId] = useState<string | null>(null);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");
  const [reviewing, setReviewing] = useState<CourtRequest | null>(null);
  const [reviewDraft, setReviewDraft] = useState<CourtDraft>({
    name: "",
    address: "",
    city: "",
    region: "",
    mapsUrl: "",
  });
  const [editing, setEditing] = useState<Court | null>(null);
  const [editDraft, setEditDraft] = useState<CourtDraft>({
    name: "",
    address: "",
    city: "",
    region: "",
    mapsUrl: "",
  });
  const [pickingDuplicate, setPickingDuplicate] = useState(false);
  const [duplicateSearch, setDuplicateSearch] = useState("");

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
      if (editing?.id === id) setEditing(null);
      router.refresh();
    } finally {
      setBusyCourtId(null);
    }
  };

  const openEdit = (court: Court) => {
    setError(null);
    setEditing(court);
    setEditDraft({
      name: court.name,
      address: court.address,
      city: court.city ?? "",
      region: court.region ?? "",
      mapsUrl: court.mapsUrl ?? "",
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editDraft.name.trim() || !editDraft.address.trim()) return;
    setBusyCourtId(editing.id);
    setError(null);
    try {
      const result = await updateCourtAction(editing.id, {
        name: editDraft.name.trim(),
        address: editDraft.address.trim(),
        city: editDraft.city.trim(),
        region: editDraft.region.trim(),
        mapsUrl: editDraft.mapsUrl.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCourtList((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? {
                ...c,
                name: editDraft.name.trim(),
                address: editDraft.address.trim(),
                city: editDraft.city.trim(),
                region: editDraft.region.trim(),
                mapsUrl: editDraft.mapsUrl.trim() || undefined,
              }
            : c
        )
      );
      setEditing(null);
      router.refresh();
    } finally {
      setBusyCourtId(null);
    }
  };

  const openReview = (req: CourtRequest, startAsDuplicate = false) => {
    setError(null);
    setReviewing(req);
    setReviewDraft({
      name: req.name,
      address: req.address,
      city: req.city ?? "",
      region: req.region ?? "",
      mapsUrl: req.mapsUrl ?? "",
    });
    setPickingDuplicate(startAsDuplicate);
    setDuplicateSearch(req.name);
  };

  const approveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing) return;
    const requestId = reviewing.id;
    setBusyRequestId(requestId);
    setError(null);
    try {
      const result = await approveCourtRequestAction(requestId, {
        name: reviewDraft.name.trim(),
        address: reviewDraft.address.trim(),
        city: reviewDraft.city.trim(),
        region: reviewDraft.region.trim(),
        mapsUrl: reviewDraft.mapsUrl.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (result.court) {
        const court = result.court;
        setCourtList((prev) => [...prev, court]);
      }
      setReviewing(null);
      setPickingDuplicate(false);
      router.refresh();
    } finally {
      setBusyRequestId(null);
    }
  };

  const assignExistingCourt = async (requestId: string, courtId: string) => {
    setBusyRequestId(requestId);
    setError(null);
    try {
      const result = await linkCourtRequestToExistingAction(requestId, courtId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setReviewing(null);
      setPickingDuplicate(false);
      router.refresh();
    } finally {
      setBusyRequestId(null);
    }
  };

  const possibleDuplicates = useMemo(
    () => findDuplicateCourts(courtList, reviewDraft.name, reviewDraft.city),
    [courtList, reviewDraft.city, reviewDraft.name]
  );

  const manualDuplicateChoices = useMemo(() => {
    const q = duplicateSearch.trim().toLowerCase();
    const active = courtList.filter((c) => c.isActive !== false);
    if (!q) return active.slice(0, 8);
    return active
      .filter((c) =>
        [c.name, c.address, c.city, c.region].some((value) =>
          value?.toLowerCase().includes(q)
        )
      )
      .slice(0, 12);
  }, [courtList, duplicateSearch]);

  const duplicatesByRequestId = useMemo(() => {
    const map = new Map<string, Court[]>();
    for (const req of requests) {
      map.set(req.id, findDuplicateCourts(courtList, req.name, req.city));
    }
    return map;
  }, [courtList, requests]);

  const rejectRequest = async (requestId: string) => {
    setBusyRequestId(requestId);
    setError(null);
    try {
      const result = await rejectCourtRequestAction(requestId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setReviewing(null);
      setPickingDuplicate(false);
      router.refresh();
    } finally {
      setBusyRequestId(null);
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

      {requests.length > 0 ? (
        <section className="mb-6 overflow-hidden rounded-2xl border border-[#FDE68A] bg-[#FFFBEB]">
          <div className="border-b border-[#FDE68A] px-4 py-3 sm:px-5">
            <h2 className="font-heading text-base font-semibold text-[#78350F]">
              {requests.length} request{requests.length === 1 ? "" : "s"}
            </h2>
          </div>
          <ul className="divide-y divide-[#FDE68A]/70">
            {requests.map((req) => {
              const busy = busyRequestId === req.id;
              const duplicates = duplicatesByRequestId.get(req.id) ?? [];
              const topDuplicate = duplicates[0];
              return (
                <li key={req.id} className="px-3.5 py-3 sm:px-4">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                          {req.name}
                        </p>
                        {topDuplicate ? (
                          <span className="rounded-full bg-[#92400E] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            Dup
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                        {[req.city || req.address, req.region].filter(Boolean).join(" · ")}
                        {req.coachName ? ` · ${req.coachName}` : ""}
                      </p>
                      {topDuplicate ? (
                        <p className="mt-0.5 truncate text-xs font-medium text-[#92400E]">
                          Matches {topDuplicate.name}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      {topDuplicate ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void assignExistingCourt(req.id, topDuplicate.id)}
                          className="inline-flex h-9 items-center rounded-lg bg-[#92400E] px-2.5 text-xs font-semibold text-white hover:bg-[#78350F] disabled:opacity-50"
                        >
                          {busy ? "…" : "Use existing"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openReview(req, true)}
                          className="inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-[#92400E] ring-1 ring-[#FDE68A] hover:bg-[#FFFBEB] disabled:opacity-50"
                        >
                          Duplicate
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void rejectRequest(req.id)}
                        className="inline-flex h-9 items-center rounded-lg px-2.5 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openReview(req)}
                        className="inline-flex h-9 items-center rounded-lg bg-[#16A34A] px-2.5 text-xs font-semibold text-white hover:bg-[#15803D] disabled:opacity-50"
                      >
                        {busy ? "…" : "Review"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        open={!!reviewing}
        onClose={() => {
          if (busyRequestId) return;
          setReviewing(null);
          setPickingDuplicate(false);
        }}
        title={pickingDuplicate ? "Link to existing" : "Review request"}
        subtitle={
          pickingDuplicate
            ? undefined
            : reviewing?.coachName
              ? `From ${reviewing.coachName}`
              : undefined
        }
        footer={
          pickingDuplicate ? (
            <div className="flex gap-2">
              <CoachButton
                type="button"
                variant="outline"
                className="flex-1"
                disabled={!!busyRequestId}
                onClick={() => setPickingDuplicate(false)}
              >
                Back
              </CoachButton>
              <CoachButton
                type="button"
                variant="outline"
                className="flex-1"
                disabled={!!busyRequestId}
                onClick={() => reviewing && void rejectRequest(reviewing.id)}
              >
                Reject instead
              </CoachButton>
            </div>
          ) : (
            <div className="flex gap-2">
              <CoachButton
                type="button"
                variant="outline"
                className="flex-1"
                disabled={!!busyRequestId}
                onClick={() => reviewing && void rejectRequest(reviewing.id)}
              >
                Reject
              </CoachButton>
              <CoachButton
                type="submit"
                form={REVIEW_COURT_FORM_ID}
                className="flex-1"
                loading={!!busyRequestId}
                loadingLabel="Adding…"
              >
                Approve court
              </CoachButton>
            </div>
          )
        }
      >
        {pickingDuplicate ? (
          <div className="space-y-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={duplicateSearch}
                onChange={(e) => setDuplicateSearch(e.target.value)}
                placeholder="Search existing courts…"
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3 text-sm text-[#111827] outline-none ring-[#16A34A]/30 placeholder:text-[#9CA3AF] focus:border-[#86EFAC] focus:ring-2"
              />
            </label>
            {manualDuplicateChoices.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No courts match that search.</p>
            ) : (
              <ul className="space-y-2">
                {manualDuplicateChoices.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={!!busyRequestId || !reviewing}
                      onClick={() => reviewing && void assignExistingCourt(reviewing.id, c.id)}
                      className="flex w-full items-start justify-between gap-3 rounded-xl border border-[#E5E7EB] px-3 py-3 text-left hover:border-[#92400E] hover:bg-[#FFFBEB] disabled:opacity-50"
                    >
                      <span className="min-w-0">
                        <span className="font-heading block text-sm font-semibold text-[#111827]">
                          {c.name}
                        </span>
                        <span className="block text-xs text-[#6B7280]">
                          {[c.address, c.city, c.region].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-lg bg-[#92400E] px-2.5 py-1.5 text-xs font-semibold text-white">
                        Use this
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
        <form
          id={REVIEW_COURT_FORM_ID}
          className="coach-form"
          onSubmit={(e) => void approveRequest(e)}
        >
          {possibleDuplicates.length > 0 ? (
            <div className="mb-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5">
              <p className="text-xs font-semibold text-[#92400E]">Duplicate of an existing court</p>
              <ul className="mt-1.5 space-y-1.5">
                {possibleDuplicates.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate text-sm text-[#78350F]">
                      {c.name}
                      {c.city ? ` · ${c.city}` : ""}
                    </span>
                    <button
                      type="button"
                      disabled={!!busyRequestId || !reviewing}
                      onClick={() => reviewing && void assignExistingCourt(reviewing.id, c.id)}
                      className="shrink-0 rounded-lg bg-[#92400E] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#78350F] disabled:opacity-50"
                    >
                      Use this court
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setDuplicateSearch(reviewDraft.name);
                  setPickingDuplicate(true);
                }}
                className="mt-2 text-xs font-semibold text-[#92400E] underline underline-offset-2"
              >
                Pick a different court
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDuplicateSearch(reviewDraft.name);
                setPickingDuplicate(true);
              }}
              className="mb-4 flex w-full items-center justify-center rounded-xl border border-dashed border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-sm font-semibold text-[#92400E] hover:bg-[#FEF3C7]"
            >
              It&apos;s a duplicate — pick existing court
            </button>
          )}
          <CoachSheetField label="Court name" htmlFor="review-court-name">
            <input
              id="review-court-name"
              className="coach-input"
              value={reviewDraft.name}
              onChange={(e) => setReviewDraft((d) => ({ ...d, name: e.target.value }))}
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Address" htmlFor="review-court-address">
            <input
              id="review-court-address"
              className="coach-input"
              value={reviewDraft.address}
              onChange={(e) => setReviewDraft((d) => ({ ...d, address: e.target.value }))}
              required
            />
          </CoachSheetField>
          <CoachSheetField label="City" htmlFor="review-court-city">
            <input
              id="review-court-city"
              className="coach-input"
              value={reviewDraft.city}
              onChange={(e) => setReviewDraft((d) => ({ ...d, city: e.target.value }))}
            />
          </CoachSheetField>
          <CoachSheetField label="Region" htmlFor="review-court-region">
            <input
              id="review-court-region"
              className="coach-input"
              value={reviewDraft.region}
              onChange={(e) => setReviewDraft((d) => ({ ...d, region: e.target.value }))}
            />
          </CoachSheetField>
          <CoachSheetField
            label="Google Maps link (optional)"
            htmlFor="review-court-maps"
            hint="Approving adds this court and assigns it to the coach."
          >
            <input
              id="review-court-maps"
              className="coach-input"
              type="url"
              value={reviewDraft.mapsUrl}
              onChange={(e) => setReviewDraft((d) => ({ ...d, mapsUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </CoachSheetField>
        </form>
        )}
      </CoachBottomSheet>

      <CoachBottomSheet
        open={addOpen}
        onClose={() => {
          if (saving) return;
          setAddOpen(false);
          resetForm();
        }}
        title="Add court"
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

      <CoachBottomSheet
        open={!!editing}
        onClose={() => {
          if (busyCourtId === editing?.id) return;
          setEditing(null);
        }}
        title="Edit court"
        footer={
          <div className="flex gap-2">
            <CoachButton
              type="button"
              variant="outline"
              className="flex-1"
              disabled={busyCourtId === editing?.id}
              onClick={() => setEditing(null)}
            >
              Cancel
            </CoachButton>
            <CoachButton
              type="submit"
              form={EDIT_COURT_FORM_ID}
              className="flex-1"
              loading={busyCourtId === editing?.id}
              loadingLabel="Saving…"
            >
              Save changes
            </CoachButton>
          </div>
        }
      >
        <form id={EDIT_COURT_FORM_ID} className="coach-form" onSubmit={(e) => void handleEdit(e)}>
          <CoachSheetField label="Court name" htmlFor="edit-court-name">
            <input
              id="edit-court-name"
              className="coach-input"
              value={editDraft.name}
              onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Address" htmlFor="edit-court-address">
            <input
              id="edit-court-address"
              className="coach-input"
              value={editDraft.address}
              onChange={(e) => setEditDraft((d) => ({ ...d, address: e.target.value }))}
              required
            />
          </CoachSheetField>
          <CoachSheetField label="City" htmlFor="edit-court-city">
            <input
              id="edit-court-city"
              className="coach-input"
              value={editDraft.city}
              onChange={(e) => setEditDraft((d) => ({ ...d, city: e.target.value }))}
            />
          </CoachSheetField>
          <CoachSheetField label="Region" htmlFor="edit-court-region">
            <input
              id="edit-court-region"
              className="coach-input"
              value={editDraft.region}
              onChange={(e) => setEditDraft((d) => ({ ...d, region: e.target.value }))}
            />
          </CoachSheetField>
          <CoachSheetField label="Google Maps link (optional)" htmlFor="edit-court-maps">
            <input
              id="edit-court-maps"
              className="coach-input"
              type="url"
              value={editDraft.mapsUrl}
              onChange={(e) => setEditDraft((d) => ({ ...d, mapsUrl: e.target.value }))}
              placeholder="https://maps.google.com/..."
            />
          </CoachSheetField>
        </form>
      </CoachBottomSheet>

      <div className={cn(adminListClass, "mt-5")}>
        {filtered.length === 0 ? (
          <div className={cn(adminListEmptyClass, "border-0")}>
            {courtList.length === 0 ? "No courts yet" : "No courts match"}
          </div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {filtered.map((c) => {
              const isActive = c.isActive !== false;
              const busy = busyCourtId === c.id;
              return (
                <li
                  key={c.id}
                  className={cn(
                    adminListRowClass({ muted: !isActive }),
                    "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                        {c.name}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          isActive
                            ? "bg-[#E5EFE8] text-[#3D5C47]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        )}
                      >
                        {isActive ? "Active" : "Off"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[#6B7280]">
                      {[c.city || c.address, c.region].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1">
                    {c.mapsUrl ? (
                      <a
                        href={c.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#4F8FF7] hover:bg-[#EFF6FF]"
                        title="Maps"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => openEdit(c)}
                      className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleActive(c)}
                      className={cn(
                        "inline-flex h-9 items-center rounded-lg px-2 text-xs font-semibold disabled:opacity-50",
                        isActive
                          ? "text-[#B91C1C] hover:bg-[#FEF2F2]"
                          : "text-[#166534] hover:bg-[#F0FDF4]"
                      )}
                    >
                      {busy ? "…" : isActive ? "Off" : "On"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void removeCourt(c.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminPageShell>
  );
}
