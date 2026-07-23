"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { resolveParticipantProgress, hasRatingsForCard, filterRatedSkills, normalizeParticipantRatings, type ParticipantRatings } from "@/lib/koaches/session-progress";
import {
  buildProgressCardDraft,
  buildProgressCardUrl,
  countSkillImprovements,
  getProgressCardRatings,
  suggestSessionFeedback,
  type SessionFeedback,
} from "@/lib/koaches/progress-cards";
import { buildSkillChanges } from "@/lib/koaches/skill-progress-display";
import { useProgressCards } from "@/hooks/useProgressCards";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { getSessionParticipants } from "@/lib/koaches/session-participants";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachStepper } from "@/components/koaches/coach/CoachStepper";
import { SendProgressCardEmailButton } from "@/components/koaches/coach/SendProgressCardEmailButton";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { RadarChart, SkillComparisonTable } from "@/components/koaches/RadarChart";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

const CARD_STEPS = [
  { id: "1", label: "Review" },
  { id: "2", label: "Feedback" },
  { id: "3", label: "Preview" },
];

type GenerateProgressCardSheetProps = {
  open: boolean;
  onClose: () => void;
  session: Session;
  participantId: string;
  /** Saved ratings — use when session query may be stale after a recent save */
  ratings?: ParticipantRatings;
  onGenerated?: (cardId: string) => void;
};

export function GenerateProgressCardSheet({
  open,
  onClose,
  session,
  participantId,
  ratings: ratingsOverride,
  onGenerated,
}: GenerateProgressCardSheetProps) {
  const { showToast } = useCoachToast();
  const { saveCard } = useProgressCards(session.coachId);
  const { coach } = useCoachProfile(session.coachId);
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<SessionFeedback>({
    strengths: "",
    toImprove: "",
    generalNote: "",
  });
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const participant = getSessionParticipants(session).find((p) => p.id === participantId);
  const ratings =
    ratingsOverride && hasRatingsForCard(ratingsOverride)
      ? ratingsOverride
      : resolveParticipantProgress(session, participantId);

  const cardRatings = useMemo(() => {
    if (!hasRatingsForCard(ratings)) return null;
    const normalized = normalizeParticipantRatings(ratings);
    const before = filterRatedSkills(normalized.ratingsBefore ?? []);
    const beforeIds = new Set(before.map((skill) => skill.skillId));
    const after = filterRatedSkills(normalized.ratingsAfter ?? []).filter((skill) =>
      beforeIds.has(skill.skillId)
    );
    return { before, after };
  }, [ratings]);

  const draft = useMemo(() => {
    if (!participant || !hasRatingsForCard(ratings)) {
      return null;
    }
    return buildProgressCardDraft({
      session,
      participantId,
      feedback,
      ratings,
      lookup: coach
        ? {
            coach: {
              name: coach.name,
              firstName: coach.firstName,
              lastName: coach.lastName,
              skillTemplateId: coach.skillTemplateId,
            },
          }
        : undefined,
    });
  }, [session, participantId, participant, ratings, feedback, coach]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setFeedback({ strengths: "", toImprove: "", generalNote: "" });
    setGeneratedId(null);
  }, [open, session.id, participantId]);

  const goToFeedbackStep = () => {
    if (cardRatings) {
      setFeedback(suggestSessionFeedback(buildSkillChanges(cardRatings.before, cardRatings.after)));
    }
    setStep(2);
  };

  const handleGenerate = async () => {
    if (!draft || generating) return;
    setGenerating(true);
    try {
      await saveCard(draft);
      setGeneratedId(draft.id);
      setStep(4);
      onGenerated?.(draft.id);
      showToast("Progress card created!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not create progress card", "error");
    } finally {
      setGenerating(false);
    }
  };

  if (!participant || !draft) return null;

  const { before: cardBefore, after: cardAfter } = getProgressCardRatings(draft);
  const improved = countSkillImprovements(cardBefore, cardAfter);

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={
        step === 1
          ? "Review progress"
          : step === 2
            ? "Session feedback"
            : step === 3
              ? "Preview card"
              : "Card ready"
      }
      subtitle={
        step === 1
          ? `${participant.name} · ${draft.programOrSession}`
          : step === 2
            ? `Session feedback for ${participant.name}`
            : step === 3
              ? "Looks good? Generate the shareable card"
              : undefined
      }
      footer={
        step < 4 ? (
          <CoachSheetFooter>
            {step > 1 && (
              <CoachButton type="button" variant="outline" disabled={generating} onClick={() => setStep((s) => s - 1)}>
                Back
              </CoachButton>
            )}
            <CoachButton
              type="button"
              loading={step === 3 && generating}
              loadingLabel="Generating…"
              disabled={generating}
              onClick={() => {
                if (step === 3) void handleGenerate();
                else if (step === 1) goToFeedbackStep();
                else setStep((s) => s + 1);
              }}
            >
              {step === 3 ? "Generate card" : "Next"}
            </CoachButton>
          </CoachSheetFooter>
        ) : (
          <CoachSheetFooter>
            <Link href={`/progress/${generatedId}`} className="coach-btn-primary text-center">
              View card
            </Link>
            {generatedId ? <SendProgressCardEmailButton cardId={generatedId} /> : null}
            <button
              type="button"
              className="coach-btn-outline"
              onClick={() => {
                if (generatedId) {
                  navigator.clipboard.writeText(buildProgressCardUrl(generatedId));
                  showToast("Link copied!");
                }
              }}
            >
              Copy link
            </button>
          </CoachSheetFooter>
        )
      }
    >
      {step < 4 && (
        <CoachStepper
          card={false}
          variant="compact"
          steps={CARD_STEPS}
          currentStepId={String(step)}
          className="mb-4"
        />
      )}

      {step === 1 && (
        <div className="space-y-4">
          <RadarChart before={cardBefore} after={cardAfter} height={240} compact />
          <SkillComparisonTable before={cardBefore} after={cardAfter} />
          <p className="text-center text-sm font-medium text-[#374151]">
            Improved in {improved} of {cardAfter.length} skills covered
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <CoachSheetField label="Strengths" htmlFor="progress-card-strengths">
            <textarea
              id="progress-card-strengths"
              className="coach-input min-h-[100px] resize-none"
              placeholder="What stood out today?"
              value={feedback.strengths}
              onChange={(e) => setFeedback((f) => ({ ...f, strengths: e.target.value }))}
            />
          </CoachSheetField>
          <CoachSheetField label="To improve" htmlFor="progress-card-improve">
            <textarea
              id="progress-card-improve"
              className="coach-input min-h-[100px] resize-none"
              placeholder="What to work on next session?"
              value={feedback.toImprove}
              onChange={(e) => setFeedback((f) => ({ ...f, toImprove: e.target.value }))}
            />
          </CoachSheetField>
          <CoachSheetField label="General note" htmlFor="progress-card-note">
            <textarea
              id="progress-card-note"
              className="coach-input min-h-[100px] resize-none"
              placeholder={`Encouragement or anything else for ${participant.name}`}
              value={feedback.generalNote}
              onChange={(e) => setFeedback((f) => ({ ...f, generalNote: e.target.value }))}
            />
          </CoachSheetField>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center">
          <p className="font-heading text-lg font-bold text-[#14532D]">{draft.studentName}</p>
          <p className="text-sm text-[#6B7280]">Coached by {draft.coachName}</p>
          <span className="mt-3 inline-block rounded-full bg-[#16A34A] px-3 py-1 text-xs font-semibold text-white">
            {draft.programOrSession}
          </span>
          <div className="mt-4">
            <RadarChart before={cardBefore} after={cardAfter} height={200} compact />
          </div>
          <div className="mt-4 space-y-3 text-left">
            {feedback.strengths.trim() && (
              <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#166534]">Strengths</p>
                <p className="mt-1 text-sm text-[#374151]">{feedback.strengths.trim()}</p>
              </div>
            )}
            {feedback.toImprove.trim() && (
              <div className="rounded-xl border border-[#FECACA] bg-[#FFFBFB] px-3 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#B91C1C]">To improve</p>
                <p className="mt-1 text-sm text-[#374151]">{feedback.toImprove.trim()}</p>
              </div>
            )}
            {feedback.generalNote.trim() && (
              <blockquote className="border-l-4 border-[#14532D] pl-3">
                <p className="text-sm italic text-[#14532D]">&ldquo;{feedback.generalNote.trim()}&rdquo;</p>
              </blockquote>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4]">
            <PartyPopper className="h-7 w-7 text-[#166534]" />
          </div>
          <p className="font-heading text-lg font-semibold">Progress card generated</p>
          <p className="text-sm text-[#6B7280]">
            Share the link with {participant.name}. They can view it without logging in.
          </p>
        </div>
      )}
    </CoachBottomSheet>
  );
}
