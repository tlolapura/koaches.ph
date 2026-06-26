"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import { extendCoachSubscriptionByMonths } from "@/lib/koaches/subscription-extend";
import { createServiceClient } from "@/lib/supabase/server";
import type { CoachProfile, CoachListing } from "@/lib/koaches/types";
import type { Court } from "@/lib/koaches/types";
import { mapCoach, mapCourt, type DbCoach, type DbCourt } from "@/lib/koaches/db/mappers";
import { provisionCoachAccount, type ProvisionCoachResult } from "@/lib/koaches/provision-coach";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";

export async function fetchCoachBySlugAction(slug: string): Promise<CoachProfile | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("coaches")
    .select("*")
    .eq("slug", normalized)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCoach(data as DbCoach) : null;
}

export async function fetchCoachesAction(): Promise<CoachProfile[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("coaches").select("*").order("name");
  if (error) throw error;
  return ((data ?? []) as DbCoach[]).map(mapCoach);
}

export async function fetchPublicCoachListingsAction(): Promise<CoachListing[]> {
  const supabase = createServiceClient();
  const [{ data: coachRows, error: coachError }, { data: courtRows, error: courtError }] =
    await Promise.all([
      supabase.from("coaches").select("*").eq("is_active", true).order("name"),
      supabase.from("courts").select("*").eq("is_active", true),
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
  fullName: string;
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
      fullName: input.fullName,
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
