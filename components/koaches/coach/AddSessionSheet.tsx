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
  getAllowedSessionDurations,
  getAvailableSlots,
  getHourlySlotRows,
  getMaxDurationMinutesForStart,
  hasScheduleConflict,
  HOURLY_SESSION_MINUTES,
} from "@/lib/koaches/session-slots";
import {
  addMinutesToTimeValue,
  formatDurationMinutes,
  formatSessionDuration,
  formatTimeDisplay,
  minutesBetweenTimeValues,
} from "@/lib/koaches/session-time";
import { blockedSlotsToBusyIntervals, workingHoursToIntervals } from "@/lib/koaches/coach-availability";
import { participantFromStudent, resizeParticipants } from "@/lib/koaches/session-participants";
import { getNextProgramSessionNumber } from "@/lib/koaches/schedule-program-sessions";
import { isFirstProgramSessionNumber } from "@/lib/koaches/session-schedule";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachSelect, type CoachSelectOption } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { SessionParticipantsFields } from "@/components/koaches/coach/SessionParticipantsFields";
import { SessionPaymentFields } from "@/components/koaches/coach/SessionPaymentFields";
import { SessionPriceFields } from "@/components/koaches/coach/SessionPriceFields";
import { SessionTimeFields } from "@/components/koaches/coach/SessionTimeFields";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachStepper } from "@/components/koaches/coach/CoachStepper";
import { formatDisplayDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const ADD_SESSION_FORM_ID = "add-session-form";

type AddSessionStep = "form" | "confirm";

const ADD_SESSION_STEPS = [
  { id: "form", label: "Details" },
  { id: "confirm", label: "Review" },
];

function paymentStatusLabel(status: SessionPaymentStatus) {
  return status === "paid" ? "Paid" : "Unpaid";
}

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

  const defaultDuration = coach?.sessionPricing?.defaultDurationMinutes ?? HOURLY_SESSION_MINUTES;

  const [step, setStep] = useState<AddSessionStep>("form");
  const [sessionType, setSessionType] = useState<"drop-in" | "program">("drop-in");
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(
    () => programs[0]?.id
  );
  const [playerCount, setPlayerCount] = useState(1);
  const [price, setPrice] = useState(800);
  const [tip, setTip] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<SessionPaymentStatus>("unpaid");
  const [date, setDate] = useState(initialDate ?? format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("08:00");
  const [durationMinutes, setDurationMinutes] = useState(defaultDuration);
  const [endTime, setEndTime] = useState(() => addMinutesToTimeValue("08:00", defaultDuration));
  const [courtId, setCourtId] = useState("");
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [saving, setSaving] = useState(false);

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

  const slotOptionsForDate = useMemo(
    () => ({
      ...slotAvailabilityOptions,
      blockedIntervals: date ? blockedForDate(date) : [],
    }),
    [slotAvailabilityOptions, blockedForDate, date]
  );

  const maxDurationMinutes = useMemo(() => {
    if (!date) return 0;
    return getMaxDurationMinutesForStart(allSessions, date, startTime, slotOptionsForDate);
  }, [allSessions, date, startTime, slotOptionsForDate]);

  const allowedDurations = useMemo(
    () => getAllowedSessionDurations(maxDurationMinutes, defaultDuration),
    [maxDurationMinutes, defaultDuration]
  );
  const startTimeOptions = useMemo<CoachSelectOption[]>(() => {
    if (!date) return [];
    return getHourlySlotRows(allSessions, date, durationMinutes, slotOptionsForDate).map((row) => ({
      value: row.startValue,
      label:
        row.status === "booked"
          ? `${row.timeLabel} (Booked)`
          : row.status === "blocked"
            ? `${row.timeLabel} (Blocked)`
            : row.timeLabel,
      disabled: row.status !== "open",
    }));
  }, [allSessions, date, durationMinutes, slotOptionsForDate]);

  const canAdjustDuration = allowedDurations.length > 1;
  const selectedCourt = courts.find((court) => court.id === courtId);

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

  const scheduleTimeLabel =
    date && startTime && endTime
      ? `${formatTimeDisplay(startTime)} – ${formatTimeDisplay(endTime)}`
      : null;
  const scheduleDurationLabel =
    scheduleTimeLabel != null
      ? formatSessionDuration(formatTimeDisplay(startTime), formatTimeDisplay(endTime)) ??
        formatDurationMinutes(durationMinutes)
      : null;

  const canSave = useMemo(() => {
    if (sessionType === "program") {
      if (!nextSessionNumber || !primaryStudent) return false;
      if (isFirstProgramSession && !date) return false;
      if (date && (hasConflict || allowedDurations.length === 0)) return false;
      return true;
    }
    return Boolean(date) && !hasConflict && allowedDurations.length > 0;
  }, [
    sessionType,
    nextSessionNumber,
    primaryStudent,
    isFirstProgramSession,
    date,
    hasConflict,
    allowedDurations.length,
  ]);

  const resetForm = () => {
    const day = initialDate ?? format(new Date(), "yyyy-MM-dd");
    const preferredStart = initialStartTime ?? "08:00";
    setStep("form");
    setSessionType("drop-in");
    setSelectedProgramId(programs[0]?.id);
    setPlayerCount(1);
    setTip(0);
    setPaymentStatus("unpaid");
    setDate(day);
    setCourtId(courts[0]?.id ?? "");
    setPrice(suggestSessionPrice({ type: "drop-in", playerCount: 1, pricing: coach?.sessionPricing }));
    if (roster[0]) {
      setParticipants([participantFromStudent(roster[0])]);
    }

    if (initialStartTime && initialEndTime) {
      const initialDuration = minutesBetweenTimeValues(initialStartTime, initialEndTime);
      setStartTime(initialStartTime);
      setDurationMinutes(initialDuration);
      setEndTime(initialEndTime);
      return;
    }

    const slots = getAvailableSlots(allSessions, day, defaultDuration, {
      ...slotAvailabilityOptions,
      blockedIntervals: blockedForDate(day),
    });
    const slot = findNearestAvailableSlot(slots, preferredStart);
    if (slot) {
      const slotDuration = minutesBetweenTimeValues(slot.startValue, slot.endValue);
      setStartTime(slot.startValue);
      setDurationMinutes(slotDuration);
      setEndTime(slot.endValue);
    } else {
      setStartTime(preferredStart);
      setDurationMinutes(defaultDuration);
      setEndTime(addMinutesToTimeValue(preferredStart, defaultDuration));
    }
  };

  useEffect(() => {
    if (!date || step !== "form") return;
    if (allowedDurations.length === 0) return;

    setDurationMinutes((current) => {
      const next = allowedDurations.includes(current)
        ? current
        : allowedDurations.includes(defaultDuration)
          ? defaultDuration
          : allowedDurations[allowedDurations.length - 1];
      setEndTime(addMinutesToTimeValue(startTime, next));
      return next;
    });
  }, [allowedDurations, date, defaultDuration, startTime, step]);

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
    const slots = getAvailableSlots(allSessions, nextDate, durationMinutes, {
      ...slotAvailabilityOptions,
      blockedIntervals: blockedForDate(nextDate),
    });
    const slot = findNearestAvailableSlot(slots, startTime);
    if (slot) {
      const slotDuration = minutesBetweenTimeValues(slot.startValue, slot.endValue);
      setStartTime(slot.startValue);
      setDurationMinutes(slotDuration);
      setEndTime(slot.endValue);
    }
  };

  const handleStartTimeChange = (nextStart: string) => {
    setStartTime(nextStart);
    setEndTime(addMinutesToTimeValue(nextStart, durationMinutes));
  };

  const handleDurationChange = (nextDuration: number) => {
    setDurationMinutes(nextDuration);
    setEndTime(addMinutesToTimeValue(startTime, nextDuration));
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

  const participantLabel =
    participants.map((participant) => participant.name).filter(Boolean).join(", ") || "No students selected";

  const handleConfirmSave = async () => {
    if (!canSave || saving) return;

    setSaving(true);
    try {
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
        tip,
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
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save session", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={step === "confirm" ? "Review session" : "Add Session"}
      subtitle={
        step === "confirm"
          ? "Confirm the details before saving"
          : "Choose type first, then set details"
      }
      footer={
        step === "confirm" ? (
          <CoachSheetFooter>
            <CoachButton type="button" variant="outline" disabled={saving} onClick={() => setStep("form")}>
              Back
            </CoachButton>
            <CoachButton
              type="button"
              loading={saving}
              loadingLabel="Saving…"
              disabled={!canSave}
              onClick={() => void handleConfirmSave()}
            >
              Save Session
            </CoachButton>
          </CoachSheetFooter>
        ) : (
          <CoachSheetFooter>
            <CoachButton type="button" disabled={!canSave} onClick={() => setStep("confirm")}>
              Review session
            </CoachButton>
          </CoachSheetFooter>
        )
      }
    >
      <CoachStepper
        card={false}
        variant="compact"
        steps={ADD_SESSION_STEPS.map((s) =>
          s.id === "confirm" ? { ...s, disabled: !canSave && step === "form" } : s
        )}
        currentStepId={step}
        onStepChange={(id) => setStep(id as AddSessionStep)}
        className="mb-4"
      />

      {step === "confirm" ? (
        <div className="coach-card space-y-4 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">Session summary</p>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Type</dt>
              <dd className="text-right font-medium text-[#111827]">
                {sessionType === "drop-in" ? "Drop-in" : "Program"}
              </dd>
            </div>
            {sessionType === "program" && selectedProgram ? (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#6B7280]">Program</dt>
                <dd className="text-right font-medium text-[#111827]">{selectedProgram.name}</dd>
              </div>
            ) : null}
            {sessionType === "program" && nextSessionNumber ? (
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[#6B7280]">Session</dt>
                <dd className="text-right font-medium text-[#111827]">
                  Session {nextSessionNumber}
                  {selectedProgram ? ` of ${selectedProgram.sessionCount}` : ""}
                </dd>
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Students</dt>
              <dd className="text-right font-medium text-[#111827]">{participantLabel}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Price</dt>
              <dd className="text-right font-medium text-[#111827]">{formatCurrency(price)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Tips given</dt>
              <dd className="text-right font-medium text-[#111827]">
                {tip > 0 ? formatCurrency(tip) : "None"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Payment</dt>
              <dd className="text-right font-medium text-[#111827]">{paymentStatusLabel(paymentStatus)}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Schedule</dt>
              <dd className="text-right font-medium text-[#111827]">
                {date ? (
                  <>
                    {formatDisplayDate(date)}
                    {scheduleTimeLabel ? (
                      <>
                        <br />
                        {scheduleTimeLabel}
                        {scheduleDurationLabel ? ` · ${scheduleDurationLabel}` : null}
                      </>
                    ) : null}
                  </>
                ) : sessionType === "program" && nextSessionNumber ? (
                  `Session ${nextSessionNumber} · Date TBD`
                ) : (
                  "Date TBD"
                )}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#6B7280]">Court</dt>
              <dd className="text-right font-medium text-[#111827]">
                {selectedCourt?.name ?? "Not selected"}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
      <form
        id={ADD_SESSION_FORM_ID}
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave) setStep("confirm");
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
        <CoachSheetField
          label="Tip (optional)"
          htmlFor="session-tip"
          hint="Extra on top of the session fee"
        >
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-[#6B7280]"
              aria-hidden
            >
              ₱
            </span>
            <input
              id="session-tip"
              type="number"
              min={0}
              step={50}
              inputMode="numeric"
              className="coach-input coach-input-icon"
              value={tip}
              onChange={(e) => setTip(Math.max(0, Math.round(Number(e.target.value) || 0)))}
              placeholder="0"
            />
          </div>
        </CoachSheetField>
        {tip > 0 && (
          <p className="text-sm text-[#374151]">
            Total received{" "}
            <span className="font-heading font-semibold text-[#14532D]">
              {formatCurrency(price + tip)}
            </span>
          </p>
        )}

        {showScheduleFields && (
          <>
            {hasConflict && (
              <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                That time conflicts with another session or blocked slot. Pick an open time.
              </p>
            )}

            {date && allowedDurations.length === 0 && (
              <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
                No open duration fits this start time. Choose another time.
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
              <>
                <SessionTimeFields
                  startTime={startTime}
                  endTime={endTime}
                  fixedDurationMinutes={canAdjustDuration ? undefined : durationMinutes}
                  showEndTime={!canAdjustDuration}
                  startTimeOptions={startTimeOptions}
                  onStartTimeChange={handleStartTimeChange}
                  onEndTimeChange={setEndTime}
                />

                {canAdjustDuration ? (
                  <CoachSheetField label="Duration">
                    <div className="flex flex-wrap gap-2">
                      {allowedDurations.map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => handleDurationChange(mins)}
                          className={cn(
                            "min-h-[40px] rounded-full px-3 py-2 text-sm font-semibold transition-colors",
                            durationMinutes === mins
                              ? "bg-[#14532D] text-white"
                              : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                          )}
                        >
                          {formatDurationMinutes(mins)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-[#6B7280]">
                      Ends {formatTimeDisplay(endTime)}
                    </p>
                  </CoachSheetField>
                ) : null}
              </>
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

      </form>
      )}
    </CoachBottomSheet>
  );
}
