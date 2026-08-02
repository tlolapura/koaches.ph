"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useState } from "react";
import { Clock, Copy, Plus, Trash2 } from "lucide-react";
import {
  WEEKDAY_DISPLAY_ORDER,
  WEEKDAY_FULL_LABELS,
  WEEKDAY_SHORT_LABELS,
  copyDayToAllDays,
  copyDayToWeekdays,
  createWorkingHoursWindowId,
  formatWorkingHoursSummary,
  validateWorkingHours,
  workingHoursFromDraft,
  workingHoursToDraft,
  type DraftDay,
} from "@/lib/koaches/coach-availability";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { cn } from "@/lib/utils";

const WORKING_HOURS_FORM_ID = "working-hours-form";

function emptyWindow(): DraftDay["windows"][number] {
  return { id: createWorkingHoursWindowId(), startValue: "08:00", endValue: "22:00" };
}

export function WorkingHoursCard() {
  const coachId = usePortalCoachId();
  const { workingHours, setWorkingHours } = useCoachAvailability(coachId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftDay[]>(() => workingHoursToDraft(workingHours));
  const [focusDay, setFocusDay] = useState(1); // Monday
  const [saving, setSaving] = useState(false);
  const { showToast } = useCoachToast();

  const openEditor = () => {
    setDraft(workingHoursToDraft(workingHours));
    setFocusDay(1);
    setOpen(true);
  };

  const updateWindow = (
    dayIndex: number,
    windowId: string,
    patch: Partial<{ startValue: string; endValue: string }>
  ) => {
    setDraft((rows) =>
      rows.map((row, i) =>
        i !== dayIndex
          ? row
          : {
              ...row,
              windows: row.windows.map((w) => (w.id === windowId ? { ...w, ...patch } : w)),
            }
      )
    );
  };

  const addWindow = (dayIndex: number) => {
    setDraft((rows) =>
      rows.map((row, i) =>
        i !== dayIndex
          ? row
          : {
              ...row,
              enabled: true,
              windows: [...row.windows, emptyWindow()],
            }
      )
    );
  };

  const removeWindow = (dayIndex: number, windowId: string) => {
    setDraft((rows) =>
      rows.map((row, i) => {
        if (i !== dayIndex) return row;
        if (row.windows.length <= 1) return row;
        return { ...row, windows: row.windows.filter((w) => w.id !== windowId) };
      })
    );
  };

  const toggleDay = (dayIndex: number, enabled: boolean) => {
    setDraft((rows) =>
      rows.map((row, i) => {
        if (i !== dayIndex) return row;
        if (!enabled) return { ...row, enabled: false };
        return {
          enabled: true,
          windows: row.windows.length > 0 ? row.windows : [emptyWindow()],
        };
      })
    );
    if (enabled) setFocusDay(dayIndex);
  };

  const applyCopy = (mode: "weekdays" | "all") => {
    const hours = workingHoursFromDraft(draft);
    const next = mode === "weekdays" ? copyDayToWeekdays(hours, focusDay) : copyDayToAllDays(hours, focusDay);
    setDraft(workingHoursToDraft(next));
    showToast(
      mode === "weekdays"
        ? `Copied ${WEEKDAY_SHORT_LABELS[focusDay]} to Mon–Fri`
        : `Copied ${WEEKDAY_SHORT_LABELS[focusDay]} to every day`
    );
  };

  return (
    <>
      <div className="coach-card mt-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
              <Clock className="h-5 w-5 text-[#166534]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold">Working hours</p>
              <p className="text-sm text-[#6B7280]">{formatWorkingHoursSummary(workingHours)}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Set different hours per day. Use time off on the calendar for one-off exceptions.
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
        subtitle="Choose which days you’re available, then set the times for each day."
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyCopy("weekdays")}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151]"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy {WEEKDAY_SHORT_LABELS[focusDay]} → weekdays
            </button>
            <button
              type="button"
              onClick={() => applyCopy("all")}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151]"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy → all days
            </button>
          </div>

          <div className="space-y-3">
            {WEEKDAY_DISPLAY_ORDER.map((dayIndex) => {
              const day = draft[dayIndex] ?? { enabled: false, windows: [] };
              const focused = focusDay === dayIndex;
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "rounded-xl border p-3 transition-colors",
                    focused ? "border-[#16A34A] bg-[#F0FDF4]/40" : "border-[#E5E7EB] bg-white"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setFocusDay(dayIndex)}
                      className="min-w-0 text-left"
                    >
                      <p className="font-heading text-sm font-semibold text-[#111827]">
                        {WEEKDAY_FULL_LABELS[dayIndex]}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {day.enabled
                          ? day.windows.length === 1
                            ? "1 window"
                            : `${day.windows.length} windows`
                          : "Day off"}
                      </p>
                    </button>
                    <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-medium text-[#374151]">
                      <span className="text-xs text-[#6B7280]">{day.enabled ? "On" : "Off"}</span>
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-[#D1D5DB] text-[#16A34A] focus:ring-[#16A34A]"
                        checked={day.enabled}
                        onChange={(e) => toggleDay(dayIndex, e.target.checked)}
                      />
                    </label>
                  </div>

                  {day.enabled ? (
                    <div className="mt-3 space-y-3">
                      {day.windows.map((row, index) => (
                        <div key={row.id} className="rounded-lg border border-[#E5E7EB] bg-white p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                              Window {index + 1}
                            </p>
                            {day.windows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeWindow(dayIndex, row.id)}
                                className="-my-2 inline-flex min-h-[44px] items-center gap-1 text-xs font-medium text-[#EF4444]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <CoachSheetField label="Start" htmlFor={`day-${dayIndex}-w-${row.id}-start`}>
                              <input
                                id={`day-${dayIndex}-w-${row.id}-start`}
                                type="time"
                                className="coach-input"
                                value={row.startValue}
                                onChange={(e) =>
                                  updateWindow(dayIndex, row.id, { startValue: e.target.value })
                                }
                                onFocus={() => setFocusDay(dayIndex)}
                                required
                              />
                            </CoachSheetField>
                            <CoachSheetField label="End" htmlFor={`day-${dayIndex}-w-${row.id}-end`}>
                              <input
                                id={`day-${dayIndex}-w-${row.id}-end`}
                                type="time"
                                className="coach-input"
                                value={row.endValue}
                                onChange={(e) =>
                                  updateWindow(dayIndex, row.id, { endValue: e.target.value })
                                }
                                onFocus={() => setFocusDay(dayIndex)}
                                required
                              />
                            </CoachSheetField>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setFocusDay(dayIndex);
                          addWindow(dayIndex);
                        }}
                        className="inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#16A34A]/50 bg-[#F0FDF4]/50 text-sm font-semibold text-[#4F8FF7]"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        Add window
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </form>
      </CoachBottomSheet>
    </>
  );
}
