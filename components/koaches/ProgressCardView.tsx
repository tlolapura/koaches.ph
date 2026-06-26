"use client";

import { useState } from "react";
import { PartyPopper, Share2, TrendingUp } from "lucide-react";
import type { ProgressCard } from "@/lib/koaches/types";
import {
  buildSkillChanges,
  sessionProgressHeadline,
  summarizeSkillChanges,
} from "@/lib/koaches/skill-progress-display";
import { KoachesWordmark } from "@/components/koaches/coach/CoachIcons";
import { ScoreLegend, SkillProgressList } from "@/components/koaches/SkillProgressDisplay";
import { formatDate } from "@/lib/utils";

type ProgressCardViewProps = {
  card: ProgressCard;
};

export function ProgressCardView({ card }: ProgressCardViewProps) {
  const [copied, setCopied] = useState(false);
  const changes = buildSkillChanges(card.ratingsBefore, card.ratingsAfter);
  const { improvedCount } = summarizeSkillChanges(changes);
  const headline = sessionProgressHeadline(changes);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `${card.studentName}'s Progress`, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="coach-portal mx-auto min-h-screen max-w-md bg-[#FAFAF8] px-4 py-8">
      <div className="flex justify-center">
        <KoachesWordmark size="lg" />
      </div>

      <div className="coach-card mt-8 overflow-hidden p-6 shadow-sm">
        <h1 className="font-heading text-center text-[28px] font-bold text-[#16A34A]">
          {card.studentName}
        </h1>
        <p className="mt-1 text-center text-sm text-[#6B7280]">Coached by {card.coachName}</p>
        <div className="mt-4 flex justify-center">
          <span className="rounded-full bg-[#16A34A] px-4 py-1 text-sm font-semibold text-white">
            {card.programName}
          </span>
        </div>
        <p className="mt-2 text-center text-xs font-medium text-[#6B7280]">{card.programOrSession}</p>
        <p className="mt-1 text-center text-xs text-[#9CA3AF]">{formatDate(card.dateCompleted)}</p>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#E5EFE8] px-4 py-4 text-center">
          {improvedCount > 0 ? (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
              <TrendingUp className="h-5 w-5 text-[#4F8FF7]" />
            </div>
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
              <PartyPopper className="h-5 w-5 text-[#1D4ED8]" />
            </div>
          )}
          <p className="font-heading mt-2 text-lg font-bold text-[#1D4ED8]">{headline}</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            {improvedCount > 0
              ? "Here’s what moved forward this session"
              : "Solid work — consistency builds over time"}
          </p>
        </div>

        <blockquote className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
          <p className="text-sm italic text-[#1D4ED8]">&ldquo;{card.coachMessage}&rdquo;</p>
          <footer className="mt-2 text-xs font-semibold text-[#6B7280]">— {card.coachName}</footer>
        </blockquote>

        <div className="mt-6">
          <p className="font-heading text-sm font-semibold text-[#111827]">Your skills</p>
          <div className="mt-3">
            <SkillProgressList before={card.ratingsBefore} after={card.ratingsAfter} />
          </div>
          <div className="mt-3">
            <ScoreLegend />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-[#6B7280]">Powered by Koaches</p>

      <button
        type="button"
        onClick={handleShare}
        className="coach-btn-primary mt-6 flex items-center justify-center gap-2"
      >
        <Share2 className="h-5 w-5" />
        {copied ? "Link copied!" : "Share progress"}
      </button>
    </div>
  );
}
