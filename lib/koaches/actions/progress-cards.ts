"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { ProgressCard } from "@/lib/koaches/types";
import { mapProgressCard, type DbProgressCard } from "@/lib/koaches/db/mappers";

export async function fetchProgressCardsAction(coachId: string): Promise<ProgressCard[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("progress_cards")
    .select("*")
    .eq("coach_id", coachId)
    .order("date_completed", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbProgressCard[]).map(mapProgressCard);
}

export async function fetchProgressCardByIdAction(id: string): Promise<ProgressCard | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("progress_cards").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapProgressCard(data as DbProgressCard) : null;
}

export async function saveProgressCardAction(card: ProgressCard) {
  const supabase = createServiceClient();
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
  revalidatePath("/coach/progress");
  revalidatePath(`/coach/students/${card.studentId}`);
}
