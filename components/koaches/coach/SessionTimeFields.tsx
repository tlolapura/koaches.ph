"use client";

import { useId, useState } from "react";
import { HOURLY_SESSION_MINUTES } from "@/lib/koaches/session-slots";
import {
  addMinutesToTimeValue,
  formatDurationMinutes,
  formatTimeDisplay,
} from "@/lib/koaches/session-time";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";
import type { CoachSelectOption } from "@/components/koaches/coach/CoachSelect";

type SessionTimeFieldsProps = {
  startTime?: string;
  endTime?: string;
  defaultStart?: string;
  defaultEnd?: string;
  defaultDurationMinutes?: number;
  /** When set, end time is start + this many minutes (read-only). Used for hourly court slots. */
  fixedDurationMinutes?: number;
  /** Hide end time picker (e.g. when duration is chosen separately). Default: true */
  showEndTime?: boolean;
  startTimeOptions?: CoachSelectOption[];
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
  showEndTime = true,
  startTimeOptions,
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
    <div className={fixedDurationMinutes || !showEndTime ? "space-y-3" : "grid grid-cols-2 gap-3"}>
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
          options={startTimeOptions}
          onChange={setStart}
          placeholder="8:00 AM"
        />
      </div>
      {fixedDurationMinutes ? (
        <p className="text-sm text-[#374151]">
          <span className="coach-label">Duration · </span>
          {formatDurationMinutes(fixedDurationMinutes)} · ends {formatTimeDisplay(endTime)}
        </p>
      ) : showEndTime ? (
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
      ) : null}
    </div>
  );
}
