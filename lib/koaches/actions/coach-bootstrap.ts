"use server";

import { getCachedCoachId } from "@/lib/koaches/auth/cached";
import { mapCoach, mapSession, type DbCoach, type DbSession } from "@/lib/koaches/db/mappers";
import type { CoachProfile, Session } from "@/lib/koaches/types";
import { createServiceClient } from "@/lib/supabase/server";

export type CoachPortalBootstrap = {
  coach: CoachProfile;
  sessions: Session[];
};

/** One auth check + parallel coach/sessions fetch for layout hydration. */
export async function coachPortalBootstrapAction(
  coachId: string
): Promise<CoachPortalBootstrap> {
  const authCoachId = await getCachedCoachId();
  if (!authCoachId || authCoachId !== coachId) {
    throw new Error("Not authorized.");
  }

  const supabase = createServiceClient();
  const [coachRes, sessionsRes] = await Promise.all([
    supabase.from("coaches").select("*").eq("id", coachId).single(),
    supabase
      .from("sessions")
      .select("*")
      .eq("coach_id", coachId)
      .order("date", { ascending: true, nullsFirst: false }),
  ]);

  if (coachRes.error) throw coachRes.error;
  if (sessionsRes.error) throw sessionsRes.error;

  return {
    coach: mapCoach(coachRes.data as DbCoach),
    sessions: ((sessionsRes.data ?? []) as DbSession[]).map(mapSession),
  };
}
