"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Session } from "@/lib/koaches/types";
import { getSessionParticipants } from "@/lib/koaches/session-participants";
import {
  formatParticipantProgramLabel,
  resolveParticipantProgramContext,
} from "@/lib/koaches/participant-program";
import { filterRatedSkills, hasRatingsForCard } from "@/lib/koaches/session-progress";
import { findProgressCardForSession } from "@/lib/koaches/progress-cards";
import { useParticipantProgress } from "@/hooks/useParticipantProgress";
import { useProgressCards } from "@/hooks/useProgressCards";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { SkillRatingPanel } from "@/components/koaches/coach/SkillRatingPanel";
import { GenerateProgressCardSheet } from "@/components/koaches/coach/GenerateProgressCardSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";

type SessionSkillRatingsSectionProps = {
  session: Session;
};

function ParticipantProgressPanel({
  session,
  participantId,
  coachLookup,
}: {
  session: Session;
  participantId: string;
  coachLookup?: Parameters<typeof resolveParticipantProgramContext>[2];
}) {
  const participants = getSessionParticipants(session);
  const participant = participants.find((p) => p.id === participantId)!;
  const ctx = resolveParticipantProgramContext(participant, session, coachLookup);
  const { ratings, saveRatings } = useParticipantProgress(session, participant.id);
  const { cards, saveCard } = useProgressCards(session.coachId);
  const { showToast } = useCoachToast();
  const [generateOpen, setGenerateOpen] = useState(false);

  const existingCard =
    participant.studentId &&
    findProgressCardForSession(cards, session.id, participant.studentId);

  const readyForCard = hasRatingsForCard(ratings);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-[11px] font-semibold text-[#166534]">
          {formatParticipantProgramLabel(ctx)}
          {ctx.sessionNumber != null && ctx.totalSessions != null && (
            <span className="font-medium text-[#166534]/80">
              {" "}
              · Session {ctx.sessionNumber}/{ctx.totalSessions}
            </span>
          )}
        </span>
        {participant.studentId && (
          <Link
            href={`/coach/students/${participant.studentId}`}
            className="text-xs font-semibold text-[#4F8FF7]"
          >
            Full progress →
          </Link>
        )}
      </div>

      <SkillRatingPanel
        key={`${participant.id}-${ctx.rubricId}`}
        initialBefore={ratings.ratingsBefore}
        initialAfter={ratings.ratingsAfter}
        rubricId={ctx.rubricId}
        customSkillIds={ctx.customSkillIds}
        customSkills={ctx.customSkills}
        skillLabelOverrides={ctx.skillLabelOverrides}
        sessionNumber={ctx.sessionNumber}
        totalSessions={ctx.totalSessions}
        onSave={async (before, after) => {
          await saveRatings({ ratingsBefore: before, ratingsAfter: after });
          if (existingCard) {
            await saveCard({
              ...existingCard,
              ratingsBefore: filterRatedSkills(before),
              ratingsAfter: filterRatedSkills(after),
            });
            showToast(`Ratings and progress card updated for ${participant.name}`);
          } else {
            showToast(`Ratings saved for ${participant.name}`);
          }
        }}
      />

      {readyForCard && (
        <div className="mt-4">
          {existingCard ? (
            <Link
              href={`/progress/${existingCard.id}`}
              className="coach-btn-outline w-full text-center text-sm"
            >
              View progress card
            </Link>
          ) : (
            <button
              type="button"
              className="coach-btn-primary w-full"
              onClick={() => setGenerateOpen(true)}
            >
              Generate progress card
            </button>
          )}
        </div>
      )}

      <GenerateProgressCardSheet
        open={generateOpen}
        onClose={() => setGenerateOpen(false)}
        session={session}
        participantId={participant.id}
        ratings={ratings}
      />
    </div>
  );
}

export function SessionSkillRatingsSection({ session }: SessionSkillRatingsSectionProps) {
  const participants = getSessionParticipants(session);
  const [activeId, setActiveId] = useState(participants[0]?.id ?? "");
  const { coach } = useCoachProfile(session.coachId);

  const coachLookup = useMemo(
    () =>
      coach
        ? {
            coach: {
              skillTemplateId: coach.skillTemplateId,
              customSkillIds: coach.customSkillIds,
              customSkills: coach.customSkills,
              skillLabelOverrides: coach.skillLabelOverrides,
            },
          }
        : undefined,
    [coach]
  );

  const contexts = useMemo(
    () =>
      new Map(
        participants.map((p) => [
          p.id,
          resolveParticipantProgramContext(p, session, coachLookup),
        ])
      ),
    [participants, session, coachLookup]
  );

  if (participants.length === 0) return null;

  const active = participants.find((p) => p.id === activeId) ?? participants[0];

  return (
    <div className="mt-2">
      <h2 className="font-heading text-lg font-semibold">Rate skills</h2>
      <p className="mt-1 text-sm text-[#6B7280]">
        {participants.length > 1
          ? "Pick a player, then tap before and after."
          : "Tap before and after for each skill you covered."}
      </p>

      {participants.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {participants.map((p) => {
            const ctx = contexts.get(p.id)!;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={cn(
                  "font-heading flex shrink-0 flex-col items-start rounded-2xl px-4 py-2.5 text-left min-h-[44px] transition-all",
                  active.id === p.id
                    ? "bg-[#16A34A] text-white shadow-sm"
                    : "border border-[#E5E7EB] bg-white text-[#374151]"
                )}
              >
                <span className="text-sm font-semibold">{p.name}</span>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    active.id === p.id ? "text-white/85" : "text-[#9CA3AF]"
                  )}
                >
                  {formatParticipantProgramLabel(ctx)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <ParticipantProgressPanel
          session={session}
          participantId={active.id}
          coachLookup={coachLookup}
        />
      </div>
    </div>
  );
}
