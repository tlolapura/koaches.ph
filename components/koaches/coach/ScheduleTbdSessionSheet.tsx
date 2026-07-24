"use client";

import { useState } from "react";
import type { Session } from "@/lib/koaches/types";
import { updateSessionScheduleAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions, patchCachedSession } from "@/lib/koaches/queries/invalidate";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useCoachCourts } from "@/hooks/useCourts";
import { addMinutesToTimeValue, formatTimeDisplay } from "@/lib/koaches/session-time";

const FORM_ID = "schedule-tbd-form";

type ScheduleTbdSessionSheetProps = {
  open: boolean;
  onClose: () => void;
  session: Session;
  onScheduled: () => void;
};

export function ScheduleTbdSessionSheet({
  open,
  onClose,
  session,
  onScheduled,
}: ScheduleTbdSessionSheetProps) {
  const { courts } = useCoachCourts(session.coachId);
  const { showToast } = useCoachToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("08:00");
  const [saving, setSaving] = useState(false);

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Schedule session"
      subtitle="Pick a date and time for this session"
      footer={
        <CoachSheetFooter>
          <CoachButton type="submit" form={FORM_ID} loading={saving} loadingLabel="Saving…">
            Save schedule
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <form
        id={FORM_ID}
        className="coach-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
          const fd = new FormData(e.currentTarget);
          const courtId = String(fd.get("courtId") ?? session.courtId);
          const displayTime = formatTimeDisplay(time);
          const endTime = formatTimeDisplay(addMinutesToTimeValue(time, 60));
          await updateSessionScheduleAction(session.id, {
            date,
            time: displayTime,
            endTime,
            courtId,
          });
          patchCachedSession(session.coachId, session.id, {
            date,
            time: displayTime,
            endTime,
            courtId,
          });
          invalidateCoachSessions(session.coachId);
          showToast("Session scheduled");
          onScheduled();
          onClose();
          } catch (err) {
            showToast(err instanceof Error ? err.message : "Could not save schedule", "error");
          } finally {
            setSaving(false);
          }
        }}
      >
        <CoachSheetField label="Date">
          <CoachDatePicker value={date} onChange={setDate} required />
        </CoachSheetField>
        <CoachSheetField label="Start time">
          <CoachTimePicker value={time} onChange={setTime} />
        </CoachSheetField>
        <CoachSheetField label="Court">
          <CoachSelect
            name="courtId"
            defaultValue={session.courtId}
            options={courts.map((c) => ({ value: c.id, label: c.name }))}
          />
        </CoachSheetField>
      </form>
    </CoachBottomSheet>
  );
}
