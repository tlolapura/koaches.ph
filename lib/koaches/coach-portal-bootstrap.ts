import {
  mapCoach,
  mapProgressCard,
  mapSession,
  type DbCoach,
  type DbProgressCard,
  type DbSession,
} from "@/lib/koaches/db/mappers";
import { COACH_COLUMNS, SESSION_LIST_COLUMNS } from "@/lib/koaches/db/columns";
import type { CoachProfile, ProgressCard, Session } from "@/lib/koaches/types";
import { createServiceClient } from "@/lib/supabase/server";

export type CoachPortalBootstrap = {
  coach: CoachProfile;
  sessions: Session[];
  progressCards: ProgressCard[];
};

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Parallel coach + lean sessions + progress cards.
 * Caller must already authorize (middleware / assertCoachAccess).
 */
export async function loadCoachPortalBootstrap(
  coachId: string
): Promise<CoachPortalBootstrap> {
  const supabase = createServiceClient();
  const from = isoDateOffset(-365);
  const to = isoDateOffset(365);

  const [coachRes, sessionsRes, cardsRes] = await Promise.all([
    supabase.from("coaches").select(COACH_COLUMNS as "*").eq("id", coachId).single(),
    supabase
      .from("sessions")
      .select(SESSION_LIST_COLUMNS as "*")
      .eq("coach_id", coachId)
      .or(`date.is.null,and(date.gte.${from},date.lte.${to})`)
      .order("date", { ascending: true, nullsFirst: false }),
    supabase
      .from("progress_cards")
      .select("*")
      .eq("coach_id", coachId)
      .order("date_completed", { ascending: false }),
  ]);

  if (coachRes.error) throw coachRes.error;
  if (sessionsRes.error) throw sessionsRes.error;
  if (cardsRes.error) throw cardsRes.error;

  return {
    coach: mapCoach(coachRes.data as unknown as DbCoach),
    sessions: ((sessionsRes.data ?? []) as unknown as DbSession[]).map(mapSession),
    progressCards: ((cardsRes.data ?? []) as DbProgressCard[]).map(mapProgressCard),
  };
}
