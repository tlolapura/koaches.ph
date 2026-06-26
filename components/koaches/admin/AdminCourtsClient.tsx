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
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
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
    try {
      const id = await createCourtAction({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        region: region.trim(),
        mapsUrl: mapsUrl.trim() || undefined,
      });
      setCourtList((prev) => [
        ...prev,
        {
          id,
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
    const next = court.isActive === false;
    await updateCourtActiveAction(court.id, next);
    setCourtList((prev) => prev.map((c) => (c.id === court.id ? { ...c, isActive: next } : c)));
    router.refresh();
  };

  const removeCourt = async (id: string) => {
    await deleteCourtAction(id);
    setCourtList((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
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

      {addOpen && (
        <form className="coach-card mt-6 space-y-4 p-4" onSubmit={(e) => void handleAdd(e)}>
          <p className="font-heading font-semibold">New court</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#6B7280]">Court name</label>
              <input className="coach-input mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#6B7280]">Address</label>
              <input className="coach-input mt-1" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280]">City</label>
              <input className="coach-input mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B7280]">Region</label>
              <input className="coach-input mt-1" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#6B7280]">Google Maps link (optional)</label>
              <input
                className="coach-input mt-1"
                type="url"
                value={mapsUrl}
                onChange={(e) => setMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="coach-btn-primary w-auto px-5" disabled={saving}>
              {saving ? "Saving…" : "Save court"}
            </button>
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEEE9]">
                    <MapPin className="h-5 w-5 text-[#8B4D3A]" />
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
                  <a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[#E07A5F]">
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
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#E07A5F]"
                  onClick={() => void toggleActive(c)}
                >
                  {c.isActive !== false ? "Deactivate" : "Activate"}
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#6B7280] hover:text-red-500"
                  onClick={() => void removeCourt(c.id)}
                >
                  <Trash2 className="mr-0.5 inline h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminPageShell>
  );
}
