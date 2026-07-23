"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { CoachProfile, CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";
import type { CoachingLevelId } from "@/lib/koaches/application-form";
import { primarySkillTemplateFromLevels } from "@/lib/koaches/application-form";
import { mapCoach, type DbCoach } from "@/lib/koaches/db/mappers";
import { COACH_COLUMNS } from "@/lib/koaches/db/columns";
import { buildJoinPath, buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { isCoachProfileSetupComplete } from "@/lib/koaches/coach-onboarding";
import {
  ALLOWED_PHOTO_TYPES,
  COACH_PHOTO_BUCKET,
  coachPhotoExtension,
  coachPhotoPathFromUrl,
  MAX_PHOTO_BYTES,
} from "@/lib/koaches/coach-photo";

export async function fetchCoachProfileAction(coachId: string): Promise<CoachProfile> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("coaches")
    .select(COACH_COLUMNS as "*")
    .eq("id", coachId)
    .single();
  if (error) throw error;
  return mapCoach(data as DbCoach);
}

export async function updateCoachProfileAction(
  coachId: string,
  patch: Partial<
    Pick<
      CoachProfile,
      | "bio"
      | "specialization"
      | "skillTemplateId"
      | "customSkillIds"
      | "customSkills"
      | "skillLabelOverrides"
      | "coachingLevels"
      | "sessionPricing"
      | "mobile"
      | "instagram"
      | "facebook"
    >
  >
) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.specialization !== undefined) row.specialization = patch.specialization;
  if (patch.skillTemplateId !== undefined) row.skill_template_id = patch.skillTemplateId;
  if (patch.customSkillIds !== undefined) row.custom_skill_ids = patch.customSkillIds;
  if (patch.customSkills !== undefined) row.custom_skills = patch.customSkills;
  if (patch.skillLabelOverrides !== undefined) row.skill_label_overrides = patch.skillLabelOverrides;
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
  revalidatePath("/coach/programs");
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

export async function updateDropInSkillsAction(
  coachId: string,
  config: {
    skillTemplateId: SkillRubricId;
    customSkillIds: string[];
    customSkills: import("@/lib/koaches/types").SkillDefinition[];
    skillLabelOverrides: Record<string, string>;
  }
) {
  if (config.customSkillIds.length === 0) {
    throw new Error("Pick at least one skill for drop-in sessions.");
  }
  return updateCoachProfileAction(coachId, {
    skillTemplateId: config.customSkillIds.length ? "custom" : config.skillTemplateId,
    customSkillIds: config.customSkillIds,
    customSkills: config.customSkills,
    skillLabelOverrides: config.skillLabelOverrides,
  });
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

async function revalidateCoachPhotoPaths(slug: string | null | undefined) {
  revalidatePath("/coach/profile");
  revalidatePath("/coaches");
  if (slug) {
    const publicPath = buildPublicCoachPath(slug);
    revalidatePath(publicPath);
    revalidatePath(buildJoinPath(slug));
  }
}

async function removeStoredCoachPhoto(
  supabase: ReturnType<typeof createServiceClient>,
  photoUrl: string | null | undefined
) {
  const path = coachPhotoPathFromUrl(photoUrl);
  if (path) {
    await supabase.storage.from(COACH_PHOTO_BUCKET).remove([path]);
  }
}

/** Upload a profile photo to Storage (or clear it). Prefer FormData over data URLs. */
export async function updateCoachPhotoAction(
  coachId: string,
  photo: FormData | File | null
): Promise<{ photoUrl: string | null }> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();

  const { data: existing, error: fetchError } = await supabase
    .from("coaches")
    .select("slug, photo_url")
    .eq("id", coachId)
    .single();
  if (fetchError) throw fetchError;

  let nextPhotoUrl: string | null = null;

  if (photo !== null) {
    const file =
      photo instanceof FormData ? (photo.get("file") as File | null) : photo;
    if (!file || !(file instanceof File)) {
      throw new Error("No photo file provided.");
    }
    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      throw new Error("Use JPG, PNG, or WebP.");
    }
    if (file.size > MAX_PHOTO_BYTES) {
      throw new Error("Photo must be under 2 MB.");
    }

    const ext = coachPhotoExtension(file.type);
    const storagePath = `${coachId}/profile.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(COACH_PHOTO_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = supabase.storage
      .from(COACH_PHOTO_BUCKET)
      .getPublicUrl(storagePath);
    nextPhotoUrl = `${publicUrl.publicUrl}?v=${Date.now()}`;

    const previousPath = coachPhotoPathFromUrl(existing?.photo_url);
    if (previousPath && previousPath !== storagePath) {
      await supabase.storage.from(COACH_PHOTO_BUCKET).remove([previousPath]);
    }
  } else {
    await removeStoredCoachPhoto(supabase, existing?.photo_url);
  }

  const { error } = await supabase
    .from("coaches")
    .update({ photo_url: nextPhotoUrl, updated_at: new Date().toISOString() })
    .eq("id", coachId);
  if (error) throw error;

  await revalidateCoachPhotoPaths(existing?.slug);
  return { photoUrl: nextPhotoUrl };
}

export async function completeCoachOnboardingAction(coachId: string): Promise<CoachProfile> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error: fetchError } = await supabase
    .from("coaches")
    .select(COACH_COLUMNS as "*")
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
