"use client";

import { ArrowRight, Minus, Star, TrendingDown, TrendingUp } from "lucide-react";
import type { SkillRating } from "@/lib/koaches/types";
import {
  buildSkillChanges,
  scoreLabel,
  scoreLabelsForSkill,
  sessionProgressHeadline,
  summarizeSkillChanges,
  type SkillChange,
} from "@/lib/koaches/skill-progress-display";
import { cn } from "@/lib/utils";

function starRow(
  filled: number,
  variant: "before" | "after",
  highlightFrom?: number
) {
  const dim = "h-5 w-5";
  return [1, 2, 3, 4, 5].map((n) => {
    const isFilled = n <= filled;
    const isNew = variant === "after" && highlightFrom != null && n > highlightFrom && n <= filled;

    return (
      <Star
        key={n}
        className={cn(
          dim,
          isFilled
            ? variant === "after"
              ? "fill-[#16A34A] text-[#16A34A]"
              : "fill-[#BFDBFE] text-[#93C5FD]"
            : "fill-none text-[#E5E7EB]",
          isNew && "scale-110 drop-shadow-sm"
        )}
        strokeWidth={1.5}
      />
    );
  });
}

/** Side-by-side before → after stars so gains like 2→3 don’t look identical to 3→3 */
export function SkillLevelCompareStars({
  before,
  after,
  className,
}: {
  before: number;
  after: number;
  className?: string;
}) {
  const b = Math.min(5, Math.max(0, Math.round(before)));
  const a = Math.min(5, Math.max(0, Math.round(after)));

  return (
    <div
      className={cn("flex items-center justify-center gap-2.5", className)}
      role="img"
      aria-label={`Before ${b} out of 5, after ${a} out of 5`}
    >
      <div className="flex items-center gap-0.5">{starRow(b, "before")}</div>
      <ArrowRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" aria-hidden />
      <div className="flex items-center gap-0.5">{starRow(a, "after", b)}</div>
    </div>
  );
}

/** @deprecated Use SkillLevelCompareStars — overlap hid the before level */
export const SkillLevelOverlapStars = SkillLevelCompareStars;

export function SkillLevelLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-[#9CA3AF]",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 fill-[#BFDBFE] text-[#93C5FD]" strokeWidth={1.5} aria-hidden />
        Start
      </span>
      <ArrowRight className="h-3 w-3 text-[#D1D5DB]" aria-hidden />
      <span className="inline-flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 fill-[#16A34A] text-[#16A34A]" strokeWidth={1.5} aria-hidden />
        End
      </span>
    </div>
  );
}

export function SkillLevelDots({
  score,
  variant = "after",
  className,
}: {
  score: number;
  variant?: "before" | "after";
  className?: string;
}) {
  const filled = Math.min(5, Math.max(0, Math.round(score)));
  return (
    <div className={cn("flex gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={cn(
            "h-2 w-3.5 rounded-full sm:w-4",
            n <= filled
              ? variant === "after"
                ? "bg-[#16A34A]"
                : "bg-[#4F8FF7]/35"
              : "bg-[#E5E7EB]"
          )}
        />
      ))}
    </div>
  );
}

export function SkillChangeRow({ change, compact }: { change: SkillChange; compact?: boolean }) {
  const { delta, skillName, before, after } = change;
  const scoreLabels = scoreLabelsForSkill(change.skillId, change.category);

  return (
    <div className={cn("flex items-center gap-3", compact ? "py-2" : "py-2.5")}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#111827]">{skillName}</p>
        {!compact && (
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {scoreLabel(before, scoreLabels)} → {scoreLabel(after, scoreLabels)}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <SkillLevelDots score={before} variant="before" />
        <span className="text-[#D1D5DB]">→</span>
        <SkillLevelDots score={after} variant="after" />
        {delta > 0 && <TrendingUp className="h-4 w-4 text-[#22C55E]" aria-label="Improved" />}
        {delta < 0 && <TrendingDown className="h-4 w-4 text-[#EF4444]" aria-label="Needs work" />}
        {delta === 0 && <Minus className="h-4 w-4 text-[#9CA3AF]" aria-label="Same" />}
      </div>
    </div>
  );
}

export function SkillProgressList({
  before,
  after,
  compact,
  maxItems,
}: {
  before: SkillRating[];
  after: SkillRating[];
  compact?: boolean;
  maxItems?: number;
}) {
  const changes = buildSkillChanges(before, after);
  const { improved, same, slipped } = summarizeSkillChanges(changes);

  const sections = [
    { title: "Leveled up", items: improved, tone: "text-[#3D5C47]" },
    { title: "Held steady", items: same, tone: "text-[#6B7280]" },
    { title: "Focus next time", items: slipped, tone: "text-[#1D4ED8]" },
  ].filter((s) => s.items.length > 0);

  let shown = 0;

  return (
    <div className="divide-y divide-[#E5E7EB]/70">
      {sections.map((section) => {
        const remaining = maxItems != null ? maxItems - shown : undefined;
        if (remaining != null && remaining <= 0) return null;
        const items =
          remaining != null ? section.items.slice(0, remaining) : section.items;
        shown += items.length;

        return (
          <div key={section.title} className="py-2 first:pt-0 last:pb-0">
            <p className={cn("mb-1 text-[11px] font-semibold uppercase tracking-wide", section.tone)}>
              {section.title}
            </p>
            <div className="divide-y divide-[#F3F4F6]">
              {items.map((change) => (
                <SkillChangeRow key={change.skillId} change={change} compact={compact} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SessionProgressSummary({
  before,
  after,
  className,
}: {
  before: SkillRating[];
  after: SkillRating[];
  className?: string;
}) {
  const changes = buildSkillChanges(before, after);
  const headline = sessionProgressHeadline(changes);
  const topWin = changes.find((c) => c.delta > 0);

  return (
    <div className={cn("rounded-xl bg-[#F9FAFB] px-3 py-3", className)}>
      <p className="font-heading text-sm font-semibold text-[#111827]">{headline}</p>
      {topWin && (
        <p className="mt-1 text-xs text-[#6B7280]">
          Best gain: <span className="font-medium text-[#374151]">{topWin.skillName}</span>
        </p>
      )}
    </div>
  );
}

export function TopWinsList({
  before,
  after,
  limit = 3,
}: {
  before: SkillRating[];
  after: SkillRating[];
  limit?: number;
}) {
  const wins = buildSkillChanges(before, after).filter((c) => c.delta > 0).slice(0, limit);

  if (wins.length === 0) {
    return (
      <p className="text-sm text-[#6B7280]">
        Keep showing up — progress adds up session by session.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {wins.map((win) => (
        <li
          key={win.skillId}
          className="flex items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5"
        >
          <span className="text-sm font-medium text-[#111827]">{win.skillName}</span>
          <span className="shrink-0 text-xs font-semibold text-[#3D5C47]">
            {scoreLabel(
              win.before,
              scoreLabelsForSkill(win.skillId, win.category)
            )}{" "}
            →{" "}
            {scoreLabel(
              win.after,
              scoreLabelsForSkill(win.skillId, win.category)
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ScoreLegend() {
  return (
    <p className="text-[10px] text-[#9CA3AF]">
      Each dot is a level · 0 Not introduced yet → 5 Competition-ready
    </p>
  );
}

/** Compact skill row with stars — for coach progress summaries */
export function SkillWinRow({
  change,
  className,
}: {
  change: SkillChange;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111827]">{change.skillName}</p>
      </div>
      <SkillLevelCompareStars before={change.before} after={change.after} />
      {change.delta > 0 && (
        <span className="shrink-0 rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-bold text-[#166534]">
          +{change.delta}
        </span>
      )}
    </div>
  );
}
