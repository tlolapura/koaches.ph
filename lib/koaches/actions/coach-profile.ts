"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { CoachProfile, CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";
import type { CoachingLevelId } from "@/lib/koaches/application-form";
import { primarySkillTemplateFromLevels } from "@/lib/koaches/application-form";
import { mapCoach, type DbCoach } from "@/lib/koaches/db/mappers";
import { buildJoinPath, buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { isCoachProfileSetupComplete } from "@/lib/koaches/coach-onboarding";

export async function fetchCoachProfileAction(coachId: string): Promise<CoachProfile> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("coaches").select("*").eq("id", coachId).single();
  if (error) throw error;
  return mapCoach(data as DbCoach);
}

export async function updateCoachProfileAction(
  coachId: string,
  patch: Partial<
    Pick<
      CoachProfile,
      "bio" | "specialization" | "skillTemplateId" | "coachingLevels" | "sessionPricing" | "mobile" | "instagram" | "facebook"
    >
  >
) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.specialization !== undefined) row.specialization = patch.specialization;
  if (patch.skillTemplateId !== undefined) row.skill_template_id = patch.skillTemplateId;
  if (patch.coachingLevels !== undefined) {
    row.coaching_levels = patch.coachingLevels;
    row.skill_template_id = primarySkillTemplateFromLevels(patch.coachingLevels);
  }
  if (patch.sessionPricing !== undefined) {
    row.session_pricing = patch.sessionPricing;
    row.rate_per_session = patch.sessionPricing.tiers[0]?.rate ?? 0;
  }
  if (patch.mobile !== undefined) row.mobile = patch.mobile || null;
  if (patch.instagram !== undefined) row.instagram = patch.instagram || null;
  if (patch.facebook !== undefined) row.facebook = patch.facebook || null;

  const { data: existing, error: fetchError } = await supabase
    .from("coaches")
    .select("slug")
    .eq("id", coachId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase.from("coaches").update(row).eq("id", coachId);
  if (error) throw error;
  revalidatePath("/coach/profile");
  if (existing?.slug) {
    revalidatePath(buildPublicCoachPath(existing.slug));
  }
}

export async function updateCoachBioAction(coachId: string, bio: string, specialization: string) {
  return updateCoachProfileAction(coachId, { bio, specialization });
}

export async function updateCoachPricingAction(coachId: string, sessionPricing: CoachSessionPricing) {
  return updateCoachProfileAction(coachId, { sessionPricing });
}

export async function updateCoachCoachingLevelsAction(coachId: string, coachingLevels: CoachingLevelId[]) {
  if (coachingLevels.length === 0) {
    throw new Error("Select at least one player level.");
  }
  return updateCoachProfileAction(coachId, { coachingLevels });
}

/** @deprecated Use updateCoachCoachingLevelsAction */
export async function updateCoachSkillTemplateAction(coachId: string, skillTemplateId: SkillRubricId) {
  const levels: CoachingLevelId[] =
    skillTemplateId === "custom" ? ["intermediate"] : [skillTemplateId];
  return updateCoachProfileAction(coachId, { skillTemplateId, coachingLevels: levels });
}

export async function updateCoachContactAction(
  coachId: string,
  contact: { mobile: string; instagram: string; facebook: string }
) {
  return updateCoachProfileAction(coachId, {
    mobile: contact.mobile.trim(),
    instagram: contact.instagram.trim(),
    facebook: contact.facebook.trim(),
  });
}

export async function updateCoachPhotoAction(coachId: string, photoUrl: string | null) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();

  const { data: existing, error: fetchError } = await supabase
    .from("coaches")
    .select("slug")
    .eq("id", coachId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("coaches")
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq("id", coachId);
  if (error) throw error;

  revalidatePath("/coach/profile");
  revalidatePath("/coaches");
  if (existing?.slug) {
    const publicPath = buildPublicCoachPath(existing.slug);
    revalidatePath(publicPath);
    revalidatePath(buildJoinPath(existing.slug));
  }
}

export async function completeCoachOnboardingAction(coachId: string): Promise<CoachProfile> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error: fetchError } = await supabase
    .from("coaches")
    .select("*")
    .eq("id", coachId)
    .single();
  if (fetchError) throw fetchError;

  const coach = mapCoach(data as DbCoach);
  if (!isCoachProfileSetupComplete(coach)) {
    throw new Error("Please complete your bio, mobile number, and drop-in rates first.");
  }

  const completedAt = new Date().toISOString();
  const { error } = await supabase
    .from("coaches")
    .update({
      onboarding_completed_at: completedAt,
      updated_at: completedAt,
    })
    .eq("id", coachId);
  if (error) throw error;

  revalidatePath("/coach/onboarding");
  revalidatePath("/coach/dashboard");
  revalidatePath("/coach/profile");

  return { ...coach, onboardingCompletedAt: completedAt };
}
