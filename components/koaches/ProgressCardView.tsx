"use client";

import { useMemo, useRef, useState } from "react";
import { PartyPopper, Share2, TrendingUp } from "lucide-react";
import type { ProgressCard } from "@/lib/koaches/types";
import { getProgressCardRatings, formatProgressCardSessionDetail } from "@/lib/koaches/progress-cards";
import {
  buildSkillChanges,
  scoreLabel,
  scoreLabelsForSkill,
  sessionProgressHeadline,
  summarizeSkillChanges,
  type SkillChange,
} from "@/lib/koaches/skill-progress-display";
import {
  SkillLevelCompareStars,
  SkillLevelLegend,
} from "@/components/koaches/SkillProgressDisplay";
import { KoachesWordmark } from "@/components/koaches/coach/CoachIcons";
import { STORY_HEIGHT, STORY_WIDTH } from "@/components/koaches/coach/social/SocialStoryFrame";
import { exportStoryAsPng, storyPngBlob } from "@/lib/koaches/social-story-export";
import { cn } from "@/lib/utils";

type ProgressCardViewProps = {
  card: ProgressCard;
};

function SkillRatingRow({ change, leveledUp }: { change: SkillChange; leveledUp?: boolean }) {
  const [showScale, setShowScale] = useState(false);
  const scoreLabels = scoreLabelsForSkill(change.skillId, change.category);
  const beforeLabel = scoreLabel(change.before, scoreLabels);
  const afterLabel = scoreLabel(change.after, scoreLabels);
  const sameLabel = beforeLabel === afterLabel;

  return (
    <div
      className={
        leveledUp
          ? "rounded-2xl border border-[#BBF7D0] bg-gradient-to-br from-[#F0FDF4] to-white px-4 py-3.5 shadow-[0_4px_16px_rgba(22,163,74,0.08)]"
          : "rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(17,24,39,0.04)]"
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
        {sameLabel ? (
          <span className="font-medium text-[#374151]">{afterLabel}</span>
        ) : (
          <>
            <span className="text-[#93C5FD]">{beforeLabel}</span>
            {" → "}
            <span className="font-medium text-[#166534]">{afterLabel}</span>
          </>
        )}
      </p>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowScale((prev) => !prev)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-semibold",
            showScale ? "bg-[#111827] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"
          )}
        >
          {showScale ? "Hide 0-5 guide" : "View 0-5 guide"}
        </button>
      </div>

      {showScale && (
        <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-white p-2.5">
          <div className="space-y-1.5">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <p key={`${change.skillId}-${n}`} className="text-[11px] leading-snug text-[#4B5563]">
                <span className="font-semibold text-[#111827]">{n}</span> -{" "}
                {scoreLabels[n as 0 | 1 | 2 | 3 | 4 | 5]}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProgressCardView({ card }: ProgressCardViewProps) {
  const [copied, setCopied] = useState(false);
  const storyRef = useRef<HTMLDivElement | null>(null);

  const { before, after } = useMemo(() => getProgressCardRatings(card), [card]);
  const changes = useMemo(() => buildSkillChanges(before, after), [before, after]);
  const { improved, same, slipped } = useMemo(() => summarizeSkillChanges(changes), [changes]);
  const headline = sessionProgressHeadline(changes);
  const skillCount = after.length;
  const sessionDetail = formatProgressCardSessionDetail(card);
  const topHighlights = useMemo(
    () => (improved.length > 0 ? improved : same).slice(0, 4),
    [improved, same]
  );

  const handleShare = async () => {
    const node = storyRef.current;
    if (node) {
      const blob = await storyPngBlob(node);
      if (blob) {
        const fileName = `${card.studentName.replace(/\s+/g, "-").toLowerCase()}-progress.png`;
        const file = new File([blob], fileName, { type: "image/png" });
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
        if (isMobileDevice && navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `${card.studentName}'s Progress`,
            files: [file],
          });
          return;
        }
        await exportStoryAsPng(node, fileName);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      }
    }

    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareButtonLabel = copied ? "Image saved!" : "Share progress";

  const renderStoryHighlight = (change: SkillChange) => {
    const labels = scoreLabelsForSkill(change.skillId, change.category);
    const beforeText = scoreLabel(change.before, labels);
    const afterText = scoreLabel(change.after, labels);
    const summary = beforeText === afterText ? afterText : `${beforeText} -> ${afterText}`;

    return (
      <div key={`story-${change.skillId}`} className="rounded-2xl bg-[#F9FAFB] px-5 py-4">
        <p className="text-[28px] font-semibold leading-snug text-[#111827]">{change.skillName}</p>
        <p className="mt-2 text-[22px] text-[#374151]">{summary}</p>
      </div>
    );
  };

  const renderStoryContent = () => {
    if (topHighlights.length > 0) {
      return topHighlights.map((change) => renderStoryHighlight(change));
    }

    return (
      <p className="text-[24px] text-[#6B7280]">
        Great effort today — keep building session by session.
      </p>
    );
  };

  return (
    <div className="coach-portal flex min-h-dvh flex-col bg-gradient-to-b from-[#F8FAFC] via-[#FAFAF8] to-[#F9FAFB]">
      <div className="mx-auto w-full max-w-5xl flex-1 px-3 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-4 md:px-6">
        <div className="flex justify-center">
          <KoachesWordmark size="lg" />
        </div>

        <div className="coach-card mt-5 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white/95 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:mt-6 sm:p-6 md:p-7">
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

          <div className="mt-6 rounded-2xl border border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#F0FDF4] px-4 py-5 text-center">
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

          {(card.coachStrengths || card.coachToImprove || card.coachMessage) && (
            <div className="mt-5 space-y-3">
              {card.coachStrengths && (
                <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#166534]">Strengths</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{card.coachStrengths}</p>
                </div>
              )}
              {card.coachToImprove && (
                <div className="rounded-2xl border border-[#FECACA] bg-[#FFFBFB] px-4 py-3.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#B91C1C]">To improve</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{card.coachToImprove}</p>
                </div>
              )}
              {card.coachMessage && (
                <blockquote className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] px-4 py-3.5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">Coach note</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                    &ldquo;{card.coachMessage}&rdquo;
                  </p>
                  <footer className="mt-2 text-xs font-semibold text-[#9CA3AF]">— {card.coachName}</footer>
                </blockquote>
              )}
            </div>
          )}

          {skillCount > 0 && (
            <div className="mt-6 space-y-5">
              {improved.length > 0 && (
                <section className="rounded-2xl border border-[#DCFCE7] bg-[#F8FFF9] p-3 sm:p-4">
                  <h2 className="font-heading flex items-center gap-2 text-sm font-semibold text-[#166534]">
                    <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                    Leveled up ({improved.length})
                  </h2>
                  <div className="mt-2 space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
                    {improved.map((change) => (
                      <SkillRatingRow key={change.skillId} change={change} leveledUp />
                    ))}
                  </div>
                </section>
              )}

              {same.length > 0 && (
                <section className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] p-3 sm:p-4">
                  <h2 className="font-heading flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
                    <span className="h-2 w-2 rounded-full bg-[#9CA3AF]" />
                    {improved.length > 0 ? "Also worked on" : "Skills worked on"}
                    <span className="text-[#9CA3AF]">({same.length})</span>
                  </h2>
                  <div className="mt-2 space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
                    {same.map((change) => (
                      <SkillRatingRow key={change.skillId} change={change} />
                    ))}
                  </div>
                </section>
              )}

              {slipped.length > 0 && (
                <section className="rounded-2xl border border-[#FECACA] bg-[#FFFBFB] p-3 sm:p-4">
                  <h2 className="font-heading flex items-center gap-2 text-sm font-semibold text-[#B91C1C]">
                    <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                    Focus next session ({slipped.length})
                  </h2>
                  <div className="mt-2 space-y-2 md:grid md:grid-cols-2 md:gap-2 md:space-y-0">
                    {slipped.map((change) => (
                      <SkillRatingRow key={change.skillId} change={change} />
                    ))}
                  </div>
                </section>
              )}

              <SkillLevelLegend className="pt-1" />

              {improved.length === 0 && same.length === 0 && slipped.length === 0 && (
                <p className="text-center text-sm text-[#6B7280]">
                  Great effort today — keep building session by session.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="coach-btn-primary flex w-full items-center justify-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            {shareButtonLabel}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">Powered by PickleKoach</p>
      </div>

      <div className="pointer-events-none fixed -left-[9999px] -top-[9999px] opacity-0" aria-hidden>
        <div
          ref={storyRef}
          className="overflow-hidden bg-[#FAFAF8] text-[#111827]"
          style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}
        >
          <div className="flex h-full flex-col bg-gradient-to-b from-[#F8FAFC] via-[#FAFAF8] to-white p-12">
            <p className="text-[24px] font-bold uppercase tracking-[0.18em] text-[#16A34A]">Session progress</p>
            <h2 className="font-heading mt-4 text-[72px] font-bold leading-[1.05]">{card.studentName}</h2>
            <p className="mt-2 text-[30px] text-[#6B7280]">Coached by {card.coachName}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#16A34A] px-5 py-2 text-[24px] font-semibold text-white">
                {card.programName}
              </span>
              {sessionDetail ? <span className="text-[24px] text-[#6B7280]">{sessionDetail}</span> : null}
            </div>

            <div className="mt-8 rounded-3xl border border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] px-8 py-8">
              <p className="font-heading text-[48px] font-bold text-[#14532D]">{headline}</p>
              <p className="mt-2 text-[26px] text-[#6B7280]">
                {skillCount} skill{skillCount !== 1 ? "s" : ""} covered this session
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-[#E5E7EB] bg-white px-8 py-7">
              <p className="text-[20px] font-bold uppercase tracking-wide text-[#6B7280]">Highlights</p>
              <div className="mt-4 space-y-4">{renderStoryContent()}</div>
            </div>

            {(card.coachStrengths || card.coachToImprove || card.coachMessage) && (
              <div className="mt-6 space-y-4">
                {card.coachStrengths ? (
                  <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-6 py-5">
                    <p className="text-[18px] font-bold uppercase tracking-wide text-[#166534]">Strengths</p>
                    <p className="mt-2 text-[24px] leading-snug text-[#374151]">{card.coachStrengths}</p>
                  </div>
                ) : null}
                {card.coachToImprove ? (
                  <div className="rounded-2xl border border-[#FECACA] bg-[#FFFBFB] px-6 py-5">
                    <p className="text-[18px] font-bold uppercase tracking-wide text-[#B91C1C]">To improve</p>
                    <p className="mt-2 text-[24px] leading-snug text-[#374151]">{card.coachToImprove}</p>
                  </div>
                ) : null}
                {card.coachMessage ? (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#FCFCFD] px-6 py-5">
                    <p className="text-[18px] font-bold uppercase tracking-wide text-[#6B7280]">Coach note</p>
                    <p className="mt-2 text-[24px] italic leading-snug text-[#374151]">
                      &ldquo;{card.coachMessage}&rdquo;
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <p className="mt-auto text-center text-[24px] font-semibold text-[#9CA3AF]">Powered by PickleKoach</p>
          </div>
        </div>
      </div>
    </div>
  );
}
