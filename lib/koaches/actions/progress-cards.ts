"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { ProgressCard } from "@/lib/koaches/types";
import { mapProgressCard, type DbProgressCard } from "@/lib/koaches/db/mappers";

export async function fetchProgressCardsAction(coachId: string): Promise<ProgressCard[]> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("progress_cards")
    .select("*")
    .eq("coach_id", coachId)
    .order("date_completed", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbProgressCard[]).map(mapProgressCard);
}

/** Public share page — no auth (intentional share link). */
export async function fetchProgressCardByIdAction(id: string): Promise<ProgressCard | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("progress_cards").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapProgressCard(data as DbProgressCard) : null;
}

export type SaveProgressCardResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function saveProgressCardAction(card: ProgressCard): Promise<SaveProgressCardResult> {
  await assertCoachAccess(card.coachId);
  const supabase = createServiceClient();

  if (card.sessionId) {
    const { data: existing, error: lookupError } = await supabase
      .from("progress_cards")
      .select("id")
      .eq("session_id", card.sessionId)
      .eq("student_id", card.studentId)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing && existing.id !== card.id) {
      return { ok: false, error: "A progress card already exists for this session." };
    }
  }

  const { error } = await supabase.from("progress_cards").upsert({
    id: card.id,
    student_id: card.studentId,
    coach_id: card.coachId,
    student_name: card.studentName,
    coach_name: card.coachName,
    program_name: card.programName,
    program_or_session: card.programOrSession,
    date_completed: card.dateCompleted,
    ratings_before: card.ratingsBefore,
    ratings_after: card.ratingsAfter,
    coach_message: card.coachMessage,
    session_id: card.sessionId ?? null,
  });
  if (error) throw error;
  revalidatePath("/coach/students");
  revalidatePath(`/coach/students/${card.studentId}`);
  revalidatePath(`/progress/${card.id}`);
  return { ok: true, id: card.id };
}
