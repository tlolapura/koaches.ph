"use client";

import { useCallback, useMemo, useState } from "react";
import type { Session } from "@/lib/koaches/types";
import { getSessionParticipants } from "@/lib/koaches/session-participants";
import {
  formatParticipantProgramLabel,
  resolveParticipantProgramContext,
  type ParticipantProgramContext,
} from "@/lib/koaches/participant-program";
import {
  filterRatedSkills,
  hasRatingsForCard,
  resolveParticipantProgress,
} from "@/lib/koaches/session-progress";
import { buildProgressCardDraft, findProgressCardForSession } from "@/lib/koaches/progress-cards";
import { useParticipantProgress } from "@/hooks/useParticipantProgress";
import { useProgressCards } from "@/hooks/useProgressCards";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { SkillRatingPanel, type SkillRatingActions } from "@/components/koaches/coach/SkillRatingPanel";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";
import type { SessionDetailStep, SessionRatingStep } from "@/lib/koaches/session-detail-steps";
import { resolveSkills } from "@/lib/koaches/constants";

function lessonSetKey(ctx: ParticipantProgramContext): string {
  return resolveSkills({
    rubricId: ctx.rubricId,
    customSkillIds: ctx.customSkillIds,
    customSkills: ctx.customSkills,
    skillLabelOverrides: ctx.skillLabelOverrides,
  })
    .map((skill) => skill.id)
    .sort()
    .join("|");
}

type SessionSkillRatingsSectionProps = {
  session: Session;
  step: SessionRatingStep;
  onStepChange: (step: SessionDetailStep) => void;
  onRatingActionsChange?: (actions: SkillRatingActions | null) => void;
};

function firstUnratedParticipantId(session: Session, participantIds: string[]): string {
  const unrated = participantIds.find(
    (id) => !hasRatingsForCard(resolveParticipantProgress(session, id))
  );
  return unrated ?? participantIds[0] ?? "";
}

function nextUnratedParticipantId(
  session: Session,
  participantIds: string[],
  afterId: string
): string | null {
  const start = participantIds.findIndex((id) => id === afterId);
  const ordered =
    start < 0
      ? participantIds
      : [...participantIds.slice(start + 1), ...participantIds.slice(0, start)];

  for (const id of ordered) {
    if (!hasRatingsForCard(resolveParticipantProgress(session, id))) return id;
  }
  return null;
}

function ParticipantProgressPanel({
  session,
  participantId,
  step,
  onStepChange,
  onRatingActionsChange,
  coachLookup: coachLookupProp,
  copyCoveredSkillIds,
  copyCoveredFromName,
  onCoverageSaved,
}: {
  session: Session;
  participantId: string;
  step: SessionRatingStep;
  onStepChange: (step: SessionDetailStep) => void;
  onRatingActionsChange?: (actions: SkillRatingActions | null) => void;
  coachLookup?: Parameters<typeof resolveParticipantProgramContext>[2];
  copyCoveredSkillIds?: string[];
  copyCoveredFromName?: string;
  onCoverageSaved?: (skillIds: string[]) => void;
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
      copyCoveredSkillIds={copyCoveredSkillIds}
      copyCoveredFromName={copyCoveredFromName}
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
        onCoverageSaved?.(
          before.filter((skill) => skill.skipped === false).map((skill) => skill.skillId)
        );

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
  const participantIds = useMemo(() => participants.map((p) => p.id), [participants]);
  const [activeId, setActiveId] = useState(() =>
    firstUnratedParticipantId(session, participantIds)
  );
  const { coach } = useCoachProfile(session.coachId);
  const { showToast } = useCoachToast();

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

  const [savedCoverageByLessonSet, setSavedCoverageByLessonSet] = useState<
    Record<string, { skillIds: string[]; fromId: string; fromName: string }>
  >({});

  const coverageSourceByLessonSet = useMemo(() => {
    const coverage = new Map<
      string,
      { skillIds: string[]; fromId: string; fromName: string }
    >();
    for (const participant of participants) {
      const ctx = contexts.get(participant.id);
      if (!ctx) continue;
      const key = lessonSetKey(ctx);
      const saved = savedCoverageByLessonSet[key];
      if (saved && !coverage.has(key)) {
        coverage.set(key, saved);
        continue;
      }
      const covered = filterRatedSkills(
        resolveParticipantProgress(session, participant.id).ratingsBefore ?? []
      ).map((skill) => skill.skillId);
      if (covered.length > 0 && !coverage.has(key)) {
        coverage.set(key, {
          skillIds: covered,
          fromId: participant.id,
          fromName: participant.name,
        });
      }
    }
    return coverage;
  }, [contexts, participants, savedCoverageByLessonSet, session]);

  const active = participants.find((p) => p.id === activeId) ?? participants[0];
  const activeContext = active ? contexts.get(active.id) : undefined;
  const activeLessonSetKey = activeContext ? lessonSetKey(activeContext) : "";
  const copySource =
    active && activeLessonSetKey
      ? coverageSourceByLessonSet.get(activeLessonSetKey)
      : undefined;
  /** Don't offer copy from the same player currently being rated. */
  const copyCoveredFromOther =
    copySource && copySource.fromId !== active?.id ? copySource : undefined;

  const nextUnratedId = active
    ? nextUnratedParticipantId(session, participantIds, active.id)
    : null;

  const handleStepChange = useCallback(
    (next: SessionDetailStep) => {
      if (next !== "complete" || !active) {
        onStepChange(next);
        return;
      }

      // Treat the player we just saved as rated even if cache hasn't refreshed yet.
      const remaining = participantIds.filter((id) => {
        if (id === active.id) return false;
        return !hasRatingsForCard(resolveParticipantProgress(session, id));
      });
      const nextPlayerId = remaining[0] ?? null;

      if (nextPlayerId) {
        const nextPlayer = participants.find((p) => p.id === nextPlayerId);
        setActiveId(nextPlayerId);
        onStepChange("coverage");
        showToast(
          nextPlayer
            ? `${active.name} saved — now rate ${nextPlayer.name}`
            : "Player saved — rate the next player"
        );
        return;
      }

      onStepChange("complete");
    },
    [active, onStepChange, participantIds, participants, session, showToast]
  );

  const handleRatingActionsChange = useCallback(
    (actions: SkillRatingActions | null) => {
      if (!actions) {
        onRatingActionsChange?.(null);
        return;
      }
      onRatingActionsChange?.({
        ...actions,
        saveLabel: nextUnratedId ? "Save & rate next" : "Save session",
      });
    },
    [nextUnratedId, onRatingActionsChange]
  );

  if (participants.length === 0) return null;

  return (
    <div>
      {participants.length > 1 && (
        <>
          <p className="text-sm font-medium text-[#374151]">Player</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {participants.map((p) => {
              const ctx = contexts.get(p.id)!;
              const rated = hasRatingsForCard(resolveParticipantProgress(session, p.id));
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActiveId(p.id);
                    if (step !== "coverage") onStepChange("coverage");
                  }}
                  className={cn(
                    "font-heading flex shrink-0 flex-col items-start rounded-2xl px-4 py-2.5 text-left min-h-[44px] transition-all",
                    active.id === p.id
                      ? "bg-[#16A34A] text-white shadow-sm"
                      : "border border-[#E5E7EB] bg-white text-[#374151]"
                  )}
                >
                  <span className="text-sm font-semibold">
                    {p.name}
                    {rated ? " · Done" : ""}
                  </span>
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
          onStepChange={handleStepChange}
          onRatingActionsChange={handleRatingActionsChange}
          coachLookup={coachLookup}
          copyCoveredSkillIds={copyCoveredFromOther?.skillIds}
          copyCoveredFromName={copyCoveredFromOther?.fromName}
          onCoverageSaved={(skillIds) => {
            if (!activeLessonSetKey || !active) return;
            setSavedCoverageByLessonSet((current) => ({
              ...current,
              [activeLessonSetKey]: {
                skillIds,
                fromId: active.id,
                fromName: active.name,
              },
            }));
          }}
        />
      </div>
    </div>
  );
}
