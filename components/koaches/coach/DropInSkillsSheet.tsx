"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  dropInSkillsFromCoach,
  SkillRubricPicker,
  type SkillRubricPickerValue,
} from "@/components/koaches/coach/SkillRubricPicker";
import { updateDropInSkillsAction } from "@/lib/koaches/actions/coach-profile";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import {
  DEFAULT_SKILLS,
  getSkillsForRubric,
  resolveSkillDefinition,
} from "@/lib/koaches/constants";
import {
  type SkillScore,
  scoreLabelsForSkill,
  scoreOverrideKey,
} from "@/lib/koaches/skill-progress-display";
import type { CoachProfile, SkillCategory, SkillRubricId } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

type DropInSkillsSheetProps = {
  open: boolean;
  onClose: () => void;
  coach: CoachProfile;
  onSaved?: () => void;
  /** @deprecated No longer used. */
  forcePick?: boolean;
};

type Step = 1 | 2;

const SCORES = [0, 1, 2, 3, 4, 5] as const;

const QUICK_SETS: Array<{
  id: Exclude<SkillRubricId, "custom">;
  label: string;
}> = [
  { id: "beginner", label: "Beginner set" },
  { id: "intermediate", label: "Intermediate set" },
  { id: "advanced", label: "All skills" },
];

function emptySkills(): SkillRubricPickerValue {
  return {
    rubricId: "custom",
    customSkillIds: [],
    customSkills: [],
    skillLabelOverrides: {},
  };
}

function initialValue(coach: CoachProfile): SkillRubricPickerValue {
  if (coachHasCustomizedSessionSkills(coach)) {
    return dropInSkillsFromCoach(coach);
  }
  return emptySkills();
}

/** True once the coach has saved their own session-skill list. */
export function coachHasCustomizedSessionSkills(
  coach: Pick<CoachProfile, "customSkillIds">
): boolean {
  return Boolean(coach.customSkillIds?.length);
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="mb-4 flex items-center gap-2" aria-label={`Step ${step} of 2`}>
      <span
        className={cn("h-1.5 flex-1 rounded-full", step >= 1 ? "bg-[#16A34A]" : "bg-[#E5E7EB]")}
      />
      <span
        className={cn("h-1.5 flex-1 rounded-full", step >= 2 ? "bg-[#16A34A]" : "bg-[#E5E7EB]")}
      />
    </div>
  );
}

function ScoreBadge({ score }: { score: SkillScore }) {
  return (
    <span
      className="flex h-7 min-w-9 shrink-0 items-center justify-center gap-0.5 rounded-md bg-[#F0FDF4] px-1.5 text-[12px] font-bold text-[#166534] ring-1 ring-[#BBF7D0]"
      aria-label={`${score} star${score === 1 ? "" : "s"}`}
    >
      {score}
      <span aria-hidden>⭐</span>
    </span>
  );
}

function isOwnedCustomSkill(
  skillId: string,
  customSkills: SkillRubricPickerValue["customSkills"]
) {
  return customSkills.some((s) => s.id === skillId);
}

function missingCustomRatingScores(
  skillId: string,
  overrides: Record<string, string>
): SkillScore[] {
  return SCORES.filter((score) => !overrides[scoreOverrideKey(skillId, score)]?.trim());
}

function SkillNameAndRatingsEditor({
  skillId,
  category,
  name,
  defaultName,
  overrides,
  requireAllRatings,
  showRatingErrors,
  onChangeName,
  onChangeOverrides,
}: {
  skillId: string;
  category: SkillCategory;
  name: string;
  defaultName?: string;
  overrides: Record<string, string>;
  requireAllRatings?: boolean;
  showRatingErrors?: boolean;
  onChangeName: (name: string) => void;
  onChangeOverrides: (next: Record<string, string>) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [editingScore, setEditingScore] = useState<SkillScore | null>(null);
  const [nameDraft, setNameDraft] = useState(name);
  const [scoreDraft, setScoreDraft] = useState("");

  const placeholders = scoreLabelsForSkill(skillId, category);
  const missingScores = new Set(missingCustomRatingScores(skillId, overrides));

  const displayScore = (score: SkillScore) => {
    if (requireAllRatings) {
      return overrides[scoreOverrideKey(skillId, score)]?.trim() || "";
    }
    return scoreLabelsForSkill(skillId, category, overrides)[score];
  };

  const commitName = () => {
    onChangeName(nameDraft.trim() || defaultName || name);
    setEditingName(false);
  };

  const startEditScore = (score: SkillScore) => {
    setEditingScore(score);
    setScoreDraft(displayScore(score) || placeholders[score]);
  };

  const commitScore = (score: SkillScore) => {
    const next = { ...overrides };
    const key = scoreOverrideKey(skillId, score);
    const trimmed = scoreDraft.trim();
    if (!trimmed) {
      delete next[key];
    } else if (!requireAllRatings && trimmed === placeholders[score]) {
      delete next[key];
    } else {
      next[key] = trimmed;
    }
    onChangeOverrides(next);
    setEditingScore(null);
    setScoreDraft("");
  };

  return (
    <div className="space-y-2 border-t border-[#F3F4F6] px-3 py-2.5">
      <div className="rounded-xl bg-[#F9FAFB] px-3 py-2">
        {editingName ? (
          <div className="flex gap-2">
            <input
              autoFocus
              className={cn(
                "coach-input h-10 flex-1 text-sm",
                showRatingErrors && !nameDraft.trim() && "border-[#FECACA] ring-1 ring-[#FECACA]"
              )}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={defaultName ?? "Name this skill"}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
                if (e.key === "Escape") {
                  setNameDraft(name);
                  setEditingName(false);
                }
              }}
            />
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-[#16A34A] px-3 text-xs font-semibold text-white hover:bg-[#15803D]"
              onClick={commitName}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Skill name
              </p>
              <p className="truncate text-sm font-semibold text-[#111827]">
                {name || "Untitled skill"}
              </p>
              {showRatingErrors && !name.trim() ? (
                <p className="mt-0.5 text-xs font-medium text-[#B91C1C]">Add a skill name</p>
              ) : null}
            </div>
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center rounded-lg px-2.5 text-xs font-semibold text-[#4F8FF7] hover:bg-[#EFF6FF]"
              onClick={() => {
                setNameDraft(name);
                setEditingName(true);
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2 px-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Ratings (0–5)
          </p>
          {requireAllRatings ? (
            <p className="text-[10px] font-medium text-[#6B7280]">Required for your skill</p>
          ) : null}
        </div>

        <ul className="overflow-hidden rounded-xl border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
          {SCORES.map((score) => {
            const text = displayScore(score);
            const emptyError = Boolean(
              showRatingErrors && requireAllRatings && missingScores.has(score)
            );
            const isEditing = editingScore === score;

            return (
              <li
                key={score}
                className={cn("px-2.5 py-1.5", emptyError && "bg-[#FEF2F2]")}
              >
                {isEditing ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <ScoreBadge score={score} />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="inline-flex h-7 items-center rounded-md bg-[#16A34A] px-2.5 text-[11px] font-semibold text-white hover:bg-[#15803D]"
                          onClick={() => commitScore(score)}
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-7 items-center rounded-md px-2 text-[11px] font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
                          onClick={() => {
                            setEditingScore(null);
                            setScoreDraft("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <textarea
                      autoFocus
                      rows={2}
                      className="coach-input min-h-[2.5rem] w-full resize-none py-1.5 text-sm"
                      value={scoreDraft}
                      placeholder={placeholders[score]}
                      onChange={(e) => setScoreDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setEditingScore(null);
                          setScoreDraft("");
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={score} />
                    <p
                      className={cn(
                        "min-w-0 flex-1 text-sm leading-snug",
                        text ? "text-[#374151]" : "italic text-[#9CA3AF]"
                      )}
                    >
                      {text ||
                        (requireAllRatings ? "Tap Edit to add" : placeholders[score])}
                    </p>
                    <button
                      type="button"
                      className="inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-semibold text-[#4F8FF7] hover:bg-[#EFF6FF]"
                      onClick={() => startEditScore(score)}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {showRatingErrors && requireAllRatings && missingScores.size > 0 ? (
          <p className="mt-1.5 text-xs font-medium text-[#B91C1C]">
            Fill in all 0–5 ratings for this skill
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function DropInSkillsSheet({
  open,
  onClose,
  coach,
  onSaved,
}: DropInSkillsSheetProps) {
  const { showToast } = useCoachToast();
  const [step, setStep] = useState<Step>(1);
  const [value, setValue] = useState<SkillRubricPickerValue>(() => initialValue(coach));
  const [saving, setSaving] = useState(false);
  const [pickerKey, setPickerKey] = useState(0);
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);
  const [showCustomErrors, setShowCustomErrors] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const openSkillRef = useRef<HTMLLIElement | null>(null);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue(initialValue(coach));
      setStep(1);
      setPickerKey((k) => k + 1);
      setOpenSkillId(null);
      setShowCustomErrors(false);
    }
  }

  useEffect(() => {
    if (step !== 2 || !openSkillId) return;
    const frame = requestAnimationFrame(() => {
      openSkillRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [step, openSkillId]);

  const selectedSkills = useMemo(() => {
    return value.customSkillIds
      .map((id) => resolveSkillDefinition(id, value))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [value]);

  const applyQuickSet = (id: Exclude<SkillRubricId, "custom">) => {
    setValue({
      rubricId: id,
      customSkillIds: getSkillsForRubric(id).map((s) => s.id),
      customSkills: [],
      skillLabelOverrides: {},
    });
    setPickerKey((k) => k + 1);
  };

  const updateSkillName = (skillId: string, nextName: string) => {
    const owned = value.customSkills.find((s) => s.id === skillId);
    if (owned) {
      setValue({
        ...value,
        customSkills: value.customSkills.map((s) =>
          s.id === skillId ? { ...s, name: nextName } : s
        ),
      });
      return;
    }

    const catalog = DEFAULT_SKILLS.find((s) => s.id === skillId);
    const overrides = { ...value.skillLabelOverrides };
    const trimmed = nextName.trim();
    if (!catalog || !trimmed || trimmed === catalog.name) {
      delete overrides[skillId];
    } else {
      overrides[skillId] = trimmed;
    }
    setValue({ ...value, skillLabelOverrides: overrides });
  };

  const findIncompleteCustomSkill = () => {
    for (const skill of value.customSkills) {
      if (!value.customSkillIds.includes(skill.id)) continue;
      const nameOk = skill.name.trim().length > 0;
      const ratingsOk = missingCustomRatingScores(skill.id, value.skillLabelOverrides).length === 0;
      if (!nameOk || !ratingsOk) return skill;
    }
    return null;
  };

  const handleSave = async () => {
    if (value.customSkillIds.length === 0) {
      showToast("Pick at least one skill", "error");
      return;
    }

    const incomplete = findIncompleteCustomSkill();
    if (incomplete) {
      setShowCustomErrors(true);
      setStep(2);
      setOpenSkillId(incomplete.id);
      showToast(
        incomplete.name.trim()
          ? `Fill in all 0–5 ratings for “${incomplete.name.trim()}”`
          : "Name your custom skill and fill in all 0–5 ratings",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      await updateDropInSkillsAction(coach.id, {
        skillTemplateId: value.rubricId === "custom" ? "custom" : value.rubricId,
        customSkillIds: value.customSkillIds,
        customSkills: value.customSkills,
        skillLabelOverrides: value.skillLabelOverrides,
      });
      showToast("Skills saved");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save skills", "error");
    } finally {
      setSaving(false);
    }
  };

  const count = value.customSkillIds.length;

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={step === 1 ? "1. Pick skills" : "2. Names & ratings"}
      subtitle={
        step === 1
          ? "Check every skill you want to rate after a session"
          : "Optional — most coaches keep the defaults"
      }
      wide
      footer={
        <CoachSheetFooter>
          {step === 1 ? (
            <CoachButton
              type="button"
              className="w-full"
              disabled={count === 0}
              onClick={() => {
                const firstCustom = value.customSkills.find((s) =>
                  value.customSkillIds.includes(s.id)
                );
                const firstId = firstCustom?.id ?? value.customSkillIds[0] ?? null;
                setShowCustomErrors(false);
                setOpenSkillId(firstId);
                setStep(2);
              }}
            >
              Next · {count} skill{count === 1 ? "" : "s"}
            </CoachButton>
          ) : (
            <>
              <CoachButton
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </CoachButton>
              <CoachButton
                type="button"
                className="w-full"
                loading={saving}
                loadingLabel="Saving…"
                disabled={count === 0}
                onClick={() => void handleSave()}
              >
                Save skills
              </CoachButton>
            </>
          )}
        </CoachSheetFooter>
      }
    >
      <StepDots step={step} />

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#111827]">Optional quick start</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_SETS.map((set) => {
                const setIds = getSkillsForRubric(set.id).map((s) => s.id);
                const active =
                  setIds.length > 0 &&
                  setIds.length === value.customSkillIds.length &&
                  setIds.every((id) => value.customSkillIds.includes(id));
                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => applyQuickSet(set.id)}
                    className={cn(
                      "min-h-10 rounded-full px-3.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[#14532D] text-white"
                        : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                    )}
                  >
                    {set.label}
                  </button>
                );
              })}
              {count > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setValue(emptySkills());
                    setPickerKey((k) => k + 1);
                  }}
                  className="min-h-10 rounded-full px-3.5 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
                >
                  Clear all
                </button>
              ) : null}
            </div>
          </div>

          <SkillRubricPicker
            key={`${coach.id}-${pickerKey}`}
            value={value}
            onChange={setValue}
            defaultExpanded={count > 0}
          />
        </div>
      ) : (
        <ul className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white divide-y divide-[#F3F4F6]">
          {selectedSkills.map((skill) => {
            const owned = isOwnedCustomSkill(skill.id, value.customSkills);
            const displayName = value.skillLabelOverrides[skill.id]?.trim() || skill.name;
            const catalog = DEFAULT_SKILLS.find((s) => s.id === skill.id);
            const isOpen = openSkillId === skill.id;
            const missingRatings = owned
              ? missingCustomRatingScores(skill.id, value.skillLabelOverrides)
              : [];
            const needsCustomSetup =
              owned && (!displayName.trim() || missingRatings.length > 0);
            const editedRatings = !owned
              ? SCORES.some((score) =>
                  value.skillLabelOverrides[scoreOverrideKey(skill.id, score)]?.trim()
                )
              : missingRatings.length === 0;
            const renamed = Boolean(catalog && displayName !== catalog.name);

            return (
              <li key={skill.id} ref={isOpen ? openSkillRef : null}>
                <button
                  type="button"
                  onClick={() => setOpenSkillId(isOpen ? null : skill.id)}
                  className="flex min-h-12 w-full items-center gap-3 px-3.5 py-3 text-left"
                  aria-expanded={isOpen}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                      {displayName || "Untitled skill"}
                      {owned ? (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
                          Yours
                        </span>
                      ) : null}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-xs font-medium",
                        needsCustomSetup
                          ? "text-[#B91C1C]"
                          : renamed || editedRatings
                            ? "text-[#4F8FF7]"
                            : "text-[#6B7280]"
                      )}
                    >
                      {isOpen
                        ? "Close"
                        : needsCustomSetup
                          ? owned && !displayName.trim()
                            ? "Add name & all 0–5 ratings"
                            : "Add all 0–5 ratings"
                          : renamed || (editedRatings && !owned)
                            ? [
                                renamed ? "Renamed" : null,
                                editedRatings && !owned ? "Custom ratings" : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")
                            : owned
                              ? "Ratings complete"
                              : "Edit name & ratings"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen ? (
                  <SkillNameAndRatingsEditor
                    skillId={skill.id}
                    category={skill.category}
                    name={displayName}
                    defaultName={catalog?.name}
                    overrides={value.skillLabelOverrides}
                    requireAllRatings={owned}
                    showRatingErrors={showCustomErrors && owned}
                    onChangeName={(name) => updateSkillName(skill.id, name)}
                    onChangeOverrides={(next) =>
                      setValue({ ...value, skillLabelOverrides: next })
                    }
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </CoachBottomSheet>
  );
}
