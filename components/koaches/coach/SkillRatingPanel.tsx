"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  ALL_SKILL_CATEGORIES,
  getSkillsForRubric,
  resolveSkills,
  SKILL_CATEGORY_LABELS,
} from "@/lib/koaches/constants";
import {
  buildSkillChanges,
  type SkillScore,
  scoreLabel,
  scoreLabelsForSkill,
} from "@/lib/koaches/skill-progress-display";
import {
  suggestSessionFeedback,
  type SessionFeedback,
} from "@/lib/koaches/progress-cards";
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
  initialFeedback?: SessionFeedback;
  onSave?: (
    before: SkillRating[],
    after: SkillRating[],
    feedback: SessionFeedback
  ) => void | Promise<void>;
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
    skipped: true,
  }));
}

function ScorePicker({
  value,
  onChange,
  tone,
  label,
  labels,
}: {
  value: number;
  onChange: (score: number) => void;
  tone: "start" | "after";
  label: string;
  labels: Record<SkillScore, string>;
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
        {([0, 1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}, ${labels[n]}`}
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
      <p className="mt-1.5 rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium text-[#374151]">
        {value} - {scoreLabel(value, labels)}
      </p>
    </div>
  );
}

function SkillRatingRow({
  skillName,
  beforeScore,
  afterScore,
  skipped,
  scoreLabels,
  onBefore,
  onAfter,
  onToggleSkipped,
}: {
  skillName: string;
  beforeScore: number;
  afterScore: number;
  skipped: boolean;
  scoreLabels: Record<SkillScore, string>;
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
          labels={scoreLabels}
        />
        <ScorePicker
          value={afterScore}
          onChange={onAfter}
          tone="after"
          label="After"
          labels={scoreLabels}
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
  initialFeedback,
  onSave,
}: SkillRatingPanelProps) {
  const activeRubric = rubricId ?? templateId ?? "intermediate";
  const skillConfig = useMemo(
    () => ({ rubricId: activeRubric, customSkillIds, customSkills, skillLabelOverrides }),
    [activeRubric, customSkillIds, customSkills, skillLabelOverrides]
  );
  const [before, setBefore] = useState<SkillRating[]>(() =>
    initialBefore?.length
      ? initialBefore.map((s) => ({ ...s, skipped: s.skipped === false ? false : true }))
      : defaultRatings(activeRubric, customSkillIds, customSkills, skillLabelOverrides)
  );
  const [after, setAfter] = useState<SkillRating[]>(() =>
    initialAfter?.length
      ? initialAfter.map((s) => ({ ...s, skipped: s.skipped === false ? false : true }))
      : defaultRatings(activeRubric, customSkillIds, customSkills, skillLabelOverrides)
  );
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"coverage" | "ratings" | "feedback">("coverage");
  const [feedback, setFeedback] = useState<SessionFeedback>(() => ({
    strengths: initialFeedback?.strengths ?? "",
    toImprove: initialFeedback?.toImprove ?? "",
    generalNote: initialFeedback?.generalNote ?? "",
  }));
  const feedbackPrefilled = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== "ratings" && step !== "feedback") return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const skillChanges = useMemo(() => buildSkillChanges(before, after), [before, after]);

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

  const ratedSkillsByCategory = useMemo(
    () =>
      skillsByCategory
        .map(({ category, skills }) => ({
          category,
          skills: skills.filter((s) => s.skipped === false),
        }))
        .filter(({ skills }) => skills.length > 0),
    [skillsByCategory]
  );

  const setBeforeScore = (skillId: string, score: number) => {
    setBefore((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, score } : s)));
  };

  const setAfterScore = (skillId: string, score: number) => {
    setAfter((prev) => prev.map((s) => (s.skillId === skillId ? { ...s, score } : s)));
  };

  const setSkipped = (skillId: string, skipped: boolean) => {
    setBefore((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, skipped } : s))
    );
    setAfter((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, skipped } : s))
    );
  };

  const ratedCount = before.filter((s) => s.skipped === false).length;
  const skippedCount = before.length - ratedCount;

  const goToFeedback = () => {
    if (!feedback.strengths && !feedback.toImprove && !feedback.generalNote && !feedbackPrefilled.current) {
      feedbackPrefilled.current = true;
      setFeedback(suggestSessionFeedback(skillChanges));
    }
    setStep("feedback");
  };

  const updateFeedback = (key: keyof SessionFeedback, value: string) => {
    setFeedback((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div ref={panelRef} className="space-y-4">
      <div className="coach-card p-4">
        <p className="text-sm text-[#6B7280]">
          {step === "coverage" && (
            <>
              {ratedCount} covered
              {skippedCount > 0 && (
                <span className="text-[#9CA3AF]"> · {skippedCount} skipped</span>
              )}
            </>
          )}
          {step === "ratings" && `Rate ${ratedCount} covered skill${ratedCount !== 1 ? "s" : ""}`}
          {step === "feedback" && "Add session feedback for the player"}
        </p>

        {step === "coverage" ? (
          <div className="mt-5 space-y-6">
            {skillsByCategory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
                No skills configured yet for this session.
              </div>
            ) : (
              skillsByCategory.map(({ category, skills }) => (
              <section key={category}>
                <h3 className="font-heading text-base font-semibold text-[#111827]">
                  {SKILL_CATEGORY_LABELS[category]}
                </h3>
                <div className="mt-2 space-y-2">
                  {skills.map((skill) => {
                    const covered = skill.skipped === false;
                    return (
                      <div
                        key={skill.skillId}
                        className={cn(
                          "rounded-lg border px-3 py-2",
                          covered ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#E5E7EB] bg-white"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setSkipped(skill.skillId, covered)}
                          className="flex min-h-[44px] w-full items-center gap-3 text-left"
                          aria-pressed={covered}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                              covered
                                ? "border-[#16A34A] bg-[#16A34A] text-white"
                                : "border-[#D1D5DB] bg-white text-transparent"
                            )}
                            aria-hidden
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          <p className="text-sm font-medium text-[#111827]">{skill.skillName}</p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
            )}
          </div>
        ) : step === "feedback" ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="coach-label" htmlFor="session-feedback-strengths">
                Strengths
              </label>
              <textarea
                id="session-feedback-strengths"
                className="coach-input mt-1 min-h-[88px] resize-none"
                placeholder="What stood out today?"
                value={feedback.strengths}
                onChange={(e) => updateFeedback("strengths", e.target.value)}
              />
            </div>
            <div>
              <label className="coach-label" htmlFor="session-feedback-improve">
                To improve
              </label>
              <textarea
                id="session-feedback-improve"
                className="coach-input mt-1 min-h-[88px] resize-none"
                placeholder="What to work on next session?"
                value={feedback.toImprove}
                onChange={(e) => updateFeedback("toImprove", e.target.value)}
              />
            </div>
            <div>
              <label className="coach-label" htmlFor="session-feedback-note">
                General note
              </label>
              <textarea
                id="session-feedback-note"
                className="coach-input mt-1 min-h-[88px] resize-none"
                placeholder="Encouragement or anything else to share"
                value={feedback.generalNote}
                onChange={(e) => updateFeedback("generalNote", e.target.value)}
              />
            </div>
          </div>
        ) : ratedSkillsByCategory.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4 text-sm text-[#6B7280]">
            No covered skills to rate yet. Go back and mark at least one skill as covered.
          </div>
        ) : (
          <div className="mt-5 space-y-8">
            {ratedSkillsByCategory.map(({ category, skills }) => (
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
                        skipped={skill.skipped !== false}
                        scoreLabels={scoreLabelsForSkill(
                          skill.skillId,
                          skill.category,
                          skillLabelOverrides
                        )}
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
        )}

        <div className="mt-6 border-t border-[#E5E7EB] pt-4">
          {step === "coverage" ? (
            <CoachButton
              type="button"
              variant="soft"
              className="w-full"
              onClick={() => setStep("ratings")}
            >
              Continue to ratings
            </CoachButton>
          ) : step === "ratings" ? (
            <div className="space-y-2">
              <CoachButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("coverage")}
              >
                Back to coverage
              </CoachButton>
              <CoachButton
                type="button"
                variant="soft"
                className="w-full"
                disabled={ratedSkillsByCategory.length === 0}
                onClick={goToFeedback}
              >
                Continue to feedback
              </CoachButton>
            </div>
          ) : (
            <div className="space-y-2">
              <CoachButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("ratings")}
              >
                Back to ratings
              </CoachButton>
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
                    await onSave(before, after, feedback);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Save session
              </CoachButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
