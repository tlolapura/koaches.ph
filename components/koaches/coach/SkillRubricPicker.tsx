"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import {
  ALL_SKILL_CATEGORIES,
  DEFAULT_SKILLS,
  getSkillsForRubric,
  newCustomSkillId,
  resolveSkillDefinition,
  SKILL_CATEGORY_LABELS,
} from "@/lib/koaches/constants";
import type { SkillCategory, SkillDefinition, SkillRubricId } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";
import { SkillScoreMeanings } from "@/components/koaches/coach/SkillScoreMeanings";

export type SkillRubricPickerValue = {
  rubricId: SkillRubricId;
  customSkillIds: string[];
  customSkills: SkillDefinition[];
  skillLabelOverrides: Record<string, string>;
};

type SkillRubricPickerProps = {
  value: SkillRubricPickerValue;
  onChange: (value: SkillRubricPickerValue) => void;
  hint?: string;
  defaultExpanded?: boolean;
};

function cleanOverrides(
  customSkillIds: string[],
  overrides: Record<string, string>
): Record<string, string> {
  const selected = new Set(customSkillIds);
  const next: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(overrides)) {
    const value = rawValue.trim();
    if (!value) continue;

    if (key.startsWith("__score__:")) {
      const encoded = key.slice("__score__:".length);
      const [skillId] = encoded.split(":");
      if (skillId && selected.has(skillId)) {
        next[key] = value;
      }
      continue;
    }

    if (!selected.has(key)) continue;
    const skill = DEFAULT_SKILLS.find((s) => s.id === key);
    if (skill && value !== skill.name) {
      next[key] = value;
    }
  }
  return next;
}

function pruneCustomSkills(customSkillIds: string[], customSkills: SkillDefinition[]) {
  const ids = new Set(customSkillIds);
  return customSkills.filter((skill) => ids.has(skill.id));
}

export function SkillRubricPicker({ value, onChange, hint, defaultExpanded = false }: SkillRubricPickerProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    if (defaultExpanded) return new Set(ALL_SKILL_CATEGORIES);
    const withSelection = ALL_SKILL_CATEGORIES.filter(
      (cat) =>
        DEFAULT_SKILLS.some((s) => s.category === cat && value.customSkillIds.includes(s.id)) ||
        value.customSkills.some((s) => s.category === cat)
    );
    return new Set(withSelection.length > 0 ? withSelection : []);
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [addingToCategory, setAddingToCategory] = useState<SkillCategory | null>(null);
  const [newSkillName, setNewSkillName] = useState("");

  const skillCount = value.customSkillIds.length;

  const toggleCategory = (cat: string) => {
    const catSkills = DEFAULT_SKILLS.filter((skill) => skill.category === cat).map((skill) => skill.id);
    const ids = new Set(value.customSkillIds);
    const allOn = catSkills.every((id) => ids.has(id));
    if (allOn) catSkills.forEach((id) => ids.delete(id));
    else catSkills.forEach((id) => ids.add(id));
    const customSkillIds = [...ids];
    onChange({
      ...value,
      rubricId: "custom",
      customSkillIds,
      customSkills: pruneCustomSkills(customSkillIds, value.customSkills),
      skillLabelOverrides: cleanOverrides(customSkillIds, value.skillLabelOverrides),
    });
  };

  const toggleSkill = (skillId: string) => {
    const customSkillIds = value.customSkillIds.includes(skillId)
      ? value.customSkillIds.filter((id) => id !== skillId)
      : [...value.customSkillIds, skillId];
    onChange({
      ...value,
      rubricId: "custom",
      customSkillIds,
      customSkills: pruneCustomSkills(customSkillIds, value.customSkills),
      skillLabelOverrides: cleanOverrides(customSkillIds, value.skillLabelOverrides),
    });
  };

  const removeCustomSkill = (skillId: string) => {
    const customSkillIds = value.customSkillIds.filter((id) => id !== skillId);
    onChange({
      ...value,
      rubricId: "custom",
      customSkillIds,
      customSkills: value.customSkills.filter((skill) => skill.id !== skillId),
      skillLabelOverrides: cleanOverrides(customSkillIds, value.skillLabelOverrides),
    });
  };

  const changeScoreOverrides = (next: Record<string, string>) => {
    onChange({
      ...value,
      skillLabelOverrides: cleanOverrides(value.customSkillIds, next),
    });
  };

  const addCustomSkill = (category: SkillCategory) => {
    const name = newSkillName.trim();
    if (!name) return;

    const skill: SkillDefinition = {
      id: newCustomSkillId(),
      name,
      category,
    };

    onChange({
      ...value,
      rubricId: "custom",
      customSkillIds: [...value.customSkillIds, skill.id],
      customSkills: [...value.customSkills, skill],
    });
    setNewSkillName("");
    setAddingToCategory(null);
  };

  const startRenameCatalog = (skillId: string) => {
    const skill = DEFAULT_SKILLS.find((s) => s.id === skillId);
    if (!skill) return;
    setEditingId(skillId);
    setDraftLabel(
      resolveSkillDefinition(skillId, value)?.name ?? skill.name
    );
  };

  const startRenameCustom = (skillId: string) => {
    const skill = value.customSkills.find((s) => s.id === skillId);
    if (!skill) return;
    setEditingId(skillId);
    setDraftLabel(skill.name);
  };

  const commitRename = (skillId: string) => {
    const trimmed = draftLabel.trim();
    const owned = value.customSkills.find((skill) => skill.id === skillId);

    if (owned) {
      if (!trimmed) {
        setEditingId(null);
        setDraftLabel("");
        return;
      }
      onChange({
        ...value,
        customSkills: value.customSkills.map((skill) =>
          skill.id === skillId ? { ...skill, name: trimmed } : skill
        ),
      });
    } else {
      const catalog = DEFAULT_SKILLS.find((skill) => skill.id === skillId);
      if (!catalog) return;
      const overrides = { ...value.skillLabelOverrides };
      if (!trimmed || trimmed === catalog.name) {
        delete overrides[skillId];
      } else {
        overrides[skillId] = trimmed;
      }
      onChange({
        ...value,
        skillLabelOverrides: overrides,
      });
    }

    setEditingId(null);
    setDraftLabel("");
  };

  return (
    <div className="space-y-4">
      {hint && <p className="text-sm text-[#6B7280]">{hint}</p>}

      <p className="text-xs font-medium text-[#6B7280]">
        {skillCount} skill{skillCount !== 1 ? "s" : ""} selected
      </p>

      <div className="space-y-2">
        {ALL_SKILL_CATEGORIES.map((cat) => {
          const catSkills = DEFAULT_SKILLS.filter((skill) => skill.category === cat);
          const ownedSkills = value.customSkills.filter((skill) => skill.category === cat);
          const catalogSelected = catSkills.filter((skill) =>
            value.customSkillIds.includes(skill.id)
          ).length;
          const selected = catalogSelected + ownedSkills.length;
          const isOpen = openCategories.has(cat);
          const allCatalogSelected = catalogSelected === catSkills.length;

          return (
            <div key={cat} className="overflow-hidden rounded-xl border border-[#E5E7EB]">
              <div className="flex min-h-[48px] w-full items-center justify-between px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenCategories((prev) => {
                      const next = new Set(prev);
                      if (next.has(cat)) next.delete(cat);
                      else next.add(cat);
                      return next;
                    });
                  }}
                  className="flex flex-1 items-center text-left"
                >
                  <div>
                    <p className="font-heading text-sm font-semibold">{SKILL_CATEGORY_LABELS[cat]}</p>
                    <p className="text-xs text-[#6B7280]">
                      {selected} selected
                      {ownedSkills.length > 0 && ` · ${ownedSkills.length} yours`}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "min-h-[32px] shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold",
                    allCatalogSelected ? "bg-[#16A34A] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {allCatalogSelected ? "All on" : "Select all"}
                </button>
              </div>

              {isOpen && (
                <div className="space-y-1 border-t border-[#E5E7EB] px-3 py-2">
                  {catSkills.map((skill) => {
                    const on = value.customSkillIds.includes(skill.id);
                    const displayName =
                      resolveSkillDefinition(skill.id, value)?.name ?? skill.name;

                    return (
                      <div
                        key={skill.id}
                        className={cn(
                          "rounded-lg px-2 py-2",
                          on ? "bg-[#F0FDF4]/70" : "bg-white"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSkill(skill.id)}
                            className={cn(
                              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                              on ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-[#D1D5DB] bg-white"
                            )}
                            aria-pressed={on}
                          >
                            {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </button>

                          <div className="min-w-0 flex-1">
                            {on && editingId === skill.id ? (
                              <input
                                autoFocus
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
                                className="coach-input w-full py-1.5 text-sm"
                              />
                            ) : (
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm leading-snug text-[#374151]">{displayName}</p>
                                {on && (
                                  <button
                                    type="button"
                                    onClick={() => startRenameCatalog(skill.id)}
                                    className="inline-flex min-h-[32px] shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#4F8FF7]"
                                  >
                                    <Pencil className="h-3 w-3" />
                                    Rename
                                  </button>
                                )}
                              </div>
                            )}
                            {on && displayName !== skill.name && (
                              <p className="mt-0.5 text-[11px] text-[#9CA3AF]">Default: {skill.name}</p>
                            )}
                            {on && (
                              <SkillScoreMeanings
                                skillId={skill.id}
                                category={skill.category}
                                overrides={value.skillLabelOverrides}
                                onChangeOverrides={changeScoreOverrides}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {ownedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-lg border border-dashed border-[#BFDBFE] bg-[#EFF6FF]/50 px-2 py-2"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#2563EB] text-[10px] font-bold text-white">
                          +
                        </span>
                        <div className="min-w-0 flex-1">
                          {editingId === skill.id ? (
                            <input
                              autoFocus
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
                              className="coach-input w-full py-1.5 text-sm"
                            />
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm leading-snug text-[#1E3A8A]">{skill.name}</p>
                                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#3B82F6]">
                                  Your skill
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  onClick={() => startRenameCustom(skill.id)}
                                  className="inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#4F8FF7]"
                                >
                                  <Pencil className="h-3 w-3" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeCustomSkill(skill.id)}
                                  className="inline-flex min-h-[32px] items-center rounded-lg px-2 text-xs font-semibold text-[#B91C1C]"
                                  aria-label={`Remove ${skill.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                          <SkillScoreMeanings
                            skillId={skill.id}
                            category={skill.category}
                            overrides={value.skillLabelOverrides}
                            onChangeOverrides={changeScoreOverrides}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {addingToCategory === cat ? (
                    <div className="rounded-lg bg-[#F9FAFB] px-2 py-2">
                      <input
                        autoFocus
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Skill name"
                        className="coach-input w-full py-2 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addCustomSkill(cat);
                          if (e.key === "Escape") {
                            setAddingToCategory(null);
                            setNewSkillName("");
                          }
                        }}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => addCustomSkill(cat)}
                          className="min-h-[40px] flex-1 rounded-lg bg-[#2563EB] text-sm font-semibold text-white"
                        >
                          Add skill
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingToCategory(null);
                            setNewSkillName("");
                          }}
                          className="min-h-[40px] rounded-lg border border-[#E5E7EB] px-4 text-sm font-semibold text-[#6B7280]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingToCategory(cat);
                        setNewSkillName("");
                      }}
                      className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#BFDBFE] bg-[#EFF6FF]/40 text-sm font-semibold text-[#2563EB] active:bg-[#EFF6FF]"
                    >
                      <Plus className="h-4 w-4" />
                      Add your own skill
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function dropInSkillsFromCoach(
  coach: Pick<
    import("@/lib/koaches/types").CoachProfile,
    "skillTemplateId" | "customSkillIds" | "customSkills" | "skillLabelOverrides"
  >
): SkillRubricPickerValue {
  if (coach.customSkillIds?.length) {
    return {
      rubricId: "custom",
      customSkillIds: coach.customSkillIds,
      customSkills: coach.customSkills ?? [],
      skillLabelOverrides: coach.skillLabelOverrides ?? {},
    };
  }

  const base = coach.skillTemplateId === "custom" ? "intermediate" : coach.skillTemplateId;
  return {
    rubricId: base,
    customSkillIds: getSkillsForRubric(base).map((skill) => skill.id),
    customSkills: coach.customSkills ?? [],
    skillLabelOverrides: coach.skillLabelOverrides ?? {},
  };
}

export function programSkillsFromProgram(
  program: Pick<
    import("@/lib/koaches/types").Program,
    "rubricId" | "skillTemplateId" | "customSkillIds" | "customSkills" | "skillLabelOverrides"
  >
): SkillRubricPickerValue {
  const legacyRubric = program.rubricId ?? program.skillTemplateId;
  const customSkillIds =
    program.customSkillIds?.length
      ? program.customSkillIds
      : legacyRubric && legacyRubric !== "custom"
        ? getSkillsForRubric(legacyRubric).map((skill) => skill.id)
        : [];

  return {
    rubricId: "custom",
    customSkillIds,
    customSkills: program.customSkills ?? [],
    skillLabelOverrides: program.skillLabelOverrides ?? {},
  };
}
