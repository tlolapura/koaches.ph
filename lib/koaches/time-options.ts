import { formatTimeDisplay } from "./session-time";

export type TimeOption = { value: string; label: string };

export function buildTimeOptions(
  stepMinutes = 60,
  startHour = 6,
  endHour = 21
): TimeOption[] {
  const options: TimeOption[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      if (hour === endHour && minute > 0) break;
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      options.push({ value, label: formatTimeDisplay(value) });
    }
  }

  return options;
}

export function withTimeOption(options: TimeOption[], value: string): TimeOption[] {
  if (!value || options.some((o) => o.value === value)) return options;
  return [{ value, label: formatTimeDisplay(value) }, ...options];
}
