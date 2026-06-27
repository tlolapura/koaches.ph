"use client";

import { useState } from "react";
import type { Session } from "@/lib/koaches/types";
import { updateSessionScheduleAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useCoachCourts } from "@/hooks/useCourts";
import { parseDisplayTime } from "@/lib/koaches/session-time";

function endTimeOneHourAfter(time: string): string {
  const total = parseDisplayTime(time) + 60;
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

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
  const [time, setTime] = useState("8:00 AM");
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
          const endTime = endTimeOneHourAfter(time);
          await updateSessionScheduleAction(session.id, { date, time, endTime, courtId });
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
