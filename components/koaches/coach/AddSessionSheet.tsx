"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import type { Session, SessionParticipant, SessionPaymentStatus } from "@/lib/koaches/types";
import { notifySessionsUpdated, useCoachSessions } from "@/hooks/useCoachSessions";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { useCoachCourts } from "@/hooks/useCourts";
import { createSessionsAction } from "@/lib/koaches/actions/sessions";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { DEFAULT_SESSION_PRICING } from "@/lib/koaches/pricing";
import { suggestSessionPrice } from "@/lib/koaches/session-pricing";
import {
  findNearestAvailableSlot,
  getAvailableSlots,
  hasScheduleConflict,
  HOURLY_SESSION_MINUTES,
} from "@/lib/koaches/session-slots";
import { addMinutesToTimeValue, formatTimeDisplay } from "@/lib/koaches/session-time";
import { blockedSlotsToBusyIntervals, workingHoursToIntervals } from "@/lib/koaches/coach-availability";
import { participantFromStudent, resizeParticipants } from "@/lib/koaches/session-participants";
import { getNextProgramSessionNumber } from "@/lib/koaches/schedule-program-sessions";
import { isFirstProgramSessionNumber } from "@/lib/koaches/session-schedule";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { SessionParticipantsFields } from "@/components/koaches/coach/SessionParticipantsFields";
import { SessionPaymentFields } from "@/components/koaches/coach/SessionPaymentFields";
import { SessionPriceFields } from "@/components/koaches/coach/SessionPriceFields";
import { SessionTimeFields } from "@/components/koaches/coach/SessionTimeFields";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { formatDisplayDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ADD_SESSION_FORM_ID = "add-session-form";

type AddSessionSheetProps = {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
};

export function AddSessionSheet({
  open,
  onClose,
  initialDate,
  initialStartTime,
  initialEndTime,
}: AddSessionSheetProps) {
  const coachId = usePortalCoachId();
  const { showToast } = useCoachToast();
  const { coach } = useCoachProfile(coachId);
  const { programs } = useCoachPrograms(coachId);
  const { courts } = useCoachCourts(coachId);
  const { sessions: allSessions } = useCoachSessions(coachId);
  const { students: rosterStudents } = useCoachStudents(coachId);
  const { workingHours, blockedSlots } = useCoachAvailability(coachId);
  const roster = useMemo(() => rosterStudents.filter((s) => !s.isArchived), [rosterStudents]);

  const slotAvailabilityOptions = useMemo(
    () => ({
      availabilityWindows: workingHoursToIntervals(workingHours),
    }),
    [workingHours]
  );

  const blockedForDate = useMemo(
    () => (day: string) => blockedSlotsToBusyIntervals(blockedSlots, day),
    [blockedSlots]
  );

  const defaultDuration = HOURLY_SESSION_MINUTES;

  const [sessionType, setSessionType] = useState<"drop-in" | "program">("drop-in");
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(
    () => programs[0]?.id
  );
  const [playerCount, setPlayerCount] = useState(1);
  const [price, setPrice] = useState(800);
  const [paymentStatus, setPaymentStatus] = useState<SessionPaymentStatus>("unpaid");
  const [date, setDate] = useState(initialDate ?? format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState(() => addMinutesToTimeValue("08:00", defaultDuration));
  const [courtId, setCourtId] = useState("");
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);

  const selectedProgram =
    sessionType === "program"
      ? programs.find((p) => p.id === (selectedProgramId ?? programs[0]?.id ?? ""))
      : undefined;

  const primaryStudentId = participants.find((p) => p.studentId)?.studentId ?? "";
  const primaryStudent = roster.find((s) => s.id === primaryStudentId);

  const nextSessionNumber = useMemo(() => {
    if (!selectedProgram || !primaryStudent) return undefined;
    return getNextProgramSessionNumber(selectedProgram, primaryStudent, allSessions);
  }, [selectedProgram, primaryStudent, allSessions]);

  const isFirstProgramSession = isFirstProgramSessionNumber(nextSessionNumber);
  const dateRequired = sessionType === "drop-in" || isFirstProgramSession;
  const showScheduleFields =
    sessionType === "drop-in" || (sessionType === "program" && Boolean(nextSessionNumber));

  const hasConflict = useMemo(() => {
    if (!date) return false;
    return hasScheduleConflict(
      allSessions,
      date,
      startTime,
      endTime,
      undefined,
      blockedForDate(date),
      slotAvailabilityOptions.availabilityWindows
    );
  }, [allSessions, date, startTime, endTime, blockedForDate, slotAvailabilityOptions]);

  const canSave = useMemo(() => {
    if (sessionType === "program") {
      if (!nextSessionNumber || !primaryStudent) return false;
      if (isFirstProgramSession && !date) return false;
      if (date && hasConflict) return false;
      return true;
    }
    return Boolean(date) && !hasConflict;
  }, [sessionType, nextSessionNumber, primaryStudent, isFirstProgramSession, date, hasConflict]);

  const resetForm = () => {
    const day = initialDate ?? format(new Date(), "yyyy-MM-dd");
    const preferredStart = initialStartTime ?? "08:00";
    setSessionType("drop-in");
    setSelectedProgramId(programs[0]?.id);
    setPlayerCount(1);
    setPaymentStatus("unpaid");
    setDate(day);
    setCourtId(courts[0]?.id ?? "");
    setPrice(suggestSessionPrice({ type: "drop-in", playerCount: 1, pricing: coach?.sessionPricing }));
    if (roster[0]) {
      setParticipants([participantFromStudent(roster[0])]);
    }

    if (initialStartTime && initialEndTime) {
      setStartTime(initialStartTime);
      setEndTime(initialEndTime);
      return;
    }

    const slots = getAvailableSlots(allSessions, day, defaultDuration, {
      ...slotAvailabilityOptions,
      blockedIntervals: blockedForDate(day),
    });
    const slot = findNearestAvailableSlot(slots, preferredStart);
    if (slot) {
      setStartTime(slot.startValue);
      setEndTime(slot.endValue);
    } else {
      setStartTime(preferredStart);
      setEndTime(addMinutesToTimeValue(preferredStart, defaultDuration));
    }
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialDate, initialStartTime, initialEndTime]);

  useEffect(() => {
    if (sessionType !== "program" || !nextSessionNumber) return;
    if (isFirstProgramSession) {
      if (!date) {
        setDate(initialDate ?? format(new Date(), "yyyy-MM-dd"));
      }
    } else {
      setDate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionType, nextSessionNumber, isFirstProgramSession]);

  const handleDateChange = (nextDate: string) => {
    setDate(nextDate);
    if (!nextDate) return;
    const slots = getAvailableSlots(allSessions, nextDate, defaultDuration, {
      ...slotAvailabilityOptions,
      blockedIntervals: blockedForDate(nextDate),
    });
    const slot = findNearestAvailableSlot(slots, startTime);
    if (slot) {
      setStartTime(slot.startValue);
      setEndTime(slot.endValue);
    }
  };

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setParticipants((prev) => resizeParticipants(prev, count, prev[0]));
    if (sessionType === "drop-in") {
      setPrice(suggestSessionPrice({ type: "drop-in", playerCount: count, pricing: coach?.sessionPricing }));
    }
  };

  const handleSessionTypeChange = (t: "drop-in" | "program") => {
    setSessionType(t);
    const program = programs.find((p) => p.id === selectedProgramId) ?? programs[0];
    if (t === "program" && program) {
      setSelectedProgramId(program.id);
      const enrolled = roster.find((s) => program.enrolledStudentIds.includes(s.id));
      if (enrolled) {
        setParticipants([participantFromStudent(enrolled)]);
      } else if (roster[0]) {
        setParticipants([participantFromStudent(roster[0])]);
      }
      setPlayerCount(1);
    }
    setPrice(
      suggestSessionPrice({
        type: t,
        program: t === "program" ? program : undefined,
        playerCount: 1,
        pricing: coach?.sessionPricing,
      })
    );
  };

  const scheduleSummary =
    sessionType === "program" && nextSessionNumber
      ? date
        ? `Session ${nextSessionNumber} · ${formatDisplayDate(date)} · ${formatTimeDisplay(startTime)} – ${formatTimeDisplay(endTime)}`
        : `Session ${nextSessionNumber} · Date TBD`
      : date
        ? `${formatDisplayDate(date)} · ${formatTimeDisplay(startTime)} – ${formatTimeDisplay(endTime)} · 1 hr`
        : null;

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Add Session"
      subtitle="Choose type first, then set details"
      footer={
        <CoachSheetFooter>
          <button
            type="submit"
            form={ADD_SESSION_FORM_ID}
            className="coach-btn-primary"
            disabled={!canSave}
          >
            Save Session
          </button>
        </CoachSheetFooter>
      }
    >
      <form
        id={ADD_SESSION_FORM_ID}
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSave) return;

          const program = selectedProgram;
          const sessionNumber = nextSessionNumber;
          const scheduled = Boolean(date);

          const session: Session = {
            id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            coachId: coachId,
            studentId: primaryStudentId,
            type: sessionType,
            programId: program?.id,
            sessionNumber,
            date: scheduled ? date : undefined,
            time: scheduled ? formatTimeDisplay(startTime) : "TBD",
            endTime: scheduled ? formatTimeDisplay(endTime) : "TBD",
            courtId,
            status: "upcoming",
            paymentStatus,
            price,
            playerCount,
            participants,
          };

          await createSessionsAction([session]);
          notifySessionsUpdated(coachId);
          showToast(
            scheduled
              ? "Session scheduled!"
              : `Session ${sessionNumber} saved — add a date when ready`
          );
          onClose();
        }}
      >
        <CoachSheetField label="Session type">
          <div className="flex gap-1 rounded-xl bg-[#F3F4F6] p-1">
            {(["drop-in", "program"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleSessionTypeChange(t)}
                className={cn(
                  "font-heading flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition-all min-h-[44px]",
                  sessionType === t
                    ? "bg-[#16A34A] text-white shadow-sm"
                    : "text-[#6B7280] hover:bg-white/70"
                )}
              >
                {t === "drop-in" ? "Drop-in" : "Program"}
              </button>
            ))}
          </div>
        </CoachSheetField>

        {sessionType === "program" && (
          <>
            <CoachSheetField label="Program">
              <CoachSelect
                value={selectedProgramId ?? programs[0]?.id ?? ""}
                onChange={(id) => {
                  setSelectedProgramId(id);
                  const program = programs.find((p) => p.id === id);
                  if (program) {
                    setPrice(suggestSessionPrice({ type: "program", program }));
                    const enrolled = roster.find((s) => program.enrolledStudentIds.includes(s.id));
                    if (enrolled) {
                      setParticipants([participantFromStudent(enrolled)]);
                    }
                  }
                }}
                options={programs.map((p) => ({ value: p.id, label: p.name }))}
              />
            </CoachSheetField>

            {nextSessionNumber ? (
              <div className="rounded-xl bg-[#F0FDF4] px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#166534]">
                  {isFirstProgramSession ? "First program session" : "Next session"}
                </p>
                <p className="font-heading mt-0.5 text-sm font-semibold text-[#111827]">
                  Session {nextSessionNumber}
                  {selectedProgram ? ` of ${selectedProgram.sessionCount}` : ""}
                  {isFirstProgramSession
                    ? " · first session date is required"
                    : " · date is optional"}
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                This student already has every program session booked or completed.
              </p>
            )}
          </>
        )}

        <SessionParticipantsFields
          playerCount={playerCount}
          participants={participants}
          roster={roster}
          onChange={setParticipants}
        />

        <SessionPriceFields
          sessionType={sessionType}
          program={selectedProgram}
          pricing={coach?.sessionPricing ?? DEFAULT_SESSION_PRICING}
          playerCount={playerCount}
          price={price}
          onPlayerCountChange={handlePlayerCountChange}
          onPriceChange={setPrice}
        />

        <SessionPaymentFields value={paymentStatus} onChange={setPaymentStatus} />

        {showScheduleFields && (
          <>
            {scheduleSummary && (
              <div className="rounded-xl bg-[#F9FAFB] px-3 py-2.5 ring-1 ring-[#E5E7EB]">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                  Schedule
                </p>
                <p className="font-heading mt-0.5 text-sm font-semibold text-[#111827]">
                  {scheduleSummary}
                </p>
              </div>
            )}

            {hasConflict && (
              <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                That hour is already booked. Pick an open slot on the schedule.
              </p>
            )}

            <CoachSheetField
              label={
                sessionType === "program" && isFirstProgramSession
                  ? "First session date"
                  : sessionType === "program"
                    ? "Date (optional)"
                    : "Date"
              }
              hint={
                sessionType === "program" && !isFirstProgramSession
                  ? "Leave empty to save this session without a date"
                  : undefined
              }
            >
              <div className="space-y-2">
                <CoachDatePicker
                  value={date}
                  onChange={handleDateChange}
                  required={dateRequired}
                  placeholder={
                    sessionType === "program" && !isFirstProgramSession
                      ? "Schedule later"
                      : "Pick a date"
                  }
                />
                {sessionType === "program" && !isFirstProgramSession && date && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#4F8FF7]"
                    onClick={() => setDate("")}
                  >
                    Clear date — schedule later
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
          </>
        )}

        <CoachSheetField label="Court">
          <CoachSelect
            value={courtId}
            onChange={setCourtId}
            options={courts.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
        </CoachSheetField>

        <CoachSheetField label="Notes (optional)" htmlFor="session-notes">
          <textarea
            id="session-notes"
            className="coach-input min-h-[80px] resize-none"
            placeholder="Focus areas, equipment, or reminders for this session"
          />
        </CoachSheetField>
      </form>
    </CoachBottomSheet>
  );
}
