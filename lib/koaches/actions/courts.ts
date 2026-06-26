"use server";

import { createServiceClient } from "@/lib/supabase/server";
import type { Court } from "@/lib/koaches/types";
import { mapCourt, type DbCourt } from "@/lib/koaches/db/mappers";

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

export async function createCourtAction(input: Omit<Court, "id" | "isActive"> & { isActive?: boolean }) {
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
  if (error) throw error;
  return id;
}

export async function updateCourtActiveAction(courtId: string, isActive: boolean) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("courts").update({ is_active: isActive }).eq("id", courtId);
  if (error) throw error;
}

export async function deleteCourtAction(courtId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("courts").delete().eq("id", courtId);
  if (error) throw error;
}
