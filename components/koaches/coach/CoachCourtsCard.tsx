"use client";

import { useMemo, useState } from "react";
import { Check, MapPin, Plus, Search } from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import {
  submitCourtRequestAction,
  updateMyCourtIdsAction,
} from "@/lib/koaches/actions/courts";
import { invalidateCoachCourts, invalidateCoachProfile } from "@/lib/koaches/queries/invalidate";
import { useCourts, useMyCourtRequests } from "@/hooks/useCourts";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";

const REQUEST_FORM_ID = "coach-request-court-form";

type CoachCourtsCardProps = {
  coachId: string;
  coach: CoachProfile;
  initialOpen?: boolean;
  onSaved?: () => void;
};

export function CoachCourtsCard({
  coachId,
  coach,
  initialOpen = false,
  onSaved,
}: CoachCourtsCardProps) {
  const { showToast } = useCoachToast();
  const { courts: allCourts, loading: courtsLoading } = useCourts();
  const { requests, refresh: refreshRequests } = useMyCourtRequests(coachId);

  const [editOpen, setEditOpen] = useState(initialOpen);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestFromEdit, setRequestFromEdit] = useState(false);
  const [draftIds, setDraftIds] = useState<string[]>(() => [...coach.courtIds]);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [syncedCourtIds, setSyncedCourtIds] = useState(coach.courtIds);
  const [wasInitialOpen, setWasInitialOpen] = useState(initialOpen);

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("Metro Manila");
  const [mapsUrl, setMapsUrl] = useState("");

  if (coach.courtIds !== syncedCourtIds) {
    setSyncedCourtIds(coach.courtIds);
    if (!editOpen) setDraftIds([...coach.courtIds]);
  }

  if (initialOpen && !wasInitialOpen) {
    setWasInitialOpen(true);
    setEditOpen(true);
  }

  const openEditor = () => {
    setDraftIds([...coach.courtIds]);
    setSearch("");
    setEditOpen(true);
  };

  const selectedCourts = useMemo(() => {
    const byId = new Map(allCourts.map((c) => [c.id, c]));
    return coach.courtIds.map((id) => byId.get(id)).filter(Boolean);
  }, [allCourts, coach.courtIds]);

  const pending = requests.filter((r) => r.status === "pending");

  const visibleCourts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = !q
      ? allCourts
      : allCourts.filter((court) =>
          [court.name, court.address, court.city, court.region].some((value) =>
            value?.toLowerCase().includes(q)
          )
        );
    // Selected courts stay at the top of the list.
    const selected = new Set(draftIds);
    return [...filtered].sort((a, b) => {
      const aOn = selected.has(a.id) ? 0 : 1;
      const bOn = selected.has(b.id) ? 0 : 1;
      if (aOn !== bOn) return aOn - bOn;
      return a.name.localeCompare(b.name);
    });
  }, [allCourts, draftIds, search]);

  const toggleDraft = (courtId: string) => {
    setDraftIds((prev) =>
      prev.includes(courtId) ? prev.filter((id) => id !== courtId) : [...prev, courtId]
    );
  };

  const resetRequestForm = () => {
    setName("");
    setAddress("");
    setCity("");
    setRegion("Metro Manila");
    setMapsUrl("");
  };

  const saveCourts = async () => {
    setSaving(true);
    try {
      const result = await updateMyCourtIdsAction(draftIds);
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      invalidateCoachProfile(coachId);
      invalidateCoachCourts(coachId);
      onSaved?.();
      showToast("Courts updated");
      setEditOpen(false);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save courts", "error");
    } finally {
      setSaving(false);
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequesting(true);
    try {
      const result = await submitCourtRequestAction({
        name,
        address,
        city,
        region,
        mapsUrl: mapsUrl || undefined,
      });
      if (!result.ok) {
        showToast(result.error, "error");
        return;
      }
      await refreshRequests();
      resetRequestForm();
      setRequestOpen(false);
      showToast("Court request sent. We'll review it soon.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not send request", "error");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      <div className="coach-card mt-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-heading font-semibold">Your courts</p>
            <p className="text-sm text-[#6B7280]">
              Where you coach. Used when you schedule sessions.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-[#4F8FF7]"
            onClick={openEditor}
          >
            Edit
          </button>
        </div>

        {selectedCourts.length === 0 ? (
          <p className="mt-3 text-sm text-[#9CA3AF]">No courts yet. Add the places you teach.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {selectedCourts.map((court) => (
              <li
                key={court!.id}
                className="flex items-start gap-2 rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                <div className="min-w-0">
                  <p className="font-medium text-[#111827]">{court!.name}</p>
                  <p className="text-xs text-[#6B7280]">
                    {[court!.city, court!.region].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {pending.length > 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5">
            <p className="text-xs font-semibold text-[#92400E]">
              Waiting for review ({pending.length})
            </p>
            <ul className="mt-1 space-y-0.5">
              {pending.map((r) => (
                <li key={r.id} className="text-sm text-[#78350F]">
                  {r.name}
                  {r.city ? ` · ${r.city}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setRequestFromEdit(false);
            setRequestOpen(true);
          }}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-1.5 text-sm font-semibold text-[#16A34A]"
        >
          <Plus className="h-4 w-4" />
          Request a new court
        </button>
      </div>

      <CoachBottomSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Your courts"
        subtitle="Pick the courts you teach at"
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="button"
              className="w-full"
              loading={saving}
              loadingLabel="Saving…"
              onClick={() => void saveCourts()}
            >
              Save courts
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        {courtsLoading ? (
          <p className="text-sm text-[#6B7280]">Loading courts…</p>
        ) : allCourts.length === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No courts in the directory yet. Request yours below.
          </p>
        ) : (
          <>
            <div className="sticky -top-4 z-10 -mx-4 border-b border-[#F3F4F6] bg-white px-4 pb-3 pt-4 md:-mx-6 md:px-6">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by court or city"
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3 text-sm text-[#111827] outline-none ring-[#16A34A]/30 placeholder:text-[#9CA3AF] focus:border-[#86EFAC] focus:ring-2"
                />
              </label>
            </div>

            {visibleCourts.length === 0 ? (
              <p className="mt-4 text-sm text-[#6B7280]">
                No courts match that. Try another search, or request the court below.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {visibleCourts.map((court) => {
                  const on = draftIds.includes(court.id);
                  return (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => toggleDraft(court.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                        on ? "border-[#16A34A] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-white"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                          on ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-[#D1D5DB]"
                        )}
                      >
                        {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="font-heading block text-sm font-semibold text-[#111827]">
                          {court.name}
                        </span>
                        <span className="block text-xs text-[#6B7280]">
                          {[court.address, court.city, court.region].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => {
            if (!name && search.trim()) setName(search.trim());
            setRequestFromEdit(true);
            setEditOpen(false);
            setRequestOpen(true);
          }}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#BBF7D0] bg-[#F0FDF4]/50 text-sm font-semibold text-[#166534]"
        >
          <Plus className="h-4 w-4" />
          Court not listed? Request it
        </button>
      </CoachBottomSheet>

      <CoachBottomSheet
        open={requestOpen}
        onClose={() => {
          setRequestOpen(false);
          setRequestFromEdit(false);
        }}
        onBack={
          requestFromEdit
            ? () => {
                setRequestOpen(false);
                setEditOpen(true);
              }
            : undefined
        }
        backLabel="Your courts"
        title="Request a court"
        subtitle="We'll add it after a quick review"
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="submit"
              form={REQUEST_FORM_ID}
              className="w-full"
              loading={requesting}
              loadingLabel="Sending…"
            >
              Send request
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <form id={REQUEST_FORM_ID} className="coach-form space-y-4" onSubmit={(e) => void submitRequest(e)}>
          <CoachSheetField label="Court name" htmlFor="court-req-name">
            <input
              id="court-req-name"
              className="coach-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Smash Park BGC"
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Address" htmlFor="court-req-address">
            <input
              id="court-req-address"
              className="coach-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street / building"
              required
            />
          </CoachSheetField>
          <CoachSheetField label="City" htmlFor="court-req-city">
            <input
              id="court-req-city"
              className="coach-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Taguig"
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Region" htmlFor="court-req-region">
            <input
              id="court-req-region"
              className="coach-input"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Metro Manila"
            />
          </CoachSheetField>
          <CoachSheetField
            label="Google Maps link (optional)"
            htmlFor="court-req-maps"
            hint="Helps students find the venue"
          >
            <input
              id="court-req-maps"
              className="coach-input"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              inputMode="url"
            />
          </CoachSheetField>
        </form>
      </CoachBottomSheet>
    </>
  );
}
