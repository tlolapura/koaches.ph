"use server";

import { format, parseISO, startOfDay, subDays } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/koaches/actions/guards";
import {
  ADMIN_COACH_SUMMARY_COLUMNS,
  SESSION_LIST_COLUMNS,
} from "@/lib/koaches/db/columns";
import {
  mapCoach,
  mapProgressCard,
  mapSession,
  type DbCoach,
  type DbProgressCard,
  type DbSession,
} from "@/lib/koaches/db/mappers";
import type {
  AdminActivityData,
  AdminCoachFollowThrough,
  AdminSessionActivityRow,
} from "@/lib/koaches/admin-activity";
import { PROGRESS_CARD_EMAIL_MAX_SENDS } from "@/lib/koaches/progress-card-email-limits";
import {
  formatSessionParticipantNames,
  getSessionParticipants,
} from "@/lib/koaches/session-participants";
import {
  hasRatingsForCard,
  resolveParticipantProgress,
} from "@/lib/koaches/session-progress";
import type { Session } from "@/lib/koaches/types";

const ACTIVITY_LOOKBACK_DAYS = 90;
const ACTIVITY_SESSION_LIMIT = 200;

function parseDay(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const d = parseISO(value.slice(0, 10));
    return Number.isNaN(d.getTime()) ? null : startOfDay(d);
  } catch {
    return null;
  }
}

function inLastDays(date: Date, today: Date, days: number): boolean {
  const start = startOfDay(subDays(today, days - 1));
  return date >= start && date <= today;
}

function sessionHasRatings(session: Session): boolean {
  const participants = getSessionParticipants(session);
  if (participants.length === 0) {
    return hasRatingsForCard({
      ratingsBefore: session.ratingsBefore,
      ratingsAfter: session.ratingsAfter,
    });
  }
  return participants.some((p) =>
    hasRatingsForCard(resolveParticipantProgress(session, p.id))
  );
}

export async function fetchAdminActivityAction(): Promise<AdminActivityData> {
  await requireAdmin();
  const supabase = createServiceClient();
  const today = startOfDay(new Date());
  const lookbackStart = format(subDays(today, ACTIVITY_LOOKBACK_DAYS - 1), "yyyy-MM-dd");

  const [
    { data: sessions, error: sessionsError },
    { data: coaches, error: coachesError },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select(SESSION_LIST_COLUMNS)
      .eq("status", "done")
      .gte("date", lookbackStart)
      .order("date", { ascending: false })
      .limit(ACTIVITY_SESSION_LIMIT),
    supabase.from("coaches").select(ADMIN_COACH_SUMMARY_COLUMNS as "*"),
  ]);

  if (sessionsError) throw sessionsError;
  if (coachesError) throw coachesError;

  const sessionRows = ((sessions ?? []) as unknown as DbSession[]).map(mapSession);
  const coachNameById = new Map(
    ((coaches ?? []) as DbCoach[]).map((row) => {
      const coach = mapCoach(row);
      return [coach.id, coach.name] as const;
    })
  );

  const sessionIds = sessionRows.map((s) => s.id);
  let progressCards: ReturnType<typeof mapProgressCard>[] = [];
  if (sessionIds.length > 0) {
    const { data: cards, error: cardsError } = await supabase
      .from("progress_cards")
      .select(
        "id, student_id, coach_id, student_name, coach_name, program_name, program_or_session, date_completed, ratings_before, ratings_after, coach_strengths, coach_to_improve, coach_message, session_id, email_send_count"
      )
      .in("session_id", sessionIds);
    if (cardsError) throw cardsError;
    progressCards = ((cards ?? []) as DbProgressCard[]).map(mapProgressCard);
  }

  const cardBySessionId = new Map<string, (typeof progressCards)[number]>();
  for (const card of progressCards) {
    if (!card.sessionId) continue;
    const existing = cardBySessionId.get(card.sessionId);
    if (!existing || (card.emailSendCount ?? 0) > (existing.emailSendCount ?? 0)) {
      cardBySessionId.set(card.sessionId, card);
    }
  }

  const activityRows: AdminSessionActivityRow[] = sessionRows.map((session) => {
    const card = cardBySessionId.get(session.id);
    const emailSendCount = card?.emailSendCount ?? 0;
    return {
      sessionId: session.id,
      date: session.date ?? "",
      time: session.time,
      endTime: session.endTime,
      type: session.type,
      coachId: session.coachId,
      coachName: coachNameById.get(session.coachId) ?? "Unknown coach",
      playerLabel: formatSessionParticipantNames(session),
      playerCount: session.playerCount,
      hasRatings: sessionHasRatings(session),
      progressCardId: card?.id ?? null,
      emailSendCount,
      atEmailLimit: emailSendCount >= PROGRESS_CARD_EMAIL_MAX_SENDS,
    };
  });

  let sessionsDone7d = 0;
  let sessionsDone30d = 0;
  let withRatings30d = 0;
  let withCard30d = 0;
  let cardsEmailed30d = 0;
  let missingCard30d = 0;
  let atEmailLimit = 0;

  const coachStats = new Map<
    string,
    { coachName: string; done: number; withCard: number }
  >();

  for (const row of activityRows) {
    const day = parseDay(row.date);
    if (!day) continue;

    if (row.atEmailLimit) atEmailLimit += 1;

    if (inLastDays(day, today, 7)) sessionsDone7d += 1;

    if (inLastDays(day, today, 30)) {
      sessionsDone30d += 1;
      if (row.hasRatings) withRatings30d += 1;
      if (row.progressCardId) {
        withCard30d += 1;
        if (row.emailSendCount > 0) cardsEmailed30d += 1;
      } else {
        missingCard30d += 1;
      }

      const stats = coachStats.get(row.coachId) ?? {
        coachName: row.coachName,
        done: 0,
        withCard: 0,
      };
      stats.done += 1;
      if (row.progressCardId) stats.withCard += 1;
      coachStats.set(row.coachId, stats);
    }
  }

  const coachesNeedingFollowThrough: AdminCoachFollowThrough[] = [...coachStats.entries()]
    .map(([coachId, stats]) => ({
      coachId,
      coachName: stats.coachName,
      doneSessions30d: stats.done,
      withCard30d: stats.withCard,
      cardRate: stats.done === 0 ? 0 : Math.round((stats.withCard / stats.done) * 100),
    }))
    .filter((c) => c.doneSessions30d >= 2 && c.cardRate < 50)
    .sort((a, b) => a.cardRate - b.cardRate || b.doneSessions30d - a.doneSessions30d)
    .slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      sessionsDone7d,
      sessionsDone30d,
      withRatings30d,
      withCard30d,
      cardsEmailed30d,
      missingCard30d,
      atEmailLimit,
    },
    sessions: activityRows,
    coachesNeedingFollowThrough,
  };
}
