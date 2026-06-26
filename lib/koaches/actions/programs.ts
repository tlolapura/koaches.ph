"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { Program } from "@/lib/koaches/types";
import type { ProgramDraft } from "@/lib/koaches/program-templates";
import { mapProgram, programToDb, type DbProgram } from "@/lib/koaches/db/mappers";

async function loadEnrollments(programIds: string[]) {
  if (programIds.length === 0) return new Map<string, string[]>();
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("program_enrollments")
    .select("program_id, student_id")
    .in("program_id", programIds);
  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const list = map.get(row.program_id) ?? [];
    list.push(row.student_id);
    map.set(row.program_id, list);
  }
  return map;
}

export async function fetchProgramsAction(coachId: string): Promise<Program[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const rows = (data ?? []) as DbProgram[];
  const enrollments = await loadEnrollments(rows.map((r) => r.id));
  return rows.map((r) => mapProgram(r, enrollments.get(r.id) ?? []));
}

export async function fetchProgramByIdAction(id: string): Promise<Program | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const enrollments = await loadEnrollments([id]);
  return mapProgram(data as DbProgram, enrollments.get(id) ?? []);
}

export async function createProgramAction(coachId: string, draft: ProgramDraft) {
  const program: Program = {
    id: `p-${crypto.randomUUID().slice(0, 8)}`,
    coachId,
    name: draft.name,
    description: draft.description,
    price: draft.price,
    sessionCount: draft.sessionCount,
    rubricId: draft.rubricId,
    skillTemplateId: draft.rubricId,
    presetId: draft.presetId,
    source: draft.source,
    targetLevel: draft.targetLevel,
    customSkillIds: draft.customSkillIds,
    enrolledStudentIds: [],
    isActive: true,
  };

  const supabase = createServiceClient();
  const { error } = await supabase.from("programs").insert(programToDb(program));
  if (error) throw error;

  revalidatePath("/coach/programs");
  revalidatePath(`/coach/programs/${program.id}`);
  return program;
}

export async function enrollStudentInProgramAction(programId: string, studentId: string) {
  const supabase = createServiceClient();
  const { data: program } = await supabase
    .from("programs")
    .select("coach_id")
    .eq("id", programId)
    .single();
  if (!program) throw new Error("Program not found");

  await supabase.from("program_enrollments").upsert({
    program_id: programId,
    student_id: studentId,
  });
  await supabase
    .from("students")
    .update({ program_id: programId, updated_at: new Date().toISOString() })
    .eq("id", studentId)
    .eq("coach_id", program.coach_id);

  revalidatePath(`/coach/programs/${programId}`);
  revalidatePath(`/coach/students/${studentId}`);
}
