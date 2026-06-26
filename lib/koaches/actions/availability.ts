"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import {
  DEFAULT_WORKING_HOURS,
  normalizeCoachWorkingHours,
  type BlockedSlot,
  type CoachWorkingHours,
} from "@/lib/koaches/coach-availability";
import { minutesToHtmlValue, parseTimeToMinutes } from "@/lib/koaches/session-time";
import type { DbBlockedSlot, DbWorkingHours } from "@/lib/koaches/db/mappers";

function blockedFromDb(row: DbBlockedSlot): BlockedSlot {
  return {
    id: row.id,
    date: row.date,
    startMin: parseTimeToMinutes(row.start_time),
    endMin: parseTimeToMinutes(row.end_time),
  };
}

function workingHoursFromLegacyRows(rows: DbWorkingHours[]): CoachWorkingHours {
  const enabled = rows.filter((r) => r.enabled && r.start_time && r.end_time);
  if (enabled.length === 0) return DEFAULT_WORKING_HOURS;

  const seen = new Set<string>();
  const windows = [];
  for (const row of enabled) {
    const key = `${row.start_time}-${row.end_time}`;
    if (seen.has(key)) continue;
    seen.add(key);
    windows.push({
      id: `wh-${row.start_time}-${row.end_time}`,
      startMin: parseTimeToMinutes(row.start_time!),
      endMin: parseTimeToMinutes(row.end_time!),
    });
  }

  return windows.length > 0 ? { windows } : DEFAULT_WORKING_HOURS;
}

function workingHoursFromColumn(value: unknown): CoachWorkingHours | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "windows" in value &&
    Array.isArray((value as CoachWorkingHours).windows) &&
    (value as CoachWorkingHours).windows.length > 0
  ) {
    return normalizeCoachWorkingHours(value);
  }
  return null;
}

export async function fetchCoachAvailabilityAction(coachId: string): Promise<{
  workingHours: CoachWorkingHours;
  blockedSlots: BlockedSlot[];
}> {
  const supabase = createServiceClient();

  const [{ data: coach, error: coachError }, { data: legacyRows }, { data: blockedRows, error: blockedError }] =
    await Promise.all([
      supabase.from("coaches").select("working_hours").eq("id", coachId).single(),
      supabase.from("coach_working_hours").select("*").eq("coach_id", coachId),
      supabase.from("coach_blocked_slots").select("*").eq("coach_id", coachId).order("date"),
    ]);

  if (coachError) throw coachError;
  if (blockedError) throw blockedError;

  const fromColumn = workingHoursFromColumn(coach?.working_hours);
  const workingHours =
    fromColumn ??
    workingHoursFromLegacyRows((legacyRows ?? []) as DbWorkingHours[]) ??
    DEFAULT_WORKING_HOURS;

  return {
    workingHours,
    blockedSlots: ((blockedRows ?? []) as DbBlockedSlot[]).map(blockedFromDb),
  };
}

export async function saveCoachWorkingHoursAction(coachId: string, hours: CoachWorkingHours) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("coaches")
    .update({
      working_hours: hours,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coachId);

  if (error) throw error;
  await supabase.from("coach_working_hours").delete().eq("coach_id", coachId);

  revalidatePath("/coach/profile");
  revalidatePath("/coach/sessions");
}

export async function saveCoachBlockedSlotsAction(coachId: string, slots: BlockedSlot[]) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  await supabase.from("coach_blocked_slots").delete().eq("coach_id", coachId);

  if (slots.length === 0) {
    revalidatePath("/coach/sessions");
    return;
  }

  const rows = slots.map((s) => ({
    id: s.id,
    coach_id: coachId,
    date: s.date,
    start_time: minutesToHtmlValue(s.startMin),
    end_time: minutesToHtmlValue(s.endMin),
    label: null,
  }));

  const { error } = await supabase.from("coach_blocked_slots").insert(rows);
  if (error) throw error;
  revalidatePath("/coach/sessions");
}

export async function upsertBlockedSlotAction(coachId: string, slot: BlockedSlot) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { error } = await supabase.from("coach_blocked_slots").upsert({
    id: slot.id,
    coach_id: coachId,
    date: slot.date,
    start_time: minutesToHtmlValue(slot.startMin),
    end_time: minutesToHtmlValue(slot.endMin),
    label: null,
  });
  if (error) throw error;
  revalidatePath("/coach/sessions");
}

export async function deleteBlockedSlotAction(coachId: string, slotId: string) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("coach_blocked_slots")
    .delete()
    .eq("coach_id", coachId)
    .eq("id", slotId);
  if (error) throw error;
  revalidatePath("/coach/sessions");
}
