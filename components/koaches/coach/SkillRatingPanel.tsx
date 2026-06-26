"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, TrendingUp } from "lucide-react";
import {
  ALL_SKILL_CATEGORIES,
  categoryAverages,
  getSkillsForRubric,
  SKILL_CATEGORY_LABELS,
} from "@/lib/koaches/constants";
import type { SkillCategory, SkillRating, SkillRubricId } from "@/lib/koaches/types";
import { RadarChart } from "@/components/koaches/RadarChart";
import { cn } from "@/lib/utils";

type SkillRatingPanelProps = {
  initialBefore?: SkillRating[];
  initialAfter?: SkillRating[];
  rubricId?: SkillRubricId;
  /** @deprecated Use rubricId */
  templateId?: SkillRubricId;
  customSkillIds?: string[];
  sessionNumber?: number;
  totalSessions?: number;
  phaseLabel?: string;
  onSave?: (before: SkillRating[], after: SkillRating[]) => void;
};

function defaultRatings(rubricId: SkillRubricId, customSkillIds?: string[]): SkillRating[] {
  return getSkillsForRubric(rubricId, customSkillIds).map((s) => ({
    skillId: s.id,
    skillName: s.name,
    category: s.category,
    score: 3,
  }));
}

function ScorePills({
  value,
  onChange,
  tone,
}: {
  value: number;
  onChange: (score: number) => void;
  tone: "start" | "now";
}) {
  return (
    <div className="flex gap-1" role="group">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Score ${n}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={cn(
            "h-9 min-w-[2rem] flex-1 rounded-lg text-sm font-bold transition-colors max-w-[2.75rem]",
            tone === "start"
              ? value === n
                ? "bg-[#1E3A5F] text-white shadow-sm"
                : "border border-[#1E3A5F]/25 bg-white text-[#1E3A5F]"
              : value === n
                ? "bg-[#E07A5F] text-white shadow-sm"
                : "border border-[#E5E7EB] bg-white text-[#9CA3AF]"
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function SkillRatingRow({
  skillName,
  beforeScore,
  afterScore,
  onBefore,
  onAfter,
}: {
  skillName: string;
  beforeScore: number;
  afterScore: number;
  onBefore: (n: number) => void;
  onAfter: (n: number) => void;
}) {
  const delta = afterScore - beforeScore;

  return (
    <div className="border-b border-[#F3F4F6] py-3 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[#111827] leading-snug">{skillName}</p>
        {delta !== 0 && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
              delta > 0 ? "bg-[#E5EFE8] text-[#3D5C47]" : "bg-[#FEE2E2] text-[#B91C1C]"
            )}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      <div className="mt-2.5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Start
          </span>
          <ScorePills value={beforeScore} onChange={onBefore} tone="start" />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#E07A5F]">
            Now
          </span>
          <ScorePills value={afterScore} onChange={onAfter} tone="now" />
        </div>
      </div>
    </div>
  );
}

export function SkillRatingPanel({
  initialBefore,
  initialAfter,
  rubricId,
  templateId,
  customSkillIds,
  sessionNumber,
  totalSessions,
  phaseLabel,
  onSave,
}: SkillRatingPanelProps) {
  const activeRubric = rubricId ?? templateId ?? "intermediate";
  const [before, setBefore] = useState<SkillRating[]>(
    initialBefore ?? defaultRatings(activeRubric, customSkillIds)
  );
  const [after, setAfter] = useState<SkillRating[]>(
    initialAfter ?? defaultRatings(activeRubric, customSkillIds)
  );

  const visibleCategories = useMemo(() => {
    const cats = getSkillsForRubric(activeRubric, customSkillIds).map((s) => s.category);
    return [...new Set(cats)];
  }, [activeRubric, customSkillIds]);

  const [activeCategory, setActiveCategory] = useState<SkillCategory>(
    () => visibleCategories[0] ?? "fundamentals"
  );

  const isDay1 = sessionNumber === 1;
  const isFinal = totalSessions != null && sessionNumber === totalSessions;
  const sessionHint = isDay1
    ? "Start = baseline before you coach · Now = after today"
    : isFinal
      ? "Start = where they began · Now = final session"
      : phaseLabel
        ? `Start & now for ${phaseLabel.toLowerCase()}`
        : "Start = beginning of session · Now = after you coach";

  const skillsInCategory = useMemo(
    () => before.filter((s) => s.category === activeCategory),
    [before, activeCategory]
  );

  const stats = useMemo(() => {
    let improved = 0;
    let totalDelta = 0;
    for (const b of before) {
      const a = after.find((x) => x.skillId === b.skillId);
      const diff = (a?.score ?? b.score) - b.score;
      if (diff > 0) improved++;
      totalDelta += diff;
    }
    const beforeAvg =
      categoryAverages(before).reduce((sum, c) => sum + c.score, 0) /
      Math.max(1, categoryAverages(before).length);
    const afterAvg =
      categoryAverages(after).reduce((sum, c) => sum + c.score, 0) /
      Math.max(1, categoryAverages(after).length);
    return { improved, avgShift: afterAvg - beforeAvg, totalSkills: before.length };
  }, [before, after]);

  const setBeforeScore = (skillId: string, score: number) => {
    setBefore((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, score } : s)));
  };

  const setAfterScore = (skillId: string, score: number) => {
    setAfter((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, score } : s)));
  };

  const copyStartToNow = () => {
    setAfter(before.map((b) => ({ ...b })));
  };

  return (
    <div className="space-y-4">
      <div className="coach-card overflow-hidden p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-heading text-sm font-semibold text-[#111827]">Progress snapshot</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{sessionHint}</p>
          </div>
          {stats.improved > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-[#E5EFE8] px-2.5 py-1 text-[11px] font-semibold text-[#3D5C47]">
              <TrendingUp className="h-3.5 w-3.5" />
              {stats.improved} up
            </div>
          )}
        </div>
        <div className="mt-3">
          <RadarChart before={before} after={after} height={200} compact />
        </div>
        <div className="mt-2 flex justify-center gap-4 text-[10px] font-medium text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-[#1E3A5F]" />
            Start
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-[#E07A5F]/40 ring-1 ring-[#E07A5F]" />
            Now
          </span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {ALL_SKILL_CATEGORIES.filter((c) => visibleCategories.includes(c)).map((cat) => {
          const count = before.filter((s) => s.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "font-heading shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold min-h-[36px] transition-colors",
                activeCategory === cat
                  ? "bg-[#1E3A5F] text-white"
                  : "bg-white text-[#6B7280] ring-1 ring-[#E5E7EB]"
              )}
            >
              {SKILL_CATEGORY_LABELS[cat]}
              <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="coach-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-heading text-sm font-semibold">{SKILL_CATEGORY_LABELS[activeCategory]}</p>
          <button
            type="button"
            onClick={copyStartToNow}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#E07A5F]"
          >
            Copy Start <ArrowRight className="h-3 w-3" /> Now
          </button>
        </div>

        {skillsInCategory.map((skill) => {
          const afterSkill = after.find((a) => a.skillId === skill.skillId)!;
          return (
            <SkillRatingRow
              key={skill.skillId}
              skillName={skill.skillName}
              beforeScore={skill.score}
              afterScore={afterSkill.score}
              onBefore={(n) => setBeforeScore(skill.skillId, n)}
              onAfter={(n) => setAfterScore(skill.skillId, n)}
            />
          );
        })}

        <div className="mt-4 border-t border-[#E5E7EB] pt-4">
          <button
            type="button"
            className="coach-btn-soft"
            onClick={() => onSave?.(before, after)}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Save ratings
          </button>
        </div>
      </div>
    </div>
  );
}
