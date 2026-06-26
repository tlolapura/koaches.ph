"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess, requireAuthenticatedCoachId } from "@/lib/koaches/actions/guards";
import { createStudentAction } from "@/lib/koaches/actions/students";
import { createServiceClient } from "@/lib/supabase/server";
import type { DuprLevel, StudentIntakeSubmission } from "@/lib/koaches/types";
import type { IntakeFormPayload } from "@/lib/koaches/intake";
import { mapIntake, type DbIntake } from "@/lib/koaches/db/mappers";

export async function fetchIntakeSubmissionsAction(coachId: string): Promise<StudentIntakeSubmission[]> {
  await assertCoachAccess(coachId);
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

  const email = payload.email.trim().toLowerCase();
  const mobile = payload.mobile.trim();

  const [{ data: pendingIntake }, { data: existingStudent }] = await Promise.all([
    supabase
      .from("student_intake_submissions")
      .select("id")
      .eq("coach_id", coachId)
      .eq("status", "pending")
      .or(`email.eq.${email},mobile.eq.${mobile}`)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("students")
      .select("id")
      .eq("coach_id", coachId)
      .eq("is_archived", false)
      .or(`email.eq.${email},mobile.eq.${mobile}`)
      .limit(1)
      .maybeSingle(),
  ]);

  if (pendingIntake) {
    throw new Error("You already have a pending sign-up with this email or mobile number.");
  }
  if (existingStudent) {
    throw new Error("You're already on this coach's roster. Contact them if you need help.");
  }

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
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();

  const { data: intake, error } = await supabase
    .from("student_intake_submissions")
    .select("*")
    .eq("id", intakeId)
    .eq("coach_id", coachId)
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw error;
  if (!intake) throw new Error("Sign-up not found or already processed.");

  const { data: locked, error: lockError } = await supabase
    .from("student_intake_submissions")
    .update({ status: "approved" })
    .eq("id", intakeId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (lockError) throw lockError;
  if (!locked) throw new Error("Sign-up already processed.");

  try {
    await createStudentAction(coachId, {
      name: intake.name,
      mobile: intake.mobile,
      email: intake.email,
      skillLevel: intake.skill_level as DuprLevel,
    });
  } catch (e) {
    await supabase
      .from("student_intake_submissions")
      .update({ status: "pending" })
      .eq("id", intakeId);
    throw e;
  }

  revalidatePath("/coach/students");
  revalidatePath("/coach/dashboard");
  revalidatePath("/coach/profile");
}

export async function rejectIntakeAction(coachId: string, intakeId: string) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("student_intake_submissions")
    .delete()
    .eq("id", intakeId)
    .eq("coach_id", coachId)
    .eq("status", "pending");
  if (error) throw error;
  revalidatePath("/coach/students");
  revalidatePath("/coach/profile");
}

export async function pendingIntakeCountAction(): Promise<number> {
  const coachId = await requireAuthenticatedCoachId();
  const list = await fetchIntakeSubmissionsAction(coachId);
  return list.filter((s) => s.status === "pending").length;
}
