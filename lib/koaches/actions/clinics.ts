"use server";

import { revalidatePath } from "next/cache";
import {
  assertCoachAccess,
  assertCoachOwnsClinic,
  assertCoachOwnsSession,
  assertCoachOwnsStudent,
} from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type {
  Clinic,
  ClinicSessionDraft,
  Session,
  SessionAttendanceEntry,
  SessionPaymentStatus,
  Student,
} from "@/lib/koaches/types";
import {
  clinicToDb,
  mapClinic,
  mapSession,
  mapStudent,
  sessionToDb,
  type DbClinic,
  type DbSession,
  type DbStudent,
} from "@/lib/koaches/db/mappers";
import {
  defaultAttendanceForStudents,
  participantsFromStudents,
  syncClinicSessionFields,
} from "@/lib/koaches/clinic-pricing";

async function loadClinicEnrollments(clinicIds: string[]) {
  if (clinicIds.length === 0) return new Map<string, string[]>();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("clinic_enrollments")
    .select("clinic_id, student_id")
    .in("clinic_id", clinicIds)
    .eq("status", "enrolled");
  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const list = map.get(row.clinic_id) ?? [];
    list.push(row.student_id);
    map.set(row.clinic_id, list);
  }
  return map;
}

async function loadStudentsByIds(studentIds: string[]): Promise<Student[]> {
  if (studentIds.length === 0) return [];
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("students").select("*").in("id", studentIds);
  if (error) throw error;
  return ((data ?? []) as DbStudent[]).map(mapStudent);
}

async function syncClinicSessionsRoster(clinic: Clinic) {
  const supabase = createServiceClient();
  const students = await loadStudentsByIds(clinic.enrolledStudentIds);
  const { data: sessionRows, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("clinic_id", clinic.id)
    .eq("type", "clinic");
  if (error) throw error;

  for (const row of (sessionRows ?? []) as DbSession[]) {
    const existing = mapSession(row);
    const next = syncClinicSessionFields({
      clinic,
      students,
      session: existing,
    });
    // Preserve attendance where possible
    const prevAttendance = existing.attendance ?? [];
    const attendance = defaultAttendanceForStudents(clinic.enrolledStudentIds).map((entry) => {
      const prior = prevAttendance.find((a) => a.studentId === entry.studentId);
      return prior ?? entry;
    });
    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        student_id: next.studentId || null,
        player_count: next.playerCount,
        participants: next.participants,
        attendance,
        payment_status: clinic.paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (updateError) throw updateError;
  }
}

function revalidateClinicPaths(clinicId: string) {
  revalidatePath("/coach/clinics");
  revalidatePath(`/coach/clinics/${clinicId}`);
  revalidatePath("/coach/sessions");
  revalidatePath("/coach/dashboard");
  revalidatePath("/coaches");
}

export async function fetchClinicsAction(coachId: string): Promise<Clinic[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as DbClinic[];
  const enrollments = await loadClinicEnrollments(rows.map((r) => r.id));
  return rows.map((r) => mapClinic(r, enrollments.get(r.id) ?? []));
}

export async function fetchPublicUpcomingClinicsAction(coachId: string): Promise<
  Array<Clinic & { sessions: Session[] }>
> {
  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("clinics")
    .select("*")
    .eq("coach_id", coachId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as DbClinic[];
  if (rows.length === 0) return [];

  const enrollments = await loadClinicEnrollments(rows.map((r) => r.id));
  const clinicIds = rows.map((r) => r.id);
  const { data: sessionRows, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .in("clinic_id", clinicIds)
    .eq("type", "clinic")
    .gte("date", today)
    .order("date", { ascending: true });
  if (sessionError) throw sessionError;

  const sessionsByClinic = new Map<string, Session[]>();
  for (const row of (sessionRows ?? []) as DbSession[]) {
    const session = mapSession(row);
    if (!session.clinicId) continue;
    const list = sessionsByClinic.get(session.clinicId) ?? [];
    list.push(session);
    sessionsByClinic.set(session.clinicId, list);
  }

  return rows
    .map((r) => {
      const clinic = mapClinic(r, enrollments.get(r.id) ?? []);
      return { ...clinic, sessions: sessionsByClinic.get(r.id) ?? [] };
    })
    .filter((c) => c.sessions.length > 0);
}

export async function fetchClinicByIdAction(id: string): Promise<Clinic | null> {
  try {
    await assertCoachOwnsClinic(id);
  } catch {
    return null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("clinics").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const enrollments = await loadClinicEnrollments([id]);
  return mapClinic(data as DbClinic, enrollments.get(id) ?? []);
}

export async function fetchClinicSessionsAction(clinicId: string): Promise<Session[]> {
  await assertCoachOwnsClinic(clinicId);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("clinic_id", clinicId)
    .eq("type", "clinic")
    .order("date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as DbSession[]).map(mapSession);
}

export type CreateClinicInput = {
  name: string;
  description?: string;
  focus?: string;
  courtId: string;
  capacity: number;
  pricePerPlayer?: number;
  flatPrice?: number;
  notes?: string;
  dates: ClinicSessionDraft[];
  studentIds?: string[];
};

export async function createClinicAction(
  coachId: string,
  input: CreateClinicInput
): Promise<Clinic> {
  await assertCoachAccess(coachId);
  if (!input.name.trim()) throw new Error("Clinic name is required.");
  if (!input.courtId) throw new Error("Pick a court.");
  if (input.capacity < 1) throw new Error("Capacity must be at least 1.");
  if (input.dates.length === 0) throw new Error("Add at least one date.");
  if (input.pricePerPlayer == null && input.flatPrice == null) {
    throw new Error("Set a per-player price or a flat clinic fee.");
  }

  const clinicId = `clinic-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const studentIds = input.studentIds ?? [];
  if (studentIds.length > input.capacity) {
    throw new Error("Enrollment exceeds capacity.");
  }

  const clinic: Clinic = {
    id: clinicId,
    coachId,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    focus: input.focus?.trim() ?? "",
    courtId: input.courtId,
    capacity: input.capacity,
    pricePerPlayer: input.pricePerPlayer,
    flatPrice: input.flatPrice,
    paymentStatus: "unpaid",
    status: "active",
    notes: input.notes?.trim() || undefined,
    enrolledStudentIds: studentIds,
    createdAt: now,
    updatedAt: now,
  };

  const supabase = createServiceClient();
  const { error: clinicError } = await supabase.from("clinics").insert({
    ...clinicToDb(clinic),
    created_at: now,
  });
  if (clinicError) throw clinicError;

  if (studentIds.length > 0) {
    const { error: enrollError } = await supabase.from("clinic_enrollments").insert(
      studentIds.map((studentId) => ({
        clinic_id: clinicId,
        student_id: studentId,
        status: "enrolled",
      }))
    );
    if (enrollError) throw enrollError;
  }

  const students = await loadStudentsByIds(studentIds);
  const sessions: Session[] = input.dates.map((draft, index) =>
    syncClinicSessionFields({
      clinic,
      students,
      session: {
        id: `cs-${crypto.randomUUID().slice(0, 8)}`,
        coachId,
        date: draft.date,
        time: draft.time,
        endTime: draft.endTime,
        courtId: draft.courtId || input.courtId,
        status: "upcoming",
        notes: index === 0 ? clinic.notes : undefined,
      },
    })
  );

  if (sessions.length > 0) {
    const { error: sessionError } = await supabase.from("sessions").insert(sessions.map(sessionToDb));
    if (sessionError) throw sessionError;
  }

  revalidateClinicPaths(clinicId);
  return clinic;
}

export async function updateClinicAction(
  clinicId: string,
  patch: Partial<
    Pick<
      Clinic,
      | "name"
      | "description"
      | "focus"
      | "courtId"
      | "capacity"
      | "pricePerPlayer"
      | "flatPrice"
      | "notes"
      | "status"
      | "paymentStatus"
    >
  >
): Promise<Clinic> {
  const coachId = await assertCoachOwnsClinic(clinicId);
  const existing = await fetchClinicByIdAction(clinicId);
  if (!existing) throw new Error("Clinic not found.");

  const next: Clinic = {
    ...existing,
    ...patch,
    name: patch.name?.trim() ?? existing.name,
    description: patch.description?.trim() ?? existing.description,
    focus: patch.focus?.trim() ?? existing.focus,
    notes: patch.notes === undefined ? existing.notes : patch.notes.trim() || undefined,
    coachId,
    updatedAt: new Date().toISOString(),
  };

  if (next.enrolledStudentIds.length > next.capacity) {
    throw new Error("Capacity is below current enrollment.");
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("clinics")
    .update(clinicToDb(next))
    .eq("id", clinicId);
  if (error) throw error;

  await syncClinicSessionsRoster(next);
  revalidateClinicPaths(clinicId);
  return next;
}

export async function enrollStudentInClinicAction(clinicId: string, studentId: string) {
  await assertCoachOwnsClinic(clinicId);
  await assertCoachOwnsStudent(studentId);
  const clinic = await fetchClinicByIdAction(clinicId);
  if (!clinic) throw new Error("Clinic not found.");
  if (clinic.enrolledStudentIds.includes(studentId)) return clinic;
  if (clinic.enrolledStudentIds.length >= clinic.capacity) {
    throw new Error("Clinic is full.");
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("clinic_enrollments").upsert({
    clinic_id: clinicId,
    student_id: studentId,
    status: "enrolled",
  });
  if (error) throw error;

  const next = {
    ...clinic,
    enrolledStudentIds: [...clinic.enrolledStudentIds, studentId],
  };
  await syncClinicSessionsRoster(next);
  revalidateClinicPaths(clinicId);
  return next;
}

export async function removeStudentFromClinicAction(clinicId: string, studentId: string) {
  await assertCoachOwnsClinic(clinicId);
  const clinic = await fetchClinicByIdAction(clinicId);
  if (!clinic) throw new Error("Clinic not found.");

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("clinic_enrollments")
    .delete()
    .eq("clinic_id", clinicId)
    .eq("student_id", studentId);
  if (error) throw error;

  const next = {
    ...clinic,
    enrolledStudentIds: clinic.enrolledStudentIds.filter((id) => id !== studentId),
  };
  await syncClinicSessionsRoster(next);
  revalidateClinicPaths(clinicId);
  return next;
}

export async function addClinicSessionAction(clinicId: string, draft: ClinicSessionDraft) {
  const coachId = await assertCoachOwnsClinic(clinicId);
  const clinic = await fetchClinicByIdAction(clinicId);
  if (!clinic) throw new Error("Clinic not found.");

  const students = await loadStudentsByIds(clinic.enrolledStudentIds);
  const session = syncClinicSessionFields({
    clinic,
    students,
    session: {
      id: `cs-${crypto.randomUUID().slice(0, 8)}`,
      coachId,
      date: draft.date,
      time: draft.time,
      endTime: draft.endTime,
      courtId: draft.courtId || clinic.courtId,
      status: "upcoming",
    },
  });

  const supabase = createServiceClient();
  const { error } = await supabase.from("sessions").insert(sessionToDb(session));
  if (error) throw error;

  revalidateClinicPaths(clinicId);
  revalidatePath(`/coach/sessions/${session.id}`);
  return session;
}

export async function updateClinicSessionAttendanceAction(
  sessionId: string,
  attendance: SessionAttendanceEntry[]
) {
  await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { data, error: fetchError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!data || data.type !== "clinic") {
    throw new Error("Clinic session not found.");
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      attendance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (error) throw error;

  if (data.clinic_id) revalidateClinicPaths(data.clinic_id);
  revalidatePath(`/coach/sessions/${sessionId}`);
}

export async function updateClinicPaymentAction(
  clinicId: string,
  paymentStatus: SessionPaymentStatus
) {
  return updateClinicAction(clinicId, { paymentStatus });
}

export async function cancelClinicAction(clinicId: string) {
  const clinic = await updateClinicAction(clinicId, { status: "canceled" });
  const supabase = createServiceClient();
  await supabase
    .from("sessions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("clinic_id", clinicId)
    .eq("type", "clinic")
    .eq("status", "upcoming");
  revalidateClinicPaths(clinicId);
  return clinic;
}
