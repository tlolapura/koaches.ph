"use client";

import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import type { SkillRubricId } from "@/lib/koaches/types";
import { resolveSkills, SKILL_CATEGORY_LABELS } from "@/lib/koaches/constants";
import { SkillScoreGuideToggle } from "@/components/koaches/SkillProgressDisplay";
import { cn } from "@/lib/utils";

type SkillRubricPreviewProps = {
  rubricId: SkillRubricId;
  customSkillIds?: string[];
  customSkills?: import("@/lib/koaches/types").SkillDefinition[];
  skillLabelOverrides?: Record<string, string>;
  compact?: boolean;
  className?: string;
};

export function SkillRubricPreview({
  rubricId,
  customSkillIds,
  customSkills,
  skillLabelOverrides,
  compact = false,
  className,
}: SkillRubricPreviewProps) {
  const [expanded, setExpanded] = useState(!compact);
  const resolvedSkills = resolveSkills({ rubricId, customSkillIds, customSkills, skillLabelOverrides });
  const breakdown = useMemo(() => {
    const groups = new Map<string, typeof resolvedSkills>();
    for (const skill of resolvedSkills) {
      const label = SKILL_CATEGORY_LABELS[skill.category];
      const list = groups.get(label) ?? [];
      list.push(skill);
      groups.set(label, list);
    }
    return [...groups.entries()].map(([category, skills]) => ({ category, skills }));
  }, [resolvedSkills]);
  const skillCount = resolvedSkills.length;

  return (
    <div className={cn("rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]", className)}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
          <ClipboardList className="h-5 w-5 text-[#166534]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-[#111827]">Program skills</p>
          <p className="text-xs text-[#6B7280]">
            {skillCount} skills · {breakdown.length} categories
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-[#6B7280]" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[#6B7280]" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-[#E5E7EB] px-4 pb-4">
          <p className="pt-3 text-[10px] font-semibold tracking-wide text-[#6B7280] uppercase">
            Skills & 0-5 rating guide
          </p>
          {breakdown.map((section) => (
            <div key={section.category} className="rounded-lg bg-white p-3 shadow-sm">
              <p className="font-heading text-xs font-semibold text-[#14532D]">{section.category}</p>
              <ul className="mt-2 space-y-3">
                {section.skills.map((skill) => (
                  <li key={skill.id}>
                    <p className="text-sm font-medium text-[#374151]">{skill.name}</p>
                    <SkillScoreGuideToggle
                      skillId={skill.id}
                      category={skill.category}
                      overrides={skillLabelOverrides}
                      className="mt-2"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
