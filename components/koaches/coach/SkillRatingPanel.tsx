"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  ALL_SKILL_CATEGORIES,
  getSkillsForRubric,
  resolveSkills,
  SKILL_CATEGORY_LABELS,
} from "@/lib/koaches/constants";
import { SKILL_SCORE_LABELS, scoreLabel } from "@/lib/koaches/skill-progress-display";
import type { SkillCategory, SkillRating, SkillRubricId } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

type SkillRatingPanelProps = {
  initialBefore?: SkillRating[];
  initialAfter?: SkillRating[];
  rubricId?: SkillRubricId;
  /** @deprecated Use rubricId */
  templateId?: SkillRubricId;
  customSkillIds?: string[];
  customSkills?: import("@/lib/koaches/types").SkillDefinition[];
  skillLabelOverrides?: Record<string, string>;
  sessionNumber?: number;
  totalSessions?: number;
  phaseLabel?: string;
  onSave?: (before: SkillRating[], after: SkillRating[]) => void | Promise<void>;
};

function defaultRatings(
  rubricId: SkillRubricId,
  customSkillIds?: string[],
  customSkills?: import("@/lib/koaches/types").SkillDefinition[],
  skillLabelOverrides?: Record<string, string>
): SkillRating[] {
  return resolveSkills({ rubricId, customSkillIds, customSkills, skillLabelOverrides }).map((s) => ({
    skillId: s.id,
    skillName: s.name,
    category: s.category,
    score: 3,
  }));
}

function ScorePicker({
  value,
  onChange,
  tone,
  label,
}: {
  value: number;
  onChange: (score: number) => void;
  tone: "start" | "after";
  label: string;
}) {
  const selected =
    tone === "start"
      ? "border-[#14532D] bg-[#14532D] text-white"
      : "border-[#16A34A] bg-[#16A34A] text-white";
  const idle =
    tone === "start"
      ? "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#14532D]/50 hover:bg-[#F0FDF4]"
      : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#16A34A]/50 hover:bg-[#F0FDF4]";

  return (
    <div>
      <p
        className={cn(
          "text-xs font-semibold",
          tone === "start" ? "text-[#6B7280]" : "text-[#166534]"
        )}
      >
        {label}
      </p>
      <div className="mt-1.5 flex gap-1" role="group" aria-label={label}>
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}, ${SKILL_SCORE_LABELS[n]}`}
            aria-pressed={value === n}
            onClick={() => onChange(n)}
            className={cn(
              "flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all active:scale-[0.98]",
              value === n ? selected : idle
            )}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[11px] font-medium text-[#9CA3AF]">{scoreLabel(value)}</p>
    </div>
  );
}

function SkillRatingRow({
  skillName,
  beforeScore,
  afterScore,
  skipped,
  onBefore,
  onAfter,
  onToggleSkipped,
}: {
  skillName: string;
  beforeScore: number;
  afterScore: number;
  skipped: boolean;
  onBefore: (n: number) => void;
  onAfter: (n: number) => void;
  onToggleSkipped: (skipped: boolean) => void;
}) {
  const delta = afterScore - beforeScore;

  if (skipped) {
    return (
      <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-3.5">
        <p className="text-sm font-medium text-[#9CA3AF]">{skillName}</p>
        <button
          type="button"
          onClick={() => onToggleSkipped(false)}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#BFDBFE] bg-white px-4 text-sm font-semibold text-[#2563EB] active:bg-[#EFF6FF]"
        >
          Rate this skill
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-[#111827]">{skillName}</p>
        {delta !== 0 && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
              delta > 0 ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#B91C1C]"
            )}
          >
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-3">
        <ScorePicker
          value={beforeScore}
          onChange={onBefore}
          tone="start"
          label="Before"
        />
        <ScorePicker
          value={afterScore}
          onChange={onAfter}
          tone="after"
          label="After"
        />
      </div>
      <button
        type="button"
        onClick={() => onToggleSkipped(true)}
        className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#6B7280] active:bg-[#F3F4F6]"
      >
        Didn&apos;t cover this session
      </button>
    </div>
  );
}

export function SkillRatingPanel({
  initialBefore,
  initialAfter,
  rubricId,
  templateId,
  customSkillIds,
  customSkills,
  skillLabelOverrides,
  onSave,
}: SkillRatingPanelProps) {
  const activeRubric = rubricId ?? templateId ?? "intermediate";
  const skillConfig = useMemo(
    () => ({ rubricId: activeRubric, customSkillIds, customSkills, skillLabelOverrides }),
    [activeRubric, customSkillIds, customSkills, skillLabelOverrides]
  );
  const [before, setBefore] = useState<SkillRating[]>(() =>
    initialBefore?.length
      ? initialBefore
      : defaultRatings(activeRubric, customSkillIds, customSkills, skillLabelOverrides)
  );
  const [after, setAfter] = useState<SkillRating[]>(() =>
    initialAfter?.length
      ? initialAfter
      : defaultRatings(activeRubric, customSkillIds, customSkills, skillLabelOverrides)
  );
  const [saving, setSaving] = useState(false);

  const visibleCategories = useMemo(() => {
    const cats = resolveSkills(skillConfig).map((s) => s.category);
    return ALL_SKILL_CATEGORIES.filter((c) => cats.includes(c));
  }, [skillConfig]);

  const skillsByCategory = useMemo(
    () =>
      visibleCategories.map((category) => ({
        category,
        skills: before.filter((s) => s.category === category),
      })),
    [before, visibleCategories]
  );

  const setBeforeScore = (skillId: string, score: number) => {
    setBefore((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, score } : s)));
  };

  const setAfterScore = (skillId: string, score: number) => {
    setAfter((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, score } : s)));
  };

  const setSkipped = (skillId: string, skipped: boolean) => {
    setBefore((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, skipped: skipped || undefined } : s))
    );
    setAfter((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, skipped: skipped || undefined } : s))
    );
  };

  const ratedCount = before.filter((s) => !s.skipped).length;
  const skippedCount = before.length - ratedCount;

  return (
    <div className="space-y-4">
      <div className="coach-card p-4">
        <p className="text-sm text-[#6B7280]">
          {ratedCount} to rate
          {skippedCount > 0 && (
            <span className="text-[#9CA3AF]"> · {skippedCount} skipped</span>
          )}
        </p>

        <div className="mt-5 space-y-8">
          {skillsByCategory.map(({ category, skills }) => (
            <section key={category}>
              <h3 className="font-heading text-base font-semibold text-[#111827]">
                {SKILL_CATEGORY_LABELS[category]}
              </h3>
              <div className="mt-3 space-y-3">
                {skills.map((skill) => {
                  const afterSkill = after.find((a) => a.skillId === skill.skillId)!;
                  return (
                    <SkillRatingRow
                      key={skill.skillId}
                      skillName={skill.skillName}
                      beforeScore={skill.score}
                      afterScore={afterSkill.score}
                      skipped={Boolean(skill.skipped)}
                      onBefore={(n) => setBeforeScore(skill.skillId, n)}
                      onAfter={(n) => setAfterScore(skill.skillId, n)}
                      onToggleSkipped={(skipped) => setSkipped(skill.skillId, skipped)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 border-t border-[#E5E7EB] pt-4">
          <CoachButton
            type="button"
            variant="soft"
            className="w-full"
            loading={saving}
            loadingLabel="Saving…"
            onClick={async () => {
              if (!onSave || saving) return;
              setSaving(true);
              try {
                await onSave(before, after);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
            Save ratings
          </CoachButton>
        </div>
      </div>
    </div>
  );
}
