"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { resolveParticipantProgress } from "@/lib/koaches/session-progress";
import {
  buildProgressCardDraft,
  buildProgressCardUrl,
  countSkillImprovements,
} from "@/lib/koaches/progress-cards";
import { useProgressCards } from "@/hooks/useProgressCards";
import { getSessionParticipants } from "@/lib/koaches/session-participants";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { RadarChart, SkillComparisonTable } from "@/components/koaches/RadarChart";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

type GenerateProgressCardSheetProps = {
  open: boolean;
  onClose: () => void;
  session: Session;
  participantId: string;
  onGenerated?: (cardId: string) => void;
};

export function GenerateProgressCardSheet({
  open,
  onClose,
  session,
  participantId,
  onGenerated,
}: GenerateProgressCardSheetProps) {
  const { showToast } = useCoachToast();
  const { saveCard } = useProgressCards(session.coachId);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const participant = getSessionParticipants(session).find((p) => p.id === participantId);
  const ratings = resolveParticipantProgress(session, participantId);

  const draft = useMemo(() => {
    if (!participant || !ratings.ratingsBefore?.length || !ratings.ratingsAfter?.length) {
      return null;
    }
    return buildProgressCardDraft({
      session,
      participantId,
      coachMessage: message.trim() || "Great work today — keep it up!",
      ratings,
    });
  }, [session, participantId, participant, ratings, message]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setMessage("");
    setGeneratedId(null);
  }, [open, session.id, participantId]);

  const handleGenerate = async () => {
    if (!draft) return;
    try {
      await saveCard(draft);
      setGeneratedId(draft.id);
      setStep(4);
      onGenerated?.(draft.id);
      showToast("Progress card created!");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not create progress card", "error");
    }
  };

  if (!participant || !draft) return null;

  const improved = countSkillImprovements(draft.ratingsBefore, draft.ratingsAfter);

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={
        step === 1
          ? "Review progress"
          : step === 2
            ? "Coach message"
            : step === 3
              ? "Preview card"
              : "Card ready"
      }
      subtitle={
        step === 1
          ? `${participant.name} · ${draft.programOrSession}`
          : step === 2
            ? `A short note for ${participant.name}`
            : step === 3
              ? "Looks good? Generate the shareable card"
              : undefined
      }
      footer={
        step < 4 ? (
          <CoachSheetFooter>
            {step > 1 && (
              <button type="button" className="coach-btn-outline" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            <button
              type="button"
              className="coach-btn-primary"
              onClick={() => {
                if (step === 3) handleGenerate();
                else setStep((s) => s + 1);
              }}
            >
              {step === 3 ? "Generate card" : "Next"}
            </button>
          </CoachSheetFooter>
        ) : (
          <CoachSheetFooter>
            <Link href={`/progress/${generatedId}`} className="coach-btn-primary text-center">
              View card
            </Link>
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
      {step === 1 && (
        <div className="space-y-4">
          <RadarChart before={draft.ratingsBefore} after={draft.ratingsAfter} height={240} compact />
          <SkillComparisonTable before={draft.ratingsBefore} after={draft.ratingsAfter} />
          <p className="text-center text-sm font-medium text-[#374151]">
            Improved in {improved} of {draft.ratingsAfter.length} skills
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <CoachSheetField label="Personal message" htmlFor="progress-card-message">
            <textarea
              id="progress-card-message"
              className="coach-input min-h-[140px] resize-none"
              placeholder={`e.g. ${participant.name}, your improvement today was awesome…`}
              maxLength={280}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </CoachSheetField>
          <p className="text-right text-xs text-[#6B7280]">{message.length}/280</p>
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
            <RadarChart before={draft.ratingsBefore} after={draft.ratingsAfter} height={200} compact />
          </div>
          <blockquote className="mt-4 border-l-4 border-[#14532D] pl-3 text-left">
            <p className="text-sm italic text-[#14532D]">
              &ldquo;{message.trim() || "Great work today — keep it up!"}&rdquo;
            </p>
          </blockquote>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 py-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4]">
            <PartyPopper className="h-7 w-7 text-[#166534]" />
          </div>
          <p className="font-heading text-lg font-semibold">Progress card generated</p>
          <p className="text-sm text-[#6B7280]">
            Share the link with {participant.name} — they can view it without logging in.
          </p>
        </div>
      )}
    </CoachBottomSheet>
  );
}
