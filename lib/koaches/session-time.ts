/** Parse display time like "8:00 AM" to minutes since midnight (for sorting). */
export function parseDisplayTime(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = Number(match[1]);
  const m = Number(match[2]);
  const pm = match[3].toUpperCase() === "PM";
  if (pm && h !== 12) h += 12;
  if (!pm && h === 12) h = 0;
  return h * 60 + m;
}

/** Combine session date (yyyy-MM-dd) and display time into a local Date. */
export function sessionStartsAt(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const totalMins = parseDisplayTime(time);
  return new Date(y, mo - 1, d, Math.floor(totalMins / 60), totalMins % 60, 0, 0);
}

/** Human-readable countdown: "In 2h", "In 45 min", "Starts now", "In progress". */
export function formatRelativeSessionStart(date: string, time: string, now = new Date()): string {
  const start = sessionStartsAt(date, time);
  const diffMins = Math.round((start.getTime() - now.getTime()) / 60_000);

  if (diffMins < -90) return "Ended";
  if (diffMins < 0) return "In progress";
  if (diffMins === 0) return "Starts now";
  if (diffMins < 60) return `In ${diffMins} min`;

  const hours = Math.floor(diffMins / 60);
  const rem = diffMins % 60;
  if (diffMins < 24 * 60) {
    if (rem === 0) return `In ${hours}h`;
    return `In ${hours}h ${rem}m`;
  }

  const days = Math.floor(diffMins / (24 * 60));
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

/** Human-readable duration from minutes (e.g. 90 -> "1 hr 30 min"). */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return hours === 1 ? "1 hr" : `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}

/** Duration label from start/end display times. */
export function formatSessionDuration(time: string, endTime?: string): string | null {
  if (!endTime) return null;
  let mins = parseDisplayTime(endTime) - parseDisplayTime(time);
  if (mins <= 0) mins += 24 * 60;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/** Split display time for agenda rail: { clock: "8:00", period: "AM" } */
export function splitDisplayTime(time: string): { clock: string; period: string } {
  const match = time.match(/(\d+:\d+)\s*(AM|PM)/i);
  if (!match) return { clock: time, period: "" };
  return { clock: match[1], period: match[2].toUpperCase() };
}

/** Compact time for agenda rails: "8:00" */
export function formatTimeShort(time: string): string {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time;
  return `${match[1]}:${match[2]}`;
}

/** Display helper: "8:00 AM – 9:30 AM" */
export function formatSessionTimeRange(time: string, endTime?: string): string {
  if (!endTime) return time;
  return `${time} – ${endTime}`;
}

/** Add minutes to an HTML time value ("08:00") and return "09:30" */
export function addMinutesToTimeValue(timeValue: string, minutes: number): string {
  const [h, m] = timeValue.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

/** Minutes between two HTML time values */
export function minutesBetweenTimeValues(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

/** Parse display ("8:00 AM") or HTML ("08:00") time to minutes since midnight */
export function parseTimeToMinutes(time: string): number {
  if (/AM|PM/i.test(time)) return parseDisplayTime(time);
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToHtmlValue(totalMinutes: number): string {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Mock/display format from HTML time input */
export function formatTimeDisplay(timeValue: string): string {
  const [h, m] = timeValue.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}
