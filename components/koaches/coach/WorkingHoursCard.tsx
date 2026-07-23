"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useState } from "react";
import { Clock, Plus, Trash2 } from "lucide-react";
import {
  createWorkingHoursWindowId,
  formatWorkingHoursSummary,
  validateWorkingHours,
  workingHoursFromDraft,
  workingHoursToDraft,
} from "@/lib/koaches/coach-availability";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";

const WORKING_HOURS_FORM_ID = "working-hours-form";

type DraftWindow = {
  id: string;
  startValue: string;
  endValue: string;
};

export function WorkingHoursCard() {
  const coachId = usePortalCoachId();
  const { workingHours, setWorkingHours } = useCoachAvailability(coachId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftWindow[]>(() => workingHoursToDraft(workingHours));
  const [saving, setSaving] = useState(false);
  const { showToast } = useCoachToast();

  const openEditor = () => {
    setDraft(workingHoursToDraft(workingHours));
    setOpen(true);
  };

  const updateWindow = (id: string, patch: Partial<Pick<DraftWindow, "startValue" | "endValue">>) => {
    setDraft((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addWindow = () => {
    setDraft((rows) => [
      ...rows,
      { id: createWorkingHoursWindowId(), startValue: "18:00", endValue: "22:00" },
    ]);
  };

  const removeWindow = (id: string) => {
    setDraft((rows) => (rows.length <= 1 ? rows : rows.filter((row) => row.id !== id)));
  };

  return (
    <>
      <div className="coach-card mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
              <Clock className="h-5 w-5 text-[#166534]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-heading font-semibold">Working hours</p>
              <p className="text-sm text-[#6B7280]">{formatWorkingHoursSummary(workingHours)}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Add multiple windows if you only coach mornings, evenings, or split shifts.
              </p>
            </div>
          </div>
          <button type="button" className="shrink-0 text-sm font-semibold text-[#4F8FF7]" onClick={openEditor}>
            Edit
          </button>
        </div>
      </div>

      <CoachBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Working hours"
        subtitle="When students can usually book you. Add as many windows as you need."
        footer={
          <CoachSheetFooter>
            <CoachButton type="submit" form={WORKING_HOURS_FORM_ID} loading={saving} loadingLabel="Saving…">
              Save hours
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <form
          id={WORKING_HOURS_FORM_ID}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const next = workingHoursFromDraft(draft);
            const error = validateWorkingHours(next);
            if (error) {
              showToast(error, "error");
              return;
            }
            void (async () => {
              setSaving(true);
              try {
                await setWorkingHours(next);
                showToast("Working hours saved");
                setOpen(false);
              } catch {
                showToast("Couldn't save working hours. Please try again.", "error");
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          <div className="space-y-3">
            {draft.map((row, index) => (
              <div key={row.id} className="rounded-xl border border-[#E5E7EB] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Window {index + 1}
                  </p>
                  {draft.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWindow(row.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#EF4444]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <CoachSheetField label="Start">
                    <input
                      type="time"
                      className="coach-input"
                      value={row.startValue}
                      onChange={(e) => updateWindow(row.id, { startValue: e.target.value })}
                      required
                    />
                  </CoachSheetField>
                  <CoachSheetField label="End">
                    <input
                      type="time"
                      className="coach-input"
                      value={row.endValue}
                      onChange={(e) => updateWindow(row.id, { endValue: e.target.value })}
                      required
                    />
                  </CoachSheetField>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addWindow}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#16A34A]/50 bg-[#F0FDF4]/50 text-sm font-semibold text-[#4F8FF7]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add another window
          </button>

          <p className="text-xs text-[#6B7280]">
            Example: 6:00 AM – 8:00 AM and 7:00 PM – 10:00 PM for early-bird + evening coaching.
          </p>
        </form>
      </CoachBottomSheet>
    </>
  );
}
