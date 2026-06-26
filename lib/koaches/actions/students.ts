"use server";

import { revalidatePath } from "next/cache";
import {
  assertCoachAccess,
  assertCoachOwnsStudent,
} from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { DuprLevel, Student } from "@/lib/koaches/types";
import { mapStudent, studentToDb, type DbStudent } from "@/lib/koaches/db/mappers";

export async function fetchStudentsAction(
  coachId: string,
  includeArchived = false
): Promise<Student[]> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  let query = supabase.from("students").select("*").eq("coach_id", coachId).order("name");
  if (!includeArchived) query = query.eq("is_archived", false);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as DbStudent[]).map(mapStudent);
}

export async function fetchStudentByIdAction(studentId: string): Promise<Student | null> {
  try {
    await assertCoachOwnsStudent(studentId);
  } catch {
    return null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("students").select("*").eq("id", studentId).maybeSingle();
  if (error) throw error;
  return data ? mapStudent(data as DbStudent) : null;
}

export type CreateStudentInput = {
  name: string;
  mobile: string;
  email: string;
  skillLevel: DuprLevel;
  programId?: string;
};

export async function createStudentAction(coachId: string, input: CreateStudentInput) {
  await assertCoachAccess(coachId);
  const student: Student = {
    id: `s-${crypto.randomUUID().slice(0, 8)}`,
    coachId,
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    email: input.email.trim(),
    status: "active",
    programId: input.programId || undefined,
    sessionsCompleted: 0,
    enrolledDate: new Date().toISOString().slice(0, 10),
    skillLevel: input.skillLevel,
    isArchived: false,
  };

  const supabase = createServiceClient();
  const { error } = await supabase.from("students").insert(studentToDb(student));
  if (error) throw error;

  if (input.programId) {
    const { enrollStudentInProgramAction } = await import("@/lib/koaches/actions/programs");
    await enrollStudentInProgramAction(input.programId, student.id);
  }

  revalidatePath("/coach/students");
  return student;
}

export async function updateStudentNotesAction(studentId: string, notes: string) {
  await assertCoachOwnsStudent(studentId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("students")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", studentId);
  if (error) throw error;
  revalidatePath(`/coach/students/${studentId}`);
}

export async function archiveStudentAction(studentId: string) {
  await assertCoachOwnsStudent(studentId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("students")
    .update({ is_archived: true, status: "archived", updated_at: new Date().toISOString() })
    .eq("id", studentId);
  if (error) throw error;
  revalidatePath("/coach/students");
  revalidatePath(`/coach/students/${studentId}`);
}
