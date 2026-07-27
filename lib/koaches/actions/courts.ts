"use server";

import { revalidatePath } from "next/cache";
import {
  requireAdmin,
  requireAuthenticatedCoachId,
} from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { Court, CourtRequest, CourtRequestStatus } from "@/lib/koaches/types";
import { mapCourt, type DbCourt } from "@/lib/koaches/db/mappers";
import { COURT_COLUMNS } from "@/lib/koaches/db/columns";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";

export type CourtMutationResult = { ok: true } | { ok: false; error: string };

type DbCourtRequest = {
  id: string;
  coach_id: string;
  name: string;
  address: string;
  city: string;
  region: string;
  maps_url: string | null;
  status: CourtRequestStatus;
  admin_note: string | null;
  created_court_id: string | null;
  created_at: string;
  reviewed_at: string | null;
};

function mapCourtRequest(
  row: DbCourtRequest,
  coachName?: string
): CourtRequest {
  return {
    id: row.id,
    coachId: row.coach_id,
    coachName,
    name: row.name,
    address: row.address,
    city: row.city,
    region: row.region,
    mapsUrl: row.maps_url ?? undefined,
    status: row.status,
    adminNote: row.admin_note ?? undefined,
    createdCourtId: row.created_court_id ?? undefined,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export async function fetchCourtsAction(): Promise<Court[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("courts")
    .select(COURT_COLUMNS as "*")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return ((data ?? []) as DbCourt[]).map(mapCourt);
}

/** Admin: includes inactive courts. */
export async function fetchAllCourtsAdminAction(): Promise<Court[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("courts").select(COURT_COLUMNS as "*").order("name");
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

  // Only the coach's own courts — they manage the list on Profile.
  const courtIds = (coach?.court_ids ?? []) as string[];
  if (courtIds.length === 0) return [];

  const { data, error } = await supabase
    .from("courts")
    .select(COURT_COLUMNS as "*")
    .eq("is_active", true)
    .in("id", courtIds)
    .order("name");
  if (error) throw error;
  return ((data ?? []) as DbCourt[]).map(mapCourt);
}

async function revalidateCoachCourts(coachId: string) {
  const supabase = createServiceClient();
  const { data: coach } = await supabase.from("coaches").select("slug").eq("id", coachId).maybeSingle();
  revalidatePath("/admin/courts");
  revalidatePath("/admin/coaches");
  revalidatePath("/coach/profile");
  if (coach?.slug) {
    revalidatePath(buildPublicCoachPath(coach.slug));
  }
}

/** Coach: set which existing platform courts they teach at. */
export async function updateMyCourtIdsAction(
  courtIds: string[]
): Promise<CourtMutationResult> {
  try {
    const coachId = await requireAuthenticatedCoachId();
    const supabase = createServiceClient();

    const uniqueIds = [...new Set(courtIds.filter(Boolean))];
    if (uniqueIds.length > 0) {
      const { data: courts, error } = await supabase
        .from("courts")
        .select("id")
        .eq("is_active", true)
        .in("id", uniqueIds);
      if (error) return { ok: false, error: error.message };
      if ((courts ?? []).length !== uniqueIds.length) {
        return { ok: false, error: "One or more courts are not available." };
      }
    }

    const { error: updateError } = await supabase
      .from("coaches")
      .update({ court_ids: uniqueIds, updated_at: new Date().toISOString() })
      .eq("id", coachId);
    if (updateError) return { ok: false, error: updateError.message };

    await revalidateCoachCourts(coachId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }
}

export async function submitCourtRequestAction(input: {
  name: string;
  address: string;
  city: string;
  region?: string;
  mapsUrl?: string;
}): Promise<CourtMutationResult & { id?: string }> {
  try {
    const coachId = await requireAuthenticatedCoachId();
    const name = input.name.trim();
    const address = input.address.trim();
    const city = input.city.trim();
    if (!name) return { ok: false, error: "Enter the court name." };
    if (!address) return { ok: false, error: "Enter the court address." };
    if (!city) return { ok: false, error: "Enter the city." };

    const supabase = createServiceClient();
    const { count, error: countError } = await supabase
      .from("court_requests")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", coachId)
      .eq("status", "pending");
    if (countError) return { ok: false, error: countError.message };
    if ((count ?? 0) >= 5) {
      return { ok: false, error: "You already have several courts waiting for review." };
    }

    const id = `creq-${crypto.randomUUID().slice(0, 8)}`;
    const { error } = await supabase.from("court_requests").insert({
      id,
      coach_id: coachId,
      name,
      address,
      city,
      region: (input.region ?? "Metro Manila").trim() || "Metro Manila",
      maps_url: input.mapsUrl?.trim() || null,
      status: "pending",
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/courts");
    revalidatePath("/coach/profile");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }
}

export async function fetchMyCourtRequestsAction(): Promise<CourtRequest[]> {
  const coachId = await requireAuthenticatedCoachId();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("court_requests")
    .select("*")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbCourtRequest[]).map((row) => mapCourtRequest(row));
}

export async function fetchPendingCourtRequestsAdminAction(): Promise<CourtRequest[]> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("court_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as DbCourtRequest[];
  if (rows.length === 0) return [];

  const coachIds = [...new Set(rows.map((r) => r.coach_id))];
  const { data: coaches } = await supabase.from("coaches").select("id, name").in("id", coachIds);
  const nameById = new Map((coaches ?? []).map((c) => [c.id as string, c.name as string]));

  return rows.map((row) => mapCourtRequest(row, nameById.get(row.coach_id)));
}

/**
 * Admin approval. Optional `edits` let admin clean up the coach's details
 * (naming, spelling, address) before the court joins the directory.
 */
export async function approveCourtRequestAction(
  requestId: string,
  edits?: {
    name?: string;
    address?: string;
    city?: string;
    region?: string;
    mapsUrl?: string;
  }
): Promise<CourtMutationResult & { courtId?: string; court?: Court }> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from("court_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Request not found." };
  if (row.status !== "pending") return { ok: false, error: "This request was already reviewed." };

  const details = {
    name: (edits?.name ?? row.name).trim(),
    address: (edits?.address ?? row.address).trim(),
    city: (edits?.city ?? row.city ?? "").trim(),
    region: (edits?.region ?? row.region ?? "").trim(),
    mapsUrl: (edits?.mapsUrl ?? row.maps_url ?? "").trim() || undefined,
  };
  if (!details.name) return { ok: false, error: "Enter the court name." };
  if (!details.address) return { ok: false, error: "Enter the court address." };

  const courtId = `court-${crypto.randomUUID().slice(0, 8)}`;
  const { error: insertError } = await supabase.from("courts").insert({
    id: courtId,
    name: details.name,
    address: details.address,
    city: details.city,
    region: details.region,
    maps_url: details.mapsUrl ?? null,
    is_active: true,
  });
  if (insertError) return { ok: false, error: insertError.message };

  const { data: coach } = await supabase
    .from("coaches")
    .select("court_ids")
    .eq("id", row.coach_id)
    .maybeSingle();
  const nextIds = [...new Set([...(coach?.court_ids ?? []), courtId])];

  const { error: coachError } = await supabase
    .from("coaches")
    .update({ court_ids: nextIds, updated_at: new Date().toISOString() })
    .eq("id", row.coach_id);
  if (coachError) return { ok: false, error: coachError.message };

  const { error: updateError } = await supabase
    .from("court_requests")
    .update({
      status: "approved",
      name: details.name,
      address: details.address,
      city: details.city,
      region: details.region,
      maps_url: details.mapsUrl ?? null,
      created_court_id: courtId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (updateError) return { ok: false, error: updateError.message };

  await revalidateCoachCourts(row.coach_id);
  return { ok: true, courtId, court: { id: courtId, ...details, isActive: true } };
}

/**
 * Admin: the requested court already exists in the directory. Assign the
 * existing court to the coach and close the request without creating a duplicate.
 */
export async function linkCourtRequestToExistingAction(
  requestId: string,
  courtId: string
): Promise<CourtMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from("court_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Request not found." };
  if (row.status !== "pending") return { ok: false, error: "This request was already reviewed." };

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("id, name, is_active")
    .eq("id", courtId)
    .maybeSingle();
  if (courtError) return { ok: false, error: courtError.message };
  if (!court) return { ok: false, error: "Court not found." };
  if (court.is_active === false) {
    return { ok: false, error: "That court is inactive. Activate it first." };
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("court_ids")
    .eq("id", row.coach_id)
    .maybeSingle();
  const nextIds = [...new Set([...(coach?.court_ids ?? []), courtId])];

  const { error: coachError } = await supabase
    .from("coaches")
    .update({ court_ids: nextIds, updated_at: new Date().toISOString() })
    .eq("id", row.coach_id);
  if (coachError) return { ok: false, error: coachError.message };

  const { error: updateError } = await supabase
    .from("court_requests")
    .update({
      status: "approved",
      admin_note: `Already in the directory as "${court.name}". We added it to your courts.`,
      created_court_id: courtId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (updateError) return { ok: false, error: updateError.message };

  await revalidateCoachCourts(row.coach_id);
  return { ok: true };
}

export async function rejectCourtRequestAction(
  requestId: string,
  adminNote?: string
): Promise<CourtMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const supabase = createServiceClient();
  const { data: row, error: fetchError } = await supabase
    .from("court_requests")
    .select("id, status")
    .eq("id", requestId)
    .maybeSingle();
  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Request not found." };
  if (row.status !== "pending") return { ok: false, error: "This request was already reviewed." };

  const { error } = await supabase
    .from("court_requests")
    .update({
      status: "rejected",
      admin_note: adminNote?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/courts");
  revalidatePath("/coach/profile");
  return { ok: true };
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
  revalidatePath("/admin/courts");
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
  revalidatePath("/admin/courts");
  return { ok: true };
}

export async function updateCourtAction(
  courtId: string,
  input: Omit<Court, "id" | "isActive">
): Promise<CourtMutationResult> {
  try {
    await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Not authorized." };
  }

  const name = input.name.trim();
  const address = input.address.trim();
  if (!name || !address) {
    return { ok: false, error: "Name and address are required." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("courts")
    .update({
      name,
      address,
      city: input.city?.trim() ?? "",
      region: input.region?.trim() ?? "",
      maps_url: input.mapsUrl?.trim() || null,
    })
    .eq("id", courtId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/courts");
  revalidatePath("/coach");
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
  revalidatePath("/admin/courts");
  return { ok: true };
}
