"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";
import type { Court } from "@/lib/koaches/types";
import {
  createCourtAction,
  deleteCourtAction,
  updateCourtActiveAction,
} from "@/lib/koaches/actions/courts";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { cn } from "@/lib/utils";

type AdminCourtsClientProps = {
  initialCourts: Court[];
};

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

  const resetForm = () => {
    setName("");
    setAddress("");
    setCity("");
    setRegion("Metro Manila");
    setMapsUrl("");
  };

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

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Courts"
        subtitle="Platform-wide court directory. Coaches pick from courts you assign to them."
        className="mb-6"
        actions={
          <button
            type="button"
            className="coach-btn-primary w-full gap-2 px-5 md:w-auto"
            onClick={() => setAddOpen((o) => !o)}
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

      {addOpen && (
        <form className="coach-card coach-form mt-6 p-5 sm:p-6" onSubmit={(e) => void handleAdd(e)}>
          <p className="font-heading font-semibold">New court</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <CoachSheetField label="Court name" htmlFor="court-name" className="sm:col-span-2">
              <input
                id="court-name"
                className="coach-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ayala Malls Pickleball Courts"
                required
              />
            </CoachSheetField>
            <CoachSheetField label="Address" htmlFor="court-address" className="sm:col-span-2">
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
            <CoachSheetField
              label="Google Maps link (optional)"
              htmlFor="court-maps"
              className="sm:col-span-2"
            >
              <input
                id="court-maps"
                className="coach-input"
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </CoachSheetField>
          </div>
          <div className="flex gap-2">
            <CoachButton type="submit" className="w-auto px-5" loading={saving} loadingLabel="Saving…">
              Save court
            </CoachButton>
            <button
              type="button"
              className="coach-btn-outline w-auto px-5"
              onClick={() => {
                setAddOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {courtList.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No courts yet. Add your first court above.</p>
        ) : (
          courtList.map((c) => (
            <div key={c.id} className={cn("coach-card p-4", c.isActive === false && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
                    <MapPin className="h-5 w-5 text-[#166534]" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold">{c.name}</p>
                    <p className="text-sm text-[#6B7280]">{c.address}</p>
                    {(c.city || c.region) && (
                      <p className="text-xs text-[#9CA3AF]">{[c.city, c.region].filter(Boolean).join(", ")}</p>
                    )}
                  </div>
                </div>
                {c.mapsUrl && (
                  <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#4F8FF7]">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    c.isActive !== false ? "bg-[#E5EFE8] text-[#3D5C47]" : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {c.isActive !== false ? "Active" : "Inactive"}
                </span>
                <button
                  type="button"
                  disabled={busyCourtId === c.id}
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#4F8FF7] disabled:opacity-60"
                  onClick={() => void toggleActive(c)}
                >
                  {busyCourtId === c.id ? "…" : c.isActive !== false ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  disabled={busyCourtId === c.id}
                  className="text-xs font-semibold text-[#6B7280] hover:text-red-500 disabled:opacity-60"
                  onClick={() => void removeCourt(c.id)}
                >
                  <Trash2 className="mr-0.5 inline h-3.5 w-3.5" />
                  {busyCourtId === c.id ? "…" : "Remove"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminPageShell>
  );
}
