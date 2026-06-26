"use client";

import { useId, useState } from "react";
import {
  addMinutesToTimeValue,
  formatTimeDisplay,
} from "@/lib/koaches/session-time";
import { HOURLY_SESSION_MINUTES } from "@/lib/koaches/session-slots";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";

type SessionTimeFieldsProps = {
  startTime?: string;
  endTime?: string;
  defaultStart?: string;
  defaultEnd?: string;
  defaultDurationMinutes?: number;
  /** When set, end time is start + this many minutes (read-only). Used for hourly court slots. */
  fixedDurationMinutes?: number;
  onStartTimeChange?: (value: string) => void;
  onEndTimeChange?: (value: string) => void;
};

export function SessionTimeFields({
  startTime: startProp,
  endTime: endProp,
  defaultStart = "08:00",
  defaultEnd,
  defaultDurationMinutes = HOURLY_SESSION_MINUTES,
  fixedDurationMinutes,
  onStartTimeChange,
  onEndTimeChange,
}: SessionTimeFieldsProps) {
  const startId = useId();
  const endId = useId();
  const isControlled = startProp !== undefined && endProp !== undefined;
  const [internalStart, setInternalStart] = useState(defaultStart);
  const duration = fixedDurationMinutes ?? defaultDurationMinutes;
  const [internalEnd, setInternalEnd] = useState(
    defaultEnd ?? addMinutesToTimeValue(defaultStart, duration)
  );

  const startTime = isControlled ? startProp! : internalStart;
  const endTime = isControlled
    ? endProp!
    : fixedDurationMinutes
      ? addMinutesToTimeValue(internalStart, fixedDurationMinutes)
      : internalEnd;

  const setStart = (value: string) => {
    const nextEnd = addMinutesToTimeValue(value, duration);
    if (!isControlled) {
      setInternalStart(value);
      if (!fixedDurationMinutes) setInternalEnd(nextEnd);
    }
    onStartTimeChange?.(value);
    onEndTimeChange?.(nextEnd);
  };

  const setEnd = (value: string) => {
    if (fixedDurationMinutes) return;
    if (!isControlled) setInternalEnd(value);
    onEndTimeChange?.(value);
  };

  return (
    <div className={fixedDurationMinutes ? "space-y-3" : "grid grid-cols-2 gap-3"}>
      <div>
        <label className="coach-label" htmlFor={startId}>
          Start time
        </label>
        <CoachTimePicker
          id={startId}
          className="mt-1"
          name="startTime"
          required
          value={startTime}
          onChange={setStart}
          placeholder="8:00 AM"
        />
      </div>
      {fixedDurationMinutes ? (
        <p className="text-sm text-[#374151]">
          <span className="coach-label">Duration · </span>
          1 hr · ends {formatTimeDisplay(endTime)}
        </p>
      ) : (
        <div>
          <label className="coach-label" htmlFor={endId}>
            End time
          </label>
          <CoachTimePicker
            id={endId}
            className="mt-1"
            name="endTime"
            required
            value={endTime}
            onChange={setEnd}
            placeholder="9:00 AM"
          />
        </div>
      )}
    </div>
  );
}
