"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import type { Program, Student, SessionPaymentStatus } from "@/lib/koaches/types";
import { useCoachCourts } from "@/hooks/useCourts";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { notifySessionsUpdated, useCoachSessions } from "@/hooks/useCoachSessions";
import { createSessionsAction } from "@/lib/koaches/actions/sessions";
import {
  blockedSlotsToBusyIntervals,
  workingHoursToIntervals,
} from "@/lib/koaches/coach-availability";
import {
  buildProgramSession,
  countProgramSessionsCompleted,
  getNextProgramSessionNumber,
  hasProgramSessionConflict,
} from "@/lib/koaches/schedule-program-sessions";
import { isFirstProgramSessionNumber } from "@/lib/koaches/session-schedule";
import { formatTimeDisplay } from "@/lib/koaches/session-time";
import { formatDisplayDate } from "@/lib/utils";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { SessionPaymentFields } from "@/components/koaches/coach/SessionPaymentFields";
import { SessionTimeFields } from "@/components/koaches/coach/SessionTimeFields";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";

const FORM_ID = "add-program-session-form";

type ScheduleProgramSessionsSheetProps = {
  program: Program;
  open: boolean;
  onClose: () => void;
};

export function ScheduleProgramSessionsSheet({
  program,
  open,
  onClose,
}: ScheduleProgramSessionsSheetProps) {
  const coachId = usePortalCoachId();
  const { showToast } = useCoachToast();
  const { sessions: allSessions } = useCoachSessions(coachId);
  const { workingHours, blockedSlots } = useCoachAvailability(coachId);
  const { courts } = useCoachCourts(coachId);

  const { students: rosterStudents } = useCoachStudents(coachId, true);

  const enrolled = useMemo((): Student[] => {
    const idSet = new Set(program.enrolledStudentIds);
    return rosterStudents.filter((s) => idSet.has(s.id) && !s.isArchived);
  }, [program.enrolledStudentIds, rosterStudents]);

  const availabilityWindows = useMemo(
    () => workingHoursToIntervals(workingHours),
    [workingHours]
  );

  const blockedForDate = useMemo(
    () => (day: string) => blockedSlotsToBusyIntervals(blockedSlots, day),
    [blockedSlots]
  );

  const [studentId, setStudentId] = useState(() => enrolled[0]?.id ?? "");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [courtId, setCourtId] = useState(() => courts[0]?.id ?? "");
  const [paymentStatus, setPaymentStatus] = useState<SessionPaymentStatus>("unpaid");
  const [saving, setSaving] = useState(false);

  const student = enrolled.find((s) => s.id === studentId) ?? enrolled[0];

  useEffect(() => {
    if (open && enrolled[0] && !enrolled.some((s) => s.id === studentId)) {
      setStudentId(enrolled[0].id);
    }
  }, [open, enrolled, studentId]);

  const nextSessionNumber = useMemo(() => {
    if (!student) return undefined;
    return getNextProgramSessionNumber(program, student, allSessions);
  }, [program, student, allSessions]);

  const isFirstProgramSession = isFirstProgramSessionNumber(nextSessionNumber);
  const dateRequired = isFirstProgramSession;

  useEffect(() => {
    if (!open || !nextSessionNumber) return;
    if (isFirstProgramSession) {
      setDate(format(new Date(), "yyyy-MM-dd"));
    } else {
      setDate("");
    }
  }, [open, nextSessionNumber, isFirstProgramSession, studentId]);

  const hasConflict = useMemo(
    () =>
      hasProgramSessionConflict({
        sessions: allSessions,
        date: date || undefined,
        startTime,
        blockedForDate,
        availabilityWindows,
      }),
    [allSessions, date, startTime, blockedForDate, availabilityWindows]
  );

  const canSave = useMemo(() => {
    if (!student || !nextSessionNumber) return false;
    if (isFirstProgramSession && !date) return false;
    if (date && hasConflict) return false;
    return true;
  }, [student, nextSessionNumber, isFirstProgramSession, date, hasConflict]);

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Add program session"
      subtitle={`${program.name} · book one session at a time`}
      footer={
        <CoachSheetFooter>
          <CoachButton
            type="submit"
            form={FORM_ID}
            loading={saving}
            loadingLabel="Saving…"
            disabled={!canSave}
          >
            {nextSessionNumber ? `Save session ${nextSessionNumber}` : "Nothing to schedule"}
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      {enrolled.length === 0 ? (
        <p className="text-sm text-[#6B7280]">
          Enroll a student in this program before scheduling sessions.
        </p>
      ) : (
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!student || !nextSessionNumber || !canSave || saving) return;

            setSaving(true);
            try {
            const session = buildProgramSession({
              coachId,
              program,
              student,
              sessionNumber: nextSessionNumber,
              date: date || undefined,
              startTime: date ? startTime : undefined,
              courtId,
              paymentStatus,
            });

            await createSessionsAction([session]);
            notifySessionsUpdated(coachId);
            showToast(
              date
                ? `Session ${nextSessionNumber} scheduled for ${student.name}`
                : `Session ${nextSessionNumber} saved. Add a date when ready.`
            );
            onClose();
            } catch (e) {
              showToast(e instanceof Error ? e.message : "Could not save session", "error");
            } finally {
              setSaving(false);
            }
          }}
        >
          <CoachSheetField label="Student">
            <CoachSelect
              value={studentId}
              onChange={setStudentId}
              options={enrolled.map((s) => ({
                value: s.id,
                label: `${s.name} · ${countProgramSessionsCompleted(s.id, program.id, allSessions)} of ${program.sessionCount} done`,
              }))}
            />
          </CoachSheetField>

          {student && !nextSessionNumber ? (
            <div className="rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-3 text-sm text-[#065F46]">
              {student.name} already has all {program.sessionCount} sessions booked or completed.
            </div>
          ) : (
            <>
              {nextSessionNumber && (
                <div className="rounded-xl bg-[#F0FDF4] px-3 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#166534]">
                    {isFirstProgramSession ? "First program session" : "Next session"}
                  </p>
                  <p className="font-heading mt-0.5 text-sm font-semibold text-[#111827]">
                    Session {nextSessionNumber} of {program.sessionCount}
                    {isFirstProgramSession
                      ? " · first session date is required"
                      : " · date is optional"}
                  </p>
                </div>
              )}

              {hasConflict && (
                <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                  That time overlaps another session or is outside your working hours.
                </p>
              )}

              <CoachSheetField
                label={isFirstProgramSession ? "First session date" : "Date (optional)"}
                hint={
                  !isFirstProgramSession
                    ? "Leave empty to save this session without a date"
                    : undefined
                }
              >
                <div className="space-y-2">
                  <CoachDatePicker
                    value={date}
                    onChange={setDate}
                    required={dateRequired}
                    placeholder={isFirstProgramSession ? "Pick a date" : "Schedule later"}
                  />
                  {!isFirstProgramSession && date && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#4F8FF7]"
                      onClick={() => setDate("")}
                    >
                      Clear date (schedule later)
                    </button>
                  )}
                </div>
              </CoachSheetField>

              {date && (
                <SessionTimeFields
                  startTime={startTime}
                  endTime={endTime}
                  fixedDurationMinutes={60}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
              )}

              {date && nextSessionNumber && (
                <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5 ring-1 ring-[#E5E7EB]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                    Schedule
                  </p>
                  <p className="font-heading mt-0.5 text-sm font-semibold text-[#111827]">
                    Session {nextSessionNumber} · {formatDisplayDate(date)} · {formatTimeDisplay(startTime)} –{" "}
                    {formatTimeDisplay(endTime)}
                  </p>
                </div>
              )}

              <CoachSheetField label="Court">
                <CoachSelect
                  value={courtId}
                  onChange={setCourtId}
                  options={courts.map((c) => ({ value: c.id, label: c.name }))}
                />
              </CoachSheetField>

              <SessionPaymentFields value={paymentStatus} onChange={setPaymentStatus} />
            </>
          )}
        </form>
      )}
    </CoachBottomSheet>
  );
}
