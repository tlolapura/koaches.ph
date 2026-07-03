"use server";

import { revalidatePath } from "next/cache";
import { assertCoachAccess, requireAuthenticatedCoachId } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { ProgressCard } from "@/lib/koaches/types";
import { mapProgressCard, mapSession, type DbProgressCard, type DbSession } from "@/lib/koaches/db/mappers";
import { applySessionRatingsToProgressCard } from "@/lib/koaches/progress-cards";
import { progressCardCoachName } from "@/lib/koaches/person-name";
import {
  buildProgressCardEmailHtml,
  buildProgressCardEmailSubject,
  buildProgressCardEmailText,
} from "@/lib/koaches/email/progress-card-email";
import { getResendClient, getResendFromAddress } from "@/lib/koaches/email/resend";

async function resolveCoachNameForCard(
  supabase: ReturnType<typeof createServiceClient>,
  card: ProgressCard
): Promise<ProgressCard> {
  const stored = progressCardCoachName(card.coachName);
  if (stored !== "Coach") {
    return { ...card, coachName: stored };
  }

  const { data: coachRow } = await supabase
    .from("coaches")
    .select("name, first_name, last_name")
    .eq("id", card.coachId)
    .maybeSingle();

  if (!coachRow) return card;

  return {
    ...card,
    coachName: progressCardCoachName({
      firstName: coachRow.first_name ?? "",
      lastName: coachRow.last_name ?? "",
      name: coachRow.name,
    }),
  };
}

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
  if (!data) return null;

  let card = mapProgressCard(data as DbProgressCard);

  if (card.sessionId) {
    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", card.sessionId)
      .maybeSingle();
    if (sessionRow) {
      card = applySessionRatingsToProgressCard(card, mapSession(sessionRow as DbSession));
    }
  }

  return resolveCoachNameForCard(supabase, card);
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
    coach_strengths: card.coachStrengths?.trim() || null,
    coach_to_improve: card.coachToImprove?.trim() || null,
    coach_message: card.coachMessage,
    session_id: card.sessionId ?? null,
  });
  if (error) throw error;
  revalidatePath("/coach/students");
  revalidatePath(`/coach/students/${card.studentId}`);
  revalidatePath(`/progress/${card.id}`);
  return { ok: true, id: card.id };
}

export type SendProgressCardEmailResult =
  | { ok: true; to: string }
  | { ok: false; error: string };

export async function sendProgressCardEmailAction(
  cardId: string
): Promise<SendProgressCardEmailResult> {
  const coachId = await requireAuthenticatedCoachId();
  const supabase = createServiceClient();

  const { data: row, error } = await supabase
    .from("progress_cards")
    .select("*")
    .eq("id", cardId)
    .maybeSingle();
  if (error) throw error;
  if (!row || row.coach_id !== coachId) {
    return { ok: false, error: "Progress card not found." };
  }

  let card = await resolveCoachNameForCard(supabase, mapProgressCard(row as DbProgressCard));

  if (card.sessionId) {
    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", card.sessionId)
      .maybeSingle();
    if (sessionRow) {
      card = applySessionRatingsToProgressCard(card, mapSession(sessionRow as DbSession));
    }
  }

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("email, name")
    .eq("id", card.studentId)
    .maybeSingle();
  if (studentError) throw studentError;

  const to = student?.email?.trim();
  if (!to) {
    return {
      ok: false,
      error: "This player has no email on file. Add one on their student profile first.",
    };
  }

  const resend = getResendClient();
  const { error: sendError } = await resend.emails.send({
    from: getResendFromAddress(),
    to,
    subject: buildProgressCardEmailSubject(card),
    html: buildProgressCardEmailHtml(card),
    text: buildProgressCardEmailText(card),
  });

  if (sendError) {
    return { ok: false, error: sendError.message || "Could not send email." };
  }

  return { ok: true, to };
}
