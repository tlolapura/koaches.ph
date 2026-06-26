"use client";

import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useState } from "react";
import type { SkillRubricId } from "@/lib/koaches/types";
import {
  getRubric,
  getRubricCategoryBreakdown,
  getRubricSkillCount,
} from "@/lib/koaches/program-templates";
import { cn } from "@/lib/utils";

type SkillRubricPreviewProps = {
  rubricId: SkillRubricId;
  customSkillIds?: string[];
  compact?: boolean;
  className?: string;
};

export function SkillRubricPreview({
  rubricId,
  customSkillIds,
  compact = false,
  className,
}: SkillRubricPreviewProps) {
  const [expanded, setExpanded] = useState(!compact);
  const rubric = rubricId !== "custom" ? getRubric(rubricId) : null;
  const breakdown = getRubricCategoryBreakdown(rubricId, customSkillIds);
  const skillCount = getRubricSkillCount(rubricId, customSkillIds);

  return (
    <div className={cn("rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]", className)}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDEEE9]">
          <ClipboardList className="h-5 w-5 text-[#8B4D3A]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold text-[#111827]">
            {rubricId === "custom" ? "Custom Rubric" : `${rubric?.name} Rubric`}
          </p>
          <p className="text-xs text-[#6B7280]">
            {skillCount} skills · {breakdown.length} categories
            {rubric && ` · ${rubric.duprRange} DUPR`}
          </p>
          {!compact && rubric && (
            <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{rubric.description}</p>
          )}
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
            Skill questionnaire preview
          </p>
          {breakdown.map((section) => (
            <div key={section.category} className="rounded-lg bg-white p-3 shadow-sm">
              <p className="font-heading text-xs font-semibold text-[#1E3A5F]">{section.category}</p>
              <ul className="mt-2 space-y-1.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#E5E7EB] text-[9px] font-medium text-[#9CA3AF]">
                      1–5
                    </span>
                    {item}
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
