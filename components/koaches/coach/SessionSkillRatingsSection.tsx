"use client";

import { useMemo, useState } from "react";
import type { Session } from "@/lib/koaches/types";
import { getSessionParticipants } from "@/lib/koaches/session-participants";
import {
  formatParticipantProgramLabel,
  resolveParticipantProgramContext,
} from "@/lib/koaches/participant-program";
import { filterRatedSkills } from "@/lib/koaches/session-progress";
import { buildProgressCardDraft, findProgressCardForSession } from "@/lib/koaches/progress-cards";
import { useParticipantProgress } from "@/hooks/useParticipantProgress";
import { useProgressCards } from "@/hooks/useProgressCards";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { SkillRatingPanel, type SkillRatingActions } from "@/components/koaches/coach/SkillRatingPanel";
import { cn } from "@/lib/utils";
import type { SessionDetailStep, SessionRatingStep } from "@/lib/koaches/session-detail-steps";

type SessionSkillRatingsSectionProps = {
  session: Session;
  step: SessionRatingStep;
  onStepChange: (step: SessionDetailStep) => void;
  onRatingActionsChange?: (actions: SkillRatingActions | null) => void;
};

function ParticipantProgressPanel({
  session,
  participantId,
  step,
  onStepChange,
  onRatingActionsChange,
  coachLookup: coachLookupProp,
}: {
  session: Session;
  participantId: string;
  step: SessionRatingStep;
  onStepChange: (step: SessionDetailStep) => void;
  onRatingActionsChange?: (actions: SkillRatingActions | null) => void;
  coachLookup?: Parameters<typeof resolveParticipantProgramContext>[2];
}) {
  const participants = getSessionParticipants(session);
  const participant = participants.find((p) => p.id === participantId)!;
  const ctx = resolveParticipantProgramContext(participant, session, coachLookupProp);
  const { ratings, saveRatings } = useParticipantProgress(session, participant.id);
  const { cards, saveCard } = useProgressCards(session.coachId);
  const { coach } = useCoachProfile(session.coachId);

  const existingCard = participant.studentId
    ? findProgressCardForSession(cards, session.id, participant.studentId)
    : undefined;

  const progressCardLookup = coach
    ? {
        coach: {
          name: coach.name,
          firstName: coach.firstName,
          lastName: coach.lastName,
          skillTemplateId: coach.skillTemplateId,
        },
      }
    : undefined;

  return (
    <SkillRatingPanel
      key={`${participant.id}-${ctx.rubricId}`}
      step={step}
      onStepChange={onStepChange}
      onActionsChange={onRatingActionsChange}
      participantName={participant.name}
      initialBefore={ratings.ratingsBefore}
      initialAfter={ratings.ratingsAfter}
      rubricId={ctx.rubricId}
      customSkillIds={ctx.customSkillIds}
      customSkills={ctx.customSkills}
      skillLabelOverrides={ctx.skillLabelOverrides}
      sessionNumber={ctx.sessionNumber}
      totalSessions={ctx.totalSessions}
      initialFeedback={{
        strengths: existingCard?.coachStrengths ?? "",
        toImprove: existingCard?.coachToImprove ?? "",
        generalNote: existingCard?.coachMessage ?? "",
      }}
      onSave={async (before, after, feedback) => {
        await saveRatings({ ratingsBefore: before, ratingsAfter: after });

        if (!participant.studentId) {
          return;
        }

        const card = existingCard
          ? {
              ...existingCard,
              ratingsBefore: filterRatedSkills(before),
              ratingsAfter: filterRatedSkills(after),
              coachStrengths: feedback.strengths.trim() || undefined,
              coachToImprove: feedback.toImprove.trim() || undefined,
              coachMessage: feedback.generalNote.trim(),
            }
          : buildProgressCardDraft({
              session,
              participantId: participant.id,
              feedback,
              ratings: { ratingsBefore: before, ratingsAfter: after },
              lookup: progressCardLookup,
            });

        return saveCard(card);
      }}
    />
  );
}

export function SessionSkillRatingsSection({
  session,
  step,
  onStepChange,
  onRatingActionsChange,
}: SessionSkillRatingsSectionProps) {
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
    <div>
      {participants.length > 1 && (
        <>
          <p className="text-sm font-medium text-[#374151]">Player</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
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
        </>
      )}

      <div className={participants.length > 1 ? "mt-4" : undefined}>
        <ParticipantProgressPanel
          session={session}
          participantId={active.id}
          step={step}
          onStepChange={onStepChange}
          onRatingActionsChange={onRatingActionsChange}
          coachLookup={coachLookup}
        />
      </div>
    </div>
  );
}
