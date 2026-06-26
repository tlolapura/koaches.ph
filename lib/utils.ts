import { clsx, type ClassValue } from "clsx";
import { format, isValid, parse, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

/** Parse yyyy-MM-dd or ISO timestamps without UTC day shift on calendar dates */
export function parseDateValue(dateStr: string): Date {
  const trimmed = dateStr.trim();
  if (!trimmed) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return parse(trimmed, "yyyy-MM-dd", new Date());
  }
  const iso = parseISO(trimmed);
  if (isValid(iso)) return iso;
  const fallback = new Date(trimmed);
  return isValid(fallback) ? fallback : new Date(NaN);
}

/** Display date like "June 6, 2026" */
export function formatDisplayDate(dateStr: string): string {
  const d = parseDateValue(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, "MMMM d, yyyy");
}

export function formatDate(dateStr: string): string {
  return formatDisplayDate(dateStr);
}

export function formatShortDate(dateStr: string): string {
  return formatDisplayDate(dateStr);
}
