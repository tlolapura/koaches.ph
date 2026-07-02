"use server";

import { revalidatePath } from "next/cache";
import {
  assertCoachAccess,
  assertCoachOwnsSession,
} from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { Session, SessionPaymentStatus, SessionStatus } from "@/lib/koaches/types";
import { mapSession, sessionToDb, type DbSession } from "@/lib/koaches/db/mappers";

export async function fetchSessionsAction(coachId: string): Promise<Session[]> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("coach_id", coachId)
    .order("date", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as DbSession[]).map(mapSession);
}

export async function createSessionsAction(sessions: Session[]) {
  if (sessions.length === 0) return;
  const coachId = await assertCoachAccess(sessions[0].coachId);
  if (sessions.some((s) => s.coachId !== coachId)) {
    throw new Error("Not authorized.");
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("sessions").insert(sessions.map(sessionToDb));
  if (error) throw error;
  revalidatePath("/coach/sessions");
  revalidatePath("/coach/dashboard");
}

export async function updateSessionStatusAction(sessionId: string, status: SessionStatus) {
  await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
  revalidatePath("/coach/sessions");
  revalidatePath("/coach/dashboard");
  revalidatePath("/coach/students");
}

export async function deleteSessionAction(sessionId: string) {
  await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
  revalidatePath("/coach/sessions");
  revalidatePath("/coach/dashboard");
  revalidatePath("/coach/students");
  revalidatePath("/coach/reports");
}

export async function updateSessionScheduleAction(
  sessionId: string,
  patch: { date: string; time: string; endTime: string; courtId?: string }
) {
  await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({
      date: patch.date,
      time: patch.time,
      end_time: patch.endTime,
      ...(patch.courtId ? { court_id: patch.courtId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
  revalidatePath("/coach/sessions");
  revalidatePath("/coach/dashboard");
}

export async function updateSessionPaymentAction(
  sessionId: string,
  paymentStatus: SessionPaymentStatus
) {
  await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
}

export async function updateSessionTipAction(sessionId: string, tip: number) {
  await assertCoachOwnsSession(sessionId);
  const amount = Math.round(tip);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Tip must be zero or a positive amount.");
  }
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({ tip: amount, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
  revalidatePath("/coach/reports");
}

export async function updateSessionNotesAction(sessionId: string, notes: string) {
  await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
}

export async function updateSessionProgressAction(sessionId: string, session: Session) {
  const coachId = await assertCoachOwnsSession(sessionId);
  if (session.coachId !== coachId) throw new Error("Not authorized.");
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sessions")
    .update({
      ratings_before: session.ratingsBefore ?? null,
      ratings_after: session.ratingsAfter ?? null,
      participant_progress: session.participantProgress ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (error) throw error;
  revalidatePath(`/coach/sessions/${sessionId}`);
}
