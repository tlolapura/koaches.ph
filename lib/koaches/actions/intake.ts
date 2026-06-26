"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { DuprLevel, StudentIntakeSubmission } from "@/lib/koaches/types";
import type { IntakeFormPayload } from "@/lib/koaches/intake";
import { mapIntake, type DbIntake } from "@/lib/koaches/db/mappers";
import { createStudentAction } from "@/lib/koaches/actions/students";

export async function fetchIntakeSubmissionsAction(coachId: string): Promise<StudentIntakeSubmission[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("student_intake_submissions")
    .select("*")
    .eq("coach_id", coachId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbIntake[]).map(mapIntake);
}

export async function submitIntakeAction(
  coachId: string,
  payload: IntakeFormPayload & { waiverAccepted: true }
) {
  const supabase = createServiceClient();

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id, is_active")
    .eq("id", coachId)
    .maybeSingle();
  if (coachError) throw coachError;
  if (!coach?.is_active) throw new Error("This coach is not accepting sign-ups right now.");

  const id = `intake-${crypto.randomUUID().slice(0, 8)}`;
  const { error } = await supabase.from("student_intake_submissions").insert({
    id,
    coach_id: coachId,
    name: payload.name.trim(),
    mobile: payload.mobile.trim(),
    email: payload.email.trim(),
    emergency_contact: payload.emergencyContact ?? null,
    skill_level: payload.skillLevel,
    notes: payload.notes ?? null,
    waiver_accepted: true,
    signed_name: payload.signedName.trim(),
    status: "pending",
  });
  if (error) throw error;

  revalidatePath("/coach/profile");
  revalidatePath("/coach/students");
  revalidatePath("/coach/dashboard");
  return id;
}

export async function approveIntakeAction(coachId: string, intakeId: string) {
  const supabase = createServiceClient();
  const { data: intake, error } = await supabase
    .from("student_intake_submissions")
    .select("*")
    .eq("id", intakeId)
    .eq("coach_id", coachId)
    .single();
  if (error || !intake) throw new Error("Intake not found");

  await createStudentAction(coachId, {
    name: intake.name,
    mobile: intake.mobile,
    email: intake.email,
    skillLevel: intake.skill_level as DuprLevel,
  });

  const { error: updateError } = await supabase
    .from("student_intake_submissions")
    .update({ status: "approved" })
    .eq("id", intakeId);
  if (updateError) throw updateError;

  revalidatePath("/coach/students");
  revalidatePath("/coach/dashboard");
  revalidatePath("/coach/profile");
}

export async function rejectIntakeAction(coachId: string, intakeId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("student_intake_submissions")
    .delete()
    .eq("id", intakeId)
    .eq("coach_id", coachId);
  if (error) throw error;
  revalidatePath("/coach/students");
  revalidatePath("/coach/profile");
}

export async function pendingIntakeCountAction(coachId: string): Promise<number> {
  const list = await fetchIntakeSubmissionsAction(coachId);
  return list.filter((s) => s.status === "pending").length;
}
