"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";
import { CoachStudentSearchSelect } from "@/components/koaches/coach/CoachStudentSearchSelect";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { useCourts } from "@/hooks/useCourts";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { useCreateClinic } from "@/hooks/useCoachClinics";
import type { ClinicSessionDraft } from "@/lib/koaches/types";
import { formatTimeDisplay, minutesToHtmlValue, parseTimeToMinutes } from "@/lib/koaches/session-time";
import { buildTimeOptions } from "@/lib/koaches/time-options";

type AddClinicSheetProps = {
  open: boolean;
  onClose: () => void;
};

function blankDraft(courtId: string): ClinicSessionDraft {
  return {
    date: format(new Date(), "yyyy-MM-dd"),
    time: "9:00 AM",
    endTime: "12:00 PM",
    courtId,
  };
}

const CLINIC_TIME_OPTIONS = buildTimeOptions(30, 6, 21);

export function AddClinicSheet({ open, onClose }: AddClinicSheetProps) {
  const coachId = usePortalCoachId();
  const router = useRouter();
  const { showToast } = useCoachToast();
  const { courts } = useCourts();
  const { students } = useCoachStudents(coachId);
  const createClinic = useCreateClinic(coachId);
  const activeCourts = useMemo(() => courts.filter((c) => c.isActive), [courts]);
  const defaultCourtId = activeCourts[0]?.id ?? "";
  const courtOptions = useMemo(
    () => activeCourts.map((c) => ({ value: c.id, label: c.name })),
    [activeCourts]
  );

  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [description, setDescription] = useState("");
  const [courtId, setCourtId] = useState(defaultCourtId);
  const [capacity, setCapacity] = useState(12);
  const [pricingMode, setPricingMode] = useState<"per-player" | "flat">("per-player");
  const [pricePerPlayer, setPricePerPlayer] = useState(1500);
  const [flatPrice, setFlatPrice] = useState(8000);
  const [notes, setNotes] = useState("");
  const [dates, setDates] = useState<ClinicSessionDraft[]>([blankDraft(defaultCourtId)]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName("");
    setFocus("");
    setDescription("");
    setCourtId(defaultCourtId);
    setCapacity(12);
    setPricingMode("per-player");
    setPricePerPlayer(1500);
    setFlatPrice(8000);
    setNotes("");
    setDates([blankDraft(defaultCourtId)]);
    setSelectedStudentIds([]);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const updateDate = (index: number, patch: Partial<ClinicSessionDraft>) => {
    setDates((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const handleSave = async () => {
    if (!coachId) return;
    setSaving(true);
    try {
      const clinic = await createClinic.mutateAsync({
        name,
        focus,
        description,
        courtId: courtId || defaultCourtId,
        capacity,
        pricePerPlayer: pricingMode === "per-player" ? pricePerPlayer : undefined,
        flatPrice: pricingMode === "flat" ? flatPrice : undefined,
        notes,
        dates: dates.map((d) => ({
          ...d,
          courtId: d.courtId || courtId || defaultCourtId,
        })),
        studentIds: selectedStudentIds,
      });
      showToast("Clinic created");
      reset();
      onClose();
      router.push(`/coach/clinics/${clinic.id}`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not create clinic", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CoachBottomSheet
      open={open}
      onClose={handleClose}
      title="New clinic"
      subtitle="Plan a group clinic. Pick dates, set the roster, show up."
      wide
      footer={
        <CoachSheetFooter>
          <CoachButton type="button" className="w-full" loading={saving} onClick={() => void handleSave()}>
            Create clinic
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <div className="space-y-4">
        <CoachSheetField label="Clinic name" htmlFor="clinic-name">
          <input
            id="clinic-name"
            className="coach-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Beginner kitchen clinic"
          />
        </CoachSheetField>

        <CoachSheetField label="Focus" htmlFor="clinic-focus" hint="Shown on your public page">
          <input
            id="clinic-focus"
            className="coach-input"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Dinks, resets, kitchen positioning"
          />
        </CoachSheetField>

        <CoachSheetField label="Description" htmlFor="clinic-desc">
          <textarea
            id="clinic-desc"
            className="coach-input min-h-[80px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who it's for, what to bring…"
          />
        </CoachSheetField>

        <div className="grid grid-cols-2 gap-3">
          <CoachSheetField label="Court" htmlFor="clinic-court">
            <CoachSelect
              id="clinic-court"
              value={courtId || defaultCourtId}
              onChange={setCourtId}
              options={courtOptions}
              placeholder="Select court"
            />
          </CoachSheetField>
          <CoachSheetField label="Capacity" htmlFor="clinic-capacity">
            <input
              id="clinic-capacity"
              type="number"
              min={1}
              max={40}
              className="coach-input"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value) || 1)}
            />
          </CoachSheetField>
        </div>

        <div>
          <p className="coach-label mb-2">Pricing</p>
          <div className="mb-2 flex gap-2">
            {(
              [
                { id: "per-player" as const, label: "Per player" },
                { id: "flat" as const, label: "Flat fee" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPricingMode(opt.id)}
                className={`font-heading flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                  pricingMode === opt.id
                    ? "bg-[#16A34A] text-white"
                    : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {pricingMode === "per-player" ? (
            <CoachSheetField label="Ticket price (₱)" htmlFor="clinic-ppp">
              <input
                id="clinic-ppp"
                type="number"
                min={0}
                className="coach-input"
                value={pricePerPlayer}
                onChange={(e) => setPricePerPlayer(Number(e.target.value) || 0)}
              />
            </CoachSheetField>
          ) : (
            <CoachSheetField label="Flat clinic fee (₱)" htmlFor="clinic-flat">
              <input
                id="clinic-flat"
                type="number"
                min={0}
                className="coach-input"
                value={flatPrice}
                onChange={(e) => setFlatPrice(Number(e.target.value) || 0)}
              />
            </CoachSheetField>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="coach-label mb-0">Dates</p>
            <button
              type="button"
              onClick={() => setDates((prev) => [...prev, blankDraft(courtId || defaultCourtId)])}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add date
            </button>
          </div>
          {dates.map((draft, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#6B7280]">Session {index + 1}</p>
                {dates.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setDates((prev) => prev.filter((_, i) => i !== index))}
                    className="text-[#9CA3AF] hover:text-[#EF4444]"
                    aria-label="Remove date"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <CoachSheetField label="Date">
                <CoachDatePicker
                  value={draft.date}
                  onChange={(date) => updateDate(index, { date })}
                  placeholder="Pick a date"
                />
              </CoachSheetField>
              <div className="grid grid-cols-2 gap-2">
                <CoachSheetField label="Start">
                  <CoachTimePicker
                    value={minutesToHtmlValue(parseTimeToMinutes(draft.time))}
                    onChange={(value) => updateDate(index, { time: formatTimeDisplay(value) })}
                    options={CLINIC_TIME_OPTIONS}
                    placeholder="Start time"
                  />
                </CoachSheetField>
                <CoachSheetField label="End">
                  <CoachTimePicker
                    value={minutesToHtmlValue(parseTimeToMinutes(draft.endTime))}
                    onChange={(value) => updateDate(index, { endTime: formatTimeDisplay(value) })}
                    options={CLINIC_TIME_OPTIONS}
                    placeholder="End time"
                  />
                </CoachSheetField>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="coach-label mb-2">
            Roster ({selectedStudentIds.length}/{capacity})
          </p>
          <p className="mb-2 text-xs text-[#6B7280]">Optional. Search and add from your roster.</p>
          <CoachStudentSearchSelect
            students={students}
            value={selectedStudentIds}
            onChange={setSelectedStudentIds}
            max={capacity}
            placeholder="Search students to add…"
            emptyLabel={
              students.filter((s) => !s.isArchived).length === 0
                ? "No students on roster yet"
                : "No matching students"
            }
          />
        </div>

        <CoachSheetField label="Notes" htmlFor="clinic-notes">
          <textarea
            id="clinic-notes"
            className="coach-input min-h-[64px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes…"
          />
        </CoachSheetField>
      </div>
    </CoachBottomSheet>
  );
}
