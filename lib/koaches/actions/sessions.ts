"use server";

import { revalidatePath } from "next/cache";
import {
  assertCoachAccess,
  assertCoachOwnsSession,
} from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import type { Session, SessionPaymentStatus, SessionStatus } from "@/lib/koaches/types";
import { mapSession, sessionToDb, type DbSession } from "@/lib/koaches/db/mappers";
import { SESSION_DETAIL_COLUMNS, SESSION_LIST_COLUMNS } from "@/lib/koaches/db/columns";

/** Default list window: past year + next year (covers schedule / reports). */
const DEFAULT_PAST_DAYS = 365;
const DEFAULT_FUTURE_DAYS = 365;

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type FetchSessionsOptions = {
  /** Include ratings_* / participant_progress (needed for progress UI). */
  includeProgress?: boolean;
  /** Inclusive YYYY-MM-DD. Defaults to today - 365d. */
  from?: string;
  /** Inclusive YYYY-MM-DD. Defaults to today + 365d. */
  to?: string;
  /** When true, ignore date window (still uses lean columns unless includeProgress). */
  allDates?: boolean;
};

export async function fetchSessionsAction(
  coachId: string,
  options: FetchSessionsOptions = {}
): Promise<Session[]> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const columns = (options.includeProgress ? SESSION_DETAIL_COLUMNS : SESSION_LIST_COLUMNS) as "*";
  const from = options.from ?? isoDateOffset(-DEFAULT_PAST_DAYS);
  const to = options.to ?? isoDateOffset(DEFAULT_FUTURE_DAYS);

  let query = supabase
    .from("sessions")
    .select(columns)
    .eq("coach_id", coachId)
    .order("date", { ascending: true, nullsFirst: false });

  if (!options.allDates) {
    // Unscheduled (null date) + in-window dates
    query = query.or(`date.is.null,and(date.gte.${from},date.lte.${to})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as DbSession[]).map(mapSession);
}

export async function fetchSessionByIdAction(sessionId: string): Promise<Session | null> {
  const coachId = await assertCoachOwnsSession(sessionId);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_DETAIL_COLUMNS as "*")
    .eq("id", sessionId)
    .eq("coach_id", coachId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSession(data as DbSession) : null;
}

/** Done sessions with ratings for one student (progress history). */
export async function fetchStudentSessionsWithProgressAction(
  coachId: string,
  studentId: string
): Promise<Session[]> {
  await assertCoachAccess(coachId);
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_DETAIL_COLUMNS as "*")
    .eq("coach_id", coachId)
    .eq("status", "done")
    .order("date", { ascending: true, nullsFirst: false });
  if (error) throw error;

  return ((data ?? []) as DbSession[])
    .map(mapSession)
    .filter(
      (s) => s.studentId === studentId || s.participants.some((p) => p.studentId === studentId)
    );
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
