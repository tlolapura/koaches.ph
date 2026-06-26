"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { CoachProfile, CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";
import { mapCoach, type DbCoach } from "@/lib/koaches/db/mappers";
import { buildJoinPath, buildPublicCoachPath } from "@/lib/koaches/coach-routes";

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
      "bio" | "specialization" | "skillTemplateId" | "sessionPricing" | "mobile" | "instagram" | "facebook"
    >
  >
) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.bio !== undefined) row.bio = patch.bio;
  if (patch.specialization !== undefined) row.specialization = patch.specialization;
  if (patch.skillTemplateId !== undefined) row.skill_template_id = patch.skillTemplateId;
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

export async function updateCoachSkillTemplateAction(coachId: string, skillTemplateId: SkillRubricId) {
  return updateCoachProfileAction(coachId, { skillTemplateId });
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
