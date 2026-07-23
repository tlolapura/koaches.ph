import { format, parseISO } from "date-fns";
import type { Clinic, Session, SessionAttendanceEntry, Student } from "@/lib/koaches/types";
import { formatCurrency } from "@/lib/utils";

export function clinicPricingMode(clinic: Pick<Clinic, "pricePerPlayer" | "flatPrice">): "per-player" | "flat" {
  if (clinic.flatPrice != null && clinic.flatPrice > 0 && clinic.pricePerPlayer == null) {
    return "flat";
  }
  return "per-player";
}

/** Expected clinic revenue given enrollments (series-level). */
export function clinicExpectedRevenue(
  clinic: Pick<Clinic, "pricePerPlayer" | "flatPrice" | "enrolledStudentIds">
): number {
  if (clinicPricingMode(clinic) === "flat") {
    return clinic.flatPrice ?? 0;
  }
  return (clinic.pricePerPlayer ?? 0) * clinic.enrolledStudentIds.length;
}

export function formatClinicPriceSummary(
  clinic: Pick<Clinic, "pricePerPlayer" | "flatPrice" | "enrolledStudentIds">
): string {
  if (clinicPricingMode(clinic) === "flat") {
    return `${formatCurrency(clinic.flatPrice ?? 0)} flat`;
  }
  return `${formatCurrency(clinic.pricePerPlayer ?? 0)} / player`;
}

export function participantsFromStudents(students: Student[]): Session["participants"] {
  return students.map((s) => ({
    id: s.id,
    name: s.name,
    studentId: s.id,
  }));
}

export function defaultAttendanceForStudents(studentIds: string[]): SessionAttendanceEntry[] {
  return studentIds.map((studentId) => ({ studentId, present: true }));
}

export function syncClinicSessionFields(options: {
  clinic: Clinic;
  students: Student[];
  session: Pick<Session, "id" | "coachId" | "date" | "time" | "endTime" | "courtId" | "status" | "notes">;
}): Session {
  const { clinic, students, session } = options;
  const enrolled = students.filter((s) => clinic.enrolledStudentIds.includes(s.id));
  const participants = participantsFromStudents(enrolled);
  const primary = enrolled[0];

  return {
    id: session.id,
    coachId: session.coachId,
    studentId: primary?.id ?? "",
    type: "clinic",
    clinicId: clinic.id,
    date: session.date,
    time: session.time,
    endTime: session.endTime,
    courtId: session.courtId || clinic.courtId,
    status: session.status,
    paymentStatus: clinic.paymentStatus,
    price: 0,
    tip: 0,
    playerCount: Math.max(participants.length, 1),
    participants,
    notes: session.notes,
    attendance: defaultAttendanceForStudents(enrolled.map((s) => s.id)),
  };
}

export function clinicBlockLabel(
  clinic: Pick<Clinic, "name" | "focus" | "capacity" | "enrolledStudentIds">
): string {
  const title = clinic.focus?.trim() || clinic.name;
  return `Clinic · ${title} · ${clinic.enrolledStudentIds.length}/${clinic.capacity}`;
}

export function clinicDateRangeLabel(sessions: Pick<Session, "date">[]): string {
  const dates = sessions
    .map((s) => s.date)
    .filter((d): d is string => Boolean(d))
    .sort();
  if (dates.length === 0) return "Dates TBD";
  if (dates.length === 1) {
    try {
      return format(parseISO(dates[0]!), "EEE, MMM d");
    } catch {
      return dates[0]!;
    }
  }
  try {
    return `${format(parseISO(dates[0]!), "MMM d")} – ${format(
      parseISO(dates[dates.length - 1]!),
      "MMM d"
    )}`;
  } catch {
    return `${dates[0]} → ${dates[dates.length - 1]}`;
  }
}
