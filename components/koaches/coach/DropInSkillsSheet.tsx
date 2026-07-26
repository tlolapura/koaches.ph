"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
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
  ALL_SKILL_CATEGORIES,
  DEFAULT_SKILLS,
  getSkillsForRubric,
  resolveSkillDefinition,
  SKILL_CATEGORY_LABELS,
  SKILL_RUBRICS_META,
} from "@/lib/koaches/constants";
import type { CoachProfile, SkillCategory, SkillRubricId } from "@/lib/koaches/types";
import { SkillScoreMeanings } from "@/components/koaches/coach/SkillScoreMeanings";

type DropInSkillsSheetProps = {
  open: boolean;
  onClose: () => void;
  coach: CoachProfile;
  onSaved?: () => void;
  /** Jump straight into starter packs (e.g. first-run). */
  forcePick?: boolean;
};

type SheetStep = "pick" | "list" | "add";

const STARTER_PACKS: Array<{
  id: Exclude<SkillRubricId, "custom">;
  title: string;
  blurb: string;
}> = [
  {
    id: "beginner",
    title: "Beginner",
    blurb: "Basics, serves, and getting comfortable on court",
  },
  {
    id: "intermediate",
    title: "Intermediate",
    blurb: "Third shots, kitchen, volleys — most coaches start here",
  },
  {
    id: "advanced",
    title: "Advanced",
    blurb: "Full skill set for competitive players",
  },
];

function packFromRubric(id: Exclude<SkillRubricId, "custom">): SkillRubricPickerValue {
  return {
    rubricId: id,
    customSkillIds: getSkillsForRubric(id).map((s) => s.id),
    customSkills: [],
    skillLabelOverrides: {},
  };
}

function sampleSkillNames(id: Exclude<SkillRubricId, "custom">): string {
  return getSkillsForRubric(id)
    .slice(0, 4)
    .map((s) => s.name)
    .join(" · ");
}

function initialStep(coach: CoachProfile, forcePick: boolean): SheetStep {
  return forcePick || !coachHasCustomizedSessionSkills(coach) ? "pick" : "list";
}

/** True once the coach has saved their own session-skill list. */
export function coachHasCustomizedSessionSkills(
  coach: Pick<CoachProfile, "customSkillIds">
): boolean {
  return Boolean(coach.customSkillIds?.length);
}

export function DropInSkillsSheet({
  open,
  onClose,
  coach,
  onSaved,
  forcePick = false,
}: DropInSkillsSheetProps) {
  const { showToast } = useCoachToast();
  const customized = coachHasCustomizedSessionSkills(coach);
  const [step, setStep] = useState<SheetStep>(() => initialStep(coach, forcePick));
  const [value, setValue] = useState<SkillRubricPickerValue>(() => dropInSkillsFromCoach(coach));
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [wasOpen, setWasOpen] = useState(open);

  // Reset draft when the sheet opens (React: adjust state when a prop changes).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue(dropInSkillsFromCoach(coach));
      setStep(initialStep(coach, forcePick));
      setEditingId(null);
      setDraftLabel("");
    }
  }

  const selectedSkills = useMemo(() => {
    return value.customSkillIds
      .map((id) => resolveSkillDefinition(id, value))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  }, [value]);

  const skillsByCategory = useMemo(() => {
    const groups: Array<{ category: SkillCategory; label: string; skills: typeof selectedSkills }> = [];
    for (const category of ALL_SKILL_CATEGORIES) {
      const skills = selectedSkills.filter((s) => s.category === category);
      if (skills.length === 0) continue;
      groups.push({ category, label: SKILL_CATEGORY_LABELS[category], skills });
    }
    return groups;
  }, [selectedSkills]);

  const applyPack = (id: Exclude<SkillRubricId, "custom">) => {
    setValue(packFromRubric(id));
    setStep("list");
  };

  const removeSkill = (skillId: string) => {
    const customSkillIds = value.customSkillIds.filter((id) => id !== skillId);
    setValue({
      ...value,
      rubricId: "custom",
      customSkillIds,
      customSkills: value.customSkills.filter((s) => s.id !== skillId),
      skillLabelOverrides: Object.fromEntries(
        Object.entries(value.skillLabelOverrides).filter(([key]) => {
          if (key === skillId) return false;
          if (key.startsWith(`__score__:${skillId}:`)) return false;
          return true;
        })
      ),
    });
  };

  const commitRename = (skillId: string) => {
    const trimmed = draftLabel.trim();
    const owned = value.customSkills.find((s) => s.id === skillId);
    if (owned) {
      if (trimmed) {
        setValue({
          ...value,
          customSkills: value.customSkills.map((s) =>
            s.id === skillId ? { ...s, name: trimmed } : s
          ),
        });
      }
    } else {
      const catalog = DEFAULT_SKILLS.find((s) => s.id === skillId);
      const overrides = { ...value.skillLabelOverrides };
      if (!catalog || !trimmed || trimmed === catalog.name) {
        delete overrides[skillId];
      } else {
        overrides[skillId] = trimmed;
      }
      setValue({ ...value, skillLabelOverrides: overrides });
    }
    setEditingId(null);
    setDraftLabel("");
  };

  const handleSave = async () => {
    if (value.customSkillIds.length === 0) {
      showToast("Pick at least one skill", "error");
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
      showToast("Session skills saved");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save skills", "error");
    } finally {
      setSaving(false);
    }
  };

  const title =
    step === "pick"
      ? "Skills you score"
      : step === "add"
        ? "Add skills"
        : "Your session skills";

  const subtitle =
    step === "pick"
      ? "What you usually rate after a one-off lesson"
      : step === "list"
        ? `${value.customSkillIds.length} skill${value.customSkillIds.length === 1 ? "" : "s"} · used on drop-in sessions`
        : "Tap to add or remove from your list";

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      wide={step === "add"}
      footer={
        step === "list" ? (
          <CoachSheetFooter>
            <CoachButton
              type="button"
              className="w-full"
              loading={saving}
              loadingLabel="Saving…"
              disabled={value.customSkillIds.length === 0}
              onClick={() => void handleSave()}
            >
              Save skills
            </CoachButton>
          </CoachSheetFooter>
        ) : step === "add" ? (
          <CoachSheetFooter>
            <CoachButton type="button" className="w-full" onClick={() => setStep("list")}>
              Done · {value.customSkillIds.length} selected
            </CoachButton>
          </CoachSheetFooter>
        ) : undefined
      }
    >
      {step === "pick" ? (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">
            Pick a starter. You can tweak the list next — takes about 30 seconds.
          </p>
          {STARTER_PACKS.map((pack) => {
            const meta = SKILL_RUBRICS_META[pack.id];
            const count = getSkillsForRubric(pack.id).length;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => applyPack(pack.id)}
                className="coach-card flex w-full flex-col gap-1 p-4 text-left transition-colors hover:border-[#16A34A]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-base font-bold text-[#111827]">{pack.title}</p>
                  <span className="text-xs font-semibold text-[#4F8FF7]">
                    {count} skills →
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">{pack.blurb}</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  {meta.name} · {sampleSkillNames(pack.id)}…
                </p>
              </button>
            );
          })}
          {customized ? (
            <button
              type="button"
              onClick={() => {
                setValue(dropInSkillsFromCoach(coach));
                setStep("list");
              }}
              className="flex min-h-[44px] w-full items-center justify-center text-sm font-semibold text-[#6B7280]"
            >
              Keep my current list
            </button>
          ) : null}
        </div>
      ) : null}

      {step === "list" ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-[#F0FDF4] px-3 py-2.5 text-xs text-[#166534]">
            After a drop-in session, you&apos;ll tap these to score how the player did.
          </p>

          {skillsByCategory.length > 0 ? (
            <div className="space-y-3">
              {skillsByCategory.map((group) => (
                <div
                  key={group.category}
                  className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
                >
                  <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
                    <p className="font-heading text-sm font-semibold text-[#111827]">{group.label}</p>
                    <p className="text-xs text-[#6B7280]">
                      {group.skills.length} skill{group.skills.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ul className="divide-y divide-[#F3F4F6]">
                    {group.skills.map((skill) => {
                      const displayName =
                        value.skillLabelOverrides[skill.id]?.trim() || skill.name;
                      const isEditing = editingId === skill.id;
                      return (
                        <li key={skill.id} className="px-3 py-3">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <input
                                  autoFocus
                                  className="coach-input h-9 py-1 text-sm"
                                  value={draftLabel}
                                  onChange={(e) => setDraftLabel(e.target.value)}
                                  onBlur={() => commitRename(skill.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") commitRename(skill.id);
                                    if (e.key === "Escape") {
                                      setEditingId(null);
                                      setDraftLabel("");
                                    }
                                  }}
                                />
                              ) : (
                                <p className="font-heading text-sm font-semibold text-[#111827]">
                                  {displayName}
                                </p>
                              )}
                            </div>
                            {!isEditing ? (
                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]"
                                  aria-label={`Rename ${displayName}`}
                                  onClick={() => {
                                    setEditingId(skill.id);
                                    setDraftLabel(displayName);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                                  aria-label={`Remove ${displayName}`}
                                  onClick={() => removeSkill(skill.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#6B7280]"
                                aria-label="Cancel rename"
                                onClick={() => {
                                  setEditingId(null);
                                  setDraftLabel("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {!isEditing ? (
                            <SkillScoreMeanings
                              skillId={skill.id}
                              category={skill.category}
                              overrides={value.skillLabelOverrides}
                              onChangeOverrides={(next) =>
                                setValue({ ...value, skillLabelOverrides: next })
                              }
                            />
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-[#6B7280]">
              No skills yet. Add some or pick a starter pack.
            </p>
          )}

          <button
            type="button"
            onClick={() => setStep("add")}
            className="coach-btn-outline flex w-full min-h-[48px] items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add skills
          </button>

          <div className="border-t border-[#E5E7EB] pt-2">
            <button
              type="button"
              onClick={() => setStep("pick")}
              className="flex min-h-[44px] w-full items-center justify-between text-sm font-semibold text-[#374151]"
            >
              Change starter pack
              <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
            </button>
          </div>
        </div>
      ) : null}

      {step === "add" ? (
        <SkillRubricPicker
          value={value}
          onChange={setValue}
          hint="Check a skill to add it. Tap a category to open it."
        />
      ) : null}
    </CoachBottomSheet>
  );
}
