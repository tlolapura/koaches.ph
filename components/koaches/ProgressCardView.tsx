"use client";

import { useMemo, useState } from "react";
import { PartyPopper, Share2, TrendingUp } from "lucide-react";
import type { ProgressCard } from "@/lib/koaches/types";
import { getProgressCardRatings, formatProgressCardSessionDetail } from "@/lib/koaches/progress-cards";
import {
  buildSkillChanges,
  scoreLabel,
  sessionProgressHeadline,
  summarizeSkillChanges,
  type SkillChange,
} from "@/lib/koaches/skill-progress-display";
import {
  SkillLevelCompareStars,
  SkillLevelLegend,
} from "@/components/koaches/SkillProgressDisplay";
import { KoachesWordmark } from "@/components/koaches/coach/CoachIcons";

type ProgressCardViewProps = {
  card: ProgressCard;
};

function SkillRatingRow({ change, leveledUp }: { change: SkillChange; leveledUp?: boolean }) {
  return (
    <div
      className={
        leveledUp
          ? "rounded-xl bg-[#F0FDF4] px-4 py-3.5"
          : "rounded-xl border border-[#E5E7EB] bg-white px-4 py-3.5"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-[#111827]">{change.skillName}</p>
        {change.delta > 0 && (
          <span className="shrink-0 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#166534]">
            +{change.delta}
          </span>
        )}
      </div>

      <SkillLevelCompareStars
        before={change.before}
        after={change.after}
        className="mt-3"
      />

      <p className="mt-2 text-center text-xs text-[#6B7280]">
        <span className="text-[#93C5FD]">{scoreLabel(change.before)}</span>
        {" → "}
        <span className="font-medium text-[#166534]">{scoreLabel(change.after)}</span>
      </p>
    </div>
  );
}

export function ProgressCardView({ card }: ProgressCardViewProps) {
  const [copied, setCopied] = useState(false);

  const { before, after } = useMemo(() => getProgressCardRatings(card), [card]);
  const changes = useMemo(() => buildSkillChanges(before, after), [before, after]);
  const { improved, same } = useMemo(() => summarizeSkillChanges(changes), [changes]);
  const headline = sessionProgressHeadline(changes);
  const skillCount = after.length;
  const sessionDetail = formatProgressCardSessionDetail(card);

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
    <div className="coach-portal flex min-h-dvh flex-col bg-[#FAFAF8]">
      <div className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="flex justify-center">
          <KoachesWordmark size="lg" />
        </div>

        <div className="coach-card mt-6 overflow-hidden p-5 shadow-sm sm:p-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#16A34A]">
              Session progress
            </p>
            <h1 className="font-heading mt-1 text-[26px] font-bold leading-tight text-[#111827]">
              {card.studentName}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">Coached by {card.coachName}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-[#16A34A] px-3 py-1 text-xs font-semibold text-white">
                {card.programName}
              </span>
              {sessionDetail && (
                <span className="text-xs font-medium text-[#6B7280]">{sessionDetail}</span>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] px-4 py-5 text-center">
            {improved.length > 0 ? (
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm">
                <TrendingUp className="h-5 w-5 text-[#16A34A]" />
              </div>
            ) : (
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-sm">
                <PartyPopper className="h-5 w-5 text-[#2563EB]" />
              </div>
            )}
            <p className="font-heading mt-3 text-xl font-bold text-[#14532D]">{headline}</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {skillCount} skill{skillCount !== 1 ? "s" : ""} covered this session
            </p>
          </div>

          {card.coachMessage && (
            <blockquote className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5">
              <p className="text-sm leading-relaxed text-[#374151]">
                &ldquo;{card.coachMessage}&rdquo;
              </p>
              <footer className="mt-2 text-xs font-semibold text-[#9CA3AF]">— {card.coachName}</footer>
            </blockquote>
          )}

          {skillCount > 0 && (
            <div className="mt-6 space-y-5">
              {improved.length > 0 && (
                <section>
                  <h2 className="font-heading text-sm font-semibold text-[#166534]">Leveled up</h2>
                  <div className="mt-2 space-y-2">
                    {improved.map((change) => (
                      <SkillRatingRow key={change.skillId} change={change} leveledUp />
                    ))}
                  </div>
                </section>
              )}

              {same.length > 0 && (
                <section>
                  <h2 className="font-heading text-sm font-semibold text-[#6B7280]">
                    {improved.length > 0 ? "Also worked on" : "Skills covered"}
                  </h2>
                  <div className="mt-2 space-y-2">
                    {same.map((change) => (
                      <SkillRatingRow key={change.skillId} change={change} />
                    ))}
                  </div>
                </section>
              )}

              <SkillLevelLegend className="pt-1" />

              {improved.length === 0 && same.length === 0 && (
                <p className="text-center text-sm text-[#6B7280]">
                  Great effort today — keep building session by session.
                </p>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">Powered by PickleKoach</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="coach-btn-primary flex w-full items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            {copied ? "Link copied!" : "Share progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
