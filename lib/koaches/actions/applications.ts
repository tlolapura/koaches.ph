"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import { mapApplication, type DbApplication } from "@/lib/koaches/db/mappers";
import {
  provisionCoachAccount,
  type ProvisionCoachResult,
} from "@/lib/koaches/provision-coach";
import type { CoachApplication, CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";
import { createServiceClient } from "@/lib/supabase/server";

function revalidateCoachPaths(slug: string) {
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  revalidatePath("/admin/coaches");
  revalidatePath(`/coach/${slug}`);
}

export async function fetchApplicationsAction(
  status: CoachApplication["status"]
): Promise<CoachApplication[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("coach_applications")
    .select("*")
    .eq("status", status)
    .order("applied_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbApplication[]).map(mapApplication);
}

export type SubmitApplicationInput = {
  fullName: string;
  mobile: string;
  email: string;
  bio: string;
  specialization: string;
  instagram?: string;
  facebook?: string;
  coachingLevels: Array<Exclude<SkillRubricId, "custom">>;
  skillTemplateId: SkillRubricId;
  sessionPricing: CoachSessionPricing;
  preferredSlug?: string;
  currentStudentCount: number;
};

export async function submitCoachApplicationAction(input: SubmitApplicationInput) {
  const id = `app-${crypto.randomUUID().slice(0, 8)}`;

  const supabase = createServiceClient();
  const { error } = await supabase.from("coach_applications").insert({
    id,
    full_name: input.fullName.trim(),
    mobile: input.mobile.trim(),
    email: input.email.trim(),
    bio: input.bio.trim(),
    specialization: input.specialization.trim(),
    instagram: input.instagram?.trim() || null,
    facebook: input.facebook?.trim() || null,
    skill_template_id: input.skillTemplateId,
    coaching_levels: input.coachingLevels,
    session_pricing: input.sessionPricing,
    preferred_slug: input.preferredSlug?.trim() || null,
    current_student_count: input.currentStudentCount,
    status: "pending",
  });
  if (error) throw error;
  revalidatePath("/admin/applications");
  return id;
}

export type ApproveCoachApplicationInput = {
  email: string;
  password: string;
};

export type ApproveCoachApplicationResult = ProvisionCoachResult;

export async function approveCoachApplicationAction(
  applicationId: string,
  input: ApproveCoachApplicationInput
): Promise<ApproveCoachApplicationResult> {
  await requireAdmin();

  const supabase = createServiceClient();

  const { data: row, error: fetchError } = await supabase
    .from("coach_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Application not found." };

  const app = mapApplication(row as DbApplication);
  if (app.status !== "pending") {
    return { ok: false, error: "This application has already been reviewed." };
  }

  const result = await provisionCoachAccount(
    supabase,
    {
      fullName: app.fullName,
      mobile: app.mobile,
      preferredSlug: app.preferredSlug,
      specialization: app.specialization,
      bio: app.bio,
      skillTemplateId: app.skillTemplateId,
      subscriptionPlan: "early-bird",
      sessionPricing: app.sessionPricing,
    },
    { loginEmail: input.email, password: input.password }
  );
  if (!result.ok) return result;

  const { error: statusError } = await supabase
    .from("coach_applications")
    .update({ status: "approved" })
    .eq("id", applicationId);
  if (statusError) {
    await supabase.from("profiles").delete().eq("id", result.userId);
    await supabase.from("coaches").delete().eq("id", result.coachId);
    await supabase.auth.admin.deleteUser(result.userId);
    return { ok: false, error: statusError.message };
  }

  revalidateCoachPaths(result.slug);
  return result;
}

export async function rejectApplicationAction(applicationId: string) {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("coach_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId);
  if (error) throw error;
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}
