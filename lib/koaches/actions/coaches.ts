"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import { extendCoachSubscriptionByMonths } from "@/lib/koaches/subscription-extend";
import { createServiceClient } from "@/lib/supabase/server";
import type { CoachProfile, CoachListing } from "@/lib/koaches/types";
import type { Court } from "@/lib/koaches/types";
import { mapCoach, mapCourt, type DbCoach, type DbCourt } from "@/lib/koaches/db/mappers";
import { COACH_COLUMNS, COACH_LISTING_COLUMNS, COURT_COLUMNS } from "@/lib/koaches/db/columns";
import { provisionCoachAccount, type ProvisionCoachResult } from "@/lib/koaches/provision-coach";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { isValidCoachSlug } from "@/lib/koaches/coach-slug";
import type { CoachingLevelId } from "@/lib/koaches/application-form";
import { primarySkillTemplateFromLevels } from "@/lib/koaches/application-form";
import { joinPersonName } from "@/lib/koaches/person-name";
import type { CoachSessionPricing } from "@/lib/koaches/types";

export async function fetchCoachBySlugAction(slug: string): Promise<CoachProfile | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("coaches")
    .select(COACH_COLUMNS as "*")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCoach(data as DbCoach) : null;
}

export async function fetchCoachesAction(): Promise<CoachProfile[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("coaches").select(COACH_COLUMNS as "*").order("name");
  if (error) throw error;
  return ((data ?? []) as DbCoach[]).map(mapCoach);
}

export async function fetchPublicCoachListingsAction(): Promise<CoachListing[]> {
  const supabase = createServiceClient();
  const [{ data: coachRows, error: coachError }, { data: courtRows, error: courtError }] =
    await Promise.all([
      supabase.from("coaches").select(COACH_LISTING_COLUMNS as "*").eq("is_active", true).order("name"),
      supabase.from("courts").select(COURT_COLUMNS as "*").eq("is_active", true),
    ]);
  if (coachError) throw coachError;
  if (courtError) throw courtError;

  const courtsById = new Map(
    ((courtRows ?? []) as DbCourt[]).map((row) => [row.id, mapCourt(row)])
  );

  return ((coachRows ?? []) as DbCoach[]).map((row) => {
    const coach = mapCoach(row);
    const courts = (row.court_ids ?? [])
      .map((id) => courtsById.get(id))
      .filter((court): court is Court => court !== undefined);
    return { ...coach, courts };
  });
}

export type CoachMutationResult =
  | { ok: true; subscriptionExpiry?: string }
  | { ok: false; error: string };

export async function setCoachActiveAction(
  coachId: string,
  isActive: boolean
): Promise<CoachMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: coach, error: fetchError } = await supabase
    .from("coaches")
    .select("slug")
    .eq("id", coachId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!coach) return { ok: false, error: "Coach not found." };

  const { error } = await supabase
    .from("coaches")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", coachId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");
  if (coach.slug) {
    revalidatePath(`/coach/${coach.slug}`);
  }
  return { ok: true };
}

export async function extendCoachSubscriptionAction(
  coachId: string,
  months = 1
): Promise<CoachMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from("coaches")
    .select("slug")
    .eq("id", coachId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Coach not found." };

  try {
    const nextExpiry = await extendCoachSubscriptionByMonths(supabase, coachId, months);
    revalidatePath("/admin/coaches");
    revalidatePath("/admin");
    revalidatePath("/coach/settings/billing");
    revalidatePath("/coach/billing");
    if (row.slug) revalidatePath(`/coach/${row.slug}`);
    return { ok: true, subscriptionExpiry: nextExpiry };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not extend subscription." };
  }
}

export async function updateCoachCourtIdsAction(
  coachId: string,
  courtIds: string[]
): Promise<CoachMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: coach, error: fetchError } = await supabase
    .from("coaches")
    .select("slug")
    .eq("id", coachId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!coach) return { ok: false, error: "Coach not found." };

  const { error } = await supabase
    .from("coaches")
    .update({ court_ids: courtIds, updated_at: new Date().toISOString() })
    .eq("id", coachId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");
  if (coach.slug) {
    revalidatePath(buildPublicCoachPath(coach.slug));
  }
  return { ok: true };
}

export type CreateCoachManuallyInput = {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
  preferredSlug?: string;
  specialization?: string;
  subscriptionPlan?: CoachProfile["subscriptionPlan"];
};

export type CreateCoachManuallyResult = import("@/lib/koaches/provision-coach").ProvisionCoachResult;

export async function createCoachManuallyAction(
  input: CreateCoachManuallyInput
): Promise<CreateCoachManuallyResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const result = await provisionCoachAccount(
    supabase,
    {
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      preferredSlug: input.preferredSlug,
      specialization: input.specialization,
      subscriptionPlan: input.subscriptionPlan ?? "early-bird",
    },
    { loginEmail: input.email, password: input.password }
  );

  if (result.ok) {
    revalidatePath("/admin/coaches");
    revalidatePath("/admin");
    revalidatePath(`/coach/${result.slug}`);
  }

  return result;
}

export type AdminUpdateCoachInput = {
  coachId: string;
  firstName: string;
  lastName: string;
  slug: string;
  bio: string;
  specialization: string;
  mobile: string;
  instagram: string;
  facebook: string;
  coachingLevels: CoachingLevelId[];
  sessionPricing: CoachSessionPricing;
  subscriptionPlan: CoachProfile["subscriptionPlan"];
  subscriptionExpiry: string;
};

export async function adminUpdateCoachAction(
  input: AdminUpdateCoachInput
): Promise<CoachMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const displayName = joinPersonName(firstName, lastName);
  if (!displayName) return { ok: false, error: "First name is required." };

  const slug = input.slug.trim().toLowerCase();
  if (!isValidCoachSlug(slug)) {
    return {
      ok: false,
      error: "Profile URL can only use lowercase letters, numbers, and hyphens.",
    };
  }

  if (input.coachingLevels.length === 0) {
    return { ok: false, error: "Select at least one player level." };
  }

  const supabase = createServiceClient();
  const { data: existing, error: fetchError } = await supabase
    .from("coaches")
    .select("id, slug, user_id")
    .eq("id", input.coachId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!existing) return { ok: false, error: "Coach not found." };

  if (slug !== existing.slug) {
    const { data: slugTaken } = await supabase
      .from("coaches")
      .select("id")
      .eq("slug", slug)
      .neq("id", input.coachId)
      .maybeSingle();
    if (slugTaken) return { ok: false, error: "That profile URL is already taken." };
  }

  const row = {
    name: displayName,
    first_name: firstName,
    last_name: lastName,
    slug,
    bio: input.bio.trim(),
    specialization: input.specialization.trim(),
    mobile: input.mobile.trim() || null,
    instagram: input.instagram.trim() || null,
    facebook: input.facebook.trim() || null,
    coaching_levels: input.coachingLevels,
    skill_template_id: primarySkillTemplateFromLevels(input.coachingLevels),
    session_pricing: input.sessionPricing,
    rate_per_session: input.sessionPricing.tiers[0]?.rate ?? 0,
    subscription_plan: input.subscriptionPlan,
    subscription_expiry: input.subscriptionExpiry,
    updated_at: new Date().toISOString(),
  };

  const { error: coachError } = await supabase.from("coaches").update(row).eq("id", input.coachId);
  if (coachError) return { ok: false, error: coachError.message };

  if (existing.user_id) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: displayName })
      .eq("id", existing.user_id);
    if (profileError) return { ok: false, error: profileError.message };
  }

  revalidatePath("/admin/coaches");
  revalidatePath("/admin");
  revalidatePath("/coach/profile");
  if (existing.slug) revalidatePath(buildPublicCoachPath(existing.slug));
  if (slug !== existing.slug) revalidatePath(buildPublicCoachPath(slug));

  return { ok: true, subscriptionExpiry: input.subscriptionExpiry };
}
