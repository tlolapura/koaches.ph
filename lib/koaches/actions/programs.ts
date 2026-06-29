"use server";

import { revalidatePath } from "next/cache";
import {
  assertCoachAccess,
  assertCoachOwnsProgram,
  assertCoachOwnsStudent,
} from "@/lib/koaches/actions/guards";
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
  try {
    await assertCoachOwnsProgram(id);
  } catch {
    return null;
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const enrollments = await loadEnrollments([id]);
  return mapProgram(data as DbProgram, enrollments.get(id) ?? []);
}

export async function createProgramAction(coachId: string, draft: ProgramDraft) {
  await assertCoachAccess(coachId);
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
    customSkills: draft.customSkills,
    skillLabelOverrides: draft.skillLabelOverrides,
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
  const coachId = await assertCoachOwnsProgram(programId);
  await assertCoachOwnsStudent(studentId);

  const supabase = createServiceClient();
  await supabase.from("program_enrollments").upsert({
    program_id: programId,
    student_id: studentId,
  });

  const { count } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("program_id", programId)
    .eq("type", "program")
    .eq("status", "done");

  await supabase
    .from("students")
    .update({
      program_id: programId,
      sessions_completed: count ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId)
    .eq("coach_id", coachId);

  revalidatePath(`/coach/programs/${programId}`);
  revalidatePath(`/coach/students/${studentId}`);
  revalidatePath("/coach/students");
}

export async function updateProgramSkillsAction(
  programId: string,
  config: {
    rubricId: Program["rubricId"];
    customSkillIds?: string[];
    customSkills?: Program["customSkills"];
    skillLabelOverrides?: Record<string, string>;
  }
) {
  await assertCoachOwnsProgram(programId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("programs")
    .update({
      rubric_id: config.rubricId,
      skill_template_id: config.rubricId,
      custom_skill_ids: config.customSkillIds ?? null,
      custom_skills: config.customSkills ?? [],
      skill_label_overrides: config.skillLabelOverrides ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", programId);
  if (error) throw error;
  revalidatePath("/coach/programs");
  revalidatePath(`/coach/programs/${programId}`);
}
