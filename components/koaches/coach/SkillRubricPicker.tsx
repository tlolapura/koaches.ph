"use client";

import { useState } from "react";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
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
  /** Open the first category with selected skills (or the first category). */
  defaultExpanded?: boolean;
};

function cleanOverrides(
  customSkillIds: string[],
  overrides: Record<string, string>
): Record<string, string> {
  const selected = new Set(customSkillIds);
  const next: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(overrides)) {
    const trimmed = rawValue.trim();
    if (!trimmed) continue;

    if (key.startsWith("__score__:")) {
      const encoded = key.slice("__score__:".length);
      const [skillId] = encoded.split(":");
      if (skillId && selected.has(skillId)) {
        next[key] = trimmed;
      }
      continue;
    }

    if (!selected.has(key)) continue;
    const skill = DEFAULT_SKILLS.find((s) => s.id === key);
    if (skill && trimmed !== skill.name) {
      next[key] = trimmed;
    }
  }
  return next;
}

function pruneCustomSkills(customSkillIds: string[], customSkills: SkillDefinition[]) {
  const ids = new Set(customSkillIds);
  return customSkills.filter((skill) => ids.has(skill.id));
}

function initialOpenCategory(
  value: SkillRubricPickerValue,
  defaultExpanded: boolean
): SkillCategory | null {
  if (!defaultExpanded) return null;
  const withSelection = ALL_SKILL_CATEGORIES.find(
    (cat) =>
      DEFAULT_SKILLS.some((s) => s.category === cat && value.customSkillIds.includes(s.id)) ||
      value.customSkills.some((s) => s.category === cat)
  );
  return withSelection ?? ALL_SKILL_CATEGORIES[0] ?? null;
}

export function SkillRubricPicker({
  value,
  onChange,
  hint,
  defaultExpanded = false,
}: SkillRubricPickerProps) {
  const [openCategory, setOpenCategory] = useState<SkillCategory | null>(() =>
    initialOpenCategory(value, defaultExpanded)
  );
  const [addingToCategory, setAddingToCategory] = useState<SkillCategory | null>(null);
  const [newSkillName, setNewSkillName] = useState("");

  const skillCount = value.customSkillIds.length;

  const toggleCategorySkills = (cat: SkillCategory) => {
    const catSkills = DEFAULT_SKILLS.filter((skill) => skill.category === cat).map(
      (skill) => skill.id
    );
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

  return (
    <div className="space-y-3">
      {hint ? <p className="text-sm text-[#6B7280]">{hint}</p> : null}

      <p className="text-xs font-semibold text-[#14532D]">
        {skillCount} skill{skillCount !== 1 ? "s" : ""} checked
      </p>

      <div className="space-y-2">
        {ALL_SKILL_CATEGORIES.map((cat) => {
          const catSkills = DEFAULT_SKILLS.filter((skill) => skill.category === cat);
          const ownedSkills = value.customSkills.filter((skill) => skill.category === cat);
          const catalogSelected = catSkills.filter((skill) =>
            value.customSkillIds.includes(skill.id)
          ).length;
          const selected = catalogSelected + ownedSkills.length;
          const isOpen = openCategory === cat;
          const allCatalogSelected =
            catSkills.length > 0 && catalogSelected === catSkills.length;

          return (
            <div key={cat} className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpenCategory(isOpen ? null : cat)}
                  className="flex min-h-12 flex-1 items-center gap-2 px-3.5 py-2.5 text-left"
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-semibold text-[#111827]">
                      {SKILL_CATEGORY_LABELS[cat]}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {selected}/{catSkills.length + ownedSkills.length}
                      {ownedSkills.length > 0 ? ` · ${ownedSkills.length} yours` : ""}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => toggleCategorySkills(cat)}
                  className={cn(
                    "mr-2.5 shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold",
                    allCatalogSelected
                      ? "bg-[#16A34A] text-white"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  )}
                >
                  {allCatalogSelected ? "All on" : "All"}
                </button>
              </div>

              {isOpen ? (
                <ul className="divide-y divide-[#F3F4F6] border-t border-[#E5E7EB]">
                  {catSkills.map((skill) => {
                    const on = value.customSkillIds.includes(skill.id);
                    const displayName =
                      resolveSkillDefinition(skill.id, value)?.name ?? skill.name;

                    return (
                      <li key={skill.id}>
                        <button
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          className={cn(
                            "flex min-h-11 w-full items-center gap-3 px-3.5 py-2.5 text-left",
                            on ? "bg-[#F0FDF4]/60" : "bg-white"
                          )}
                          aria-pressed={on}
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                              on
                                ? "border-[#16A34A] bg-[#16A34A] text-white"
                                : "border-[#D1D5DB] bg-white"
                            )}
                          >
                            {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 text-sm leading-snug",
                              on ? "font-medium text-[#111827]" : "text-[#374151]"
                            )}
                          >
                            {displayName}
                          </span>
                        </button>
                      </li>
                    );
                  })}

                  {ownedSkills.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex min-h-11 items-center gap-2 bg-[#EFF6FF]/40 px-3.5 py-2"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#2563EB] text-[10px] font-bold text-white">
                        +
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-[#1E3A8A]">
                        {skill.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomSkill(skill.id)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#B91C1C] hover:bg-[#FEF2F2]"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}

                  <li className="px-3 py-2">
                    {addingToCategory === cat ? (
                      <div className="space-y-2">
                        <input
                          autoFocus
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          placeholder="Your skill name"
                          className="coach-input w-full py-2 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") addCustomSkill(cat);
                            if (e.key === "Escape") {
                              setAddingToCategory(null);
                              setNewSkillName("");
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => addCustomSkill(cat)}
                            className="min-h-10 flex-1 rounded-lg bg-[#2563EB] text-sm font-semibold text-white"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingToCategory(null);
                              setNewSkillName("");
                            }}
                            className="min-h-10 rounded-lg px-3 text-sm font-semibold text-[#6B7280]"
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
                        className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF]"
                      >
                        <Plus className="h-4 w-4" />
                        Add your own
                      </button>
                    )}
                  </li>
                </ul>
              ) : null}
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
  const customSkillIds = program.customSkillIds?.length
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
