"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { CoachAchievement } from "@/lib/koaches/types";
import { mapAchievement, type DbAchievement } from "@/lib/koaches/db/mappers";

export async function fetchCoachAchievementsAction(coachId: string): Promise<CoachAchievement[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("coach_achievements")
    .select("*")
    .eq("coach_id", coachId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as DbAchievement[]).map(mapAchievement);
}

export async function saveCoachAchievementsAction(coachId: string, achievements: CoachAchievement[]) {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  await supabase.from("coach_achievements").delete().eq("coach_id", coachId);

  if (achievements.length === 0) {
    revalidatePath("/coach/profile");
    return;
  }

  const rows = achievements.map((a, index) => ({
    id: a.id,
    coach_id: coachId,
    kind: a.kind,
    title: a.title,
    organization: a.organization ?? null,
    year: a.year ?? null,
    detail: a.detail ?? null,
    sort_order: index,
  }));

  const { error } = await supabase.from("coach_achievements").insert(rows);
  if (error) throw error;
  revalidatePath("/coach/profile");
}
