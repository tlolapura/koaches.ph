"use server";

import { requireAdmin } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { Court } from "@/lib/koaches/types";
import { mapCourt, type DbCourt } from "@/lib/koaches/db/mappers";

export type CourtMutationResult = { ok: true } | { ok: false; error: string };

export async function fetchCourtsAction(): Promise<Court[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return ((data ?? []) as DbCourt[]).map(mapCourt);
}

/** Admin: includes inactive courts. */
export async function fetchAllCourtsAdminAction(): Promise<Court[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("courts").select("*").order("name");
  if (error) throw error;
  return ((data ?? []) as DbCourt[]).map(mapCourt);
}

export async function fetchCourtsForCoachAction(coachId: string): Promise<Court[]> {
  const supabase = createServiceClient();
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("court_ids")
    .eq("id", coachId)
    .single();
  if (coachError) throw coachError;

  const courtIds = (coach?.court_ids ?? []) as string[];
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;

  const all = ((data ?? []) as DbCourt[]).map(mapCourt);
  if (courtIds.length === 0) return all;
  const idSet = new Set(courtIds);
  const filtered = all.filter((c) => idSet.has(c.id));
  return filtered.length > 0 ? filtered : all;
}

export async function createCourtAction(
  input: Omit<Court, "id" | "isActive"> & { isActive?: boolean }
): Promise<CourtMutationResult & { id?: string }> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const id = `court-${crypto.randomUUID().slice(0, 8)}`;
  const { error } = await supabase.from("courts").insert({
    id,
    name: input.name,
    address: input.address,
    city: input.city ?? "",
    region: input.region ?? "",
    maps_url: input.mapsUrl ?? null,
    is_active: input.isActive ?? true,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, id };
}

export async function updateCourtActiveAction(
  courtId: string,
  isActive: boolean
): Promise<CourtMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("courts").update({ is_active: isActive }).eq("id", courtId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteCourtAction(courtId: string): Promise<CourtMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const [{ count: sessionCount }, { data: coaches }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("court_id", courtId),
    supabase.from("coaches").select("id, court_ids").contains("court_ids", [courtId]),
  ]);

  if ((sessionCount ?? 0) > 0) {
    return { ok: false, error: "This court has sessions scheduled. Deactivate it instead." };
  }
  if ((coaches ?? []).length > 0) {
    return { ok: false, error: "Unassign this court from coaches before deleting." };
  }

  const { error } = await supabase.from("courts").delete().eq("id", courtId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
