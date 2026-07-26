"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SkillCategory } from "@/lib/koaches/types";
import {
  type SkillScore,
  scoreLabelsForSkill,
  scoreOverrideKey,
} from "@/lib/koaches/skill-progress-display";
import { cn } from "@/lib/utils";

const SCORES = [0, 1, 2, 3, 4, 5] as const;

/**
 * Compact, collapsible "What 0–5 means" panel for one skill.
 * Collapsed by default; expanding shows the meanings, and (when editable)
 * an Edit link that turns the same rows into inputs in place.
 */
export function SkillScoreMeanings({
  skillId,
  category,
  overrides,
  onChangeOverrides,
  className,
}: {
  skillId: string;
  category?: SkillCategory;
  overrides: Record<string, string>;
  /** Omit to render read-only. */
  onChangeOverrides?: (next: Record<string, string>) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<SkillScore, string>>(() =>
    scoreLabelsForSkill(skillId, category, overrides)
  );

  const labels = scoreLabelsForSkill(skillId, category, overrides);
  const edited = SCORES.some((s) => overrides[scoreOverrideKey(skillId, s)]?.trim());

  const startEdit = () => {
    setDraft(labels);
    setEditing(true);
  };

  const save = () => {
    if (onChangeOverrides) {
      const defaults = scoreLabelsForSkill(skillId, category);
      const next = { ...overrides };
      for (const score of SCORES) {
        const key = scoreOverrideKey(skillId, score);
        const custom = draft[score]?.trim();
        if (!custom || custom === defaults[score]) {
          delete next[key];
        } else {
          next[key] = custom;
        }
      }
      onChangeOverrides(next);
    }
    setEditing(false);
  };

  return (
    <div className={cn("mt-2", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setEditing(false);
        }}
        aria-expanded={open}
        className={cn(
          "flex min-h-[32px] w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-[11px] font-semibold",
          open ? "bg-[#F3F4F6] text-[#111827]" : "bg-[#F9FAFB] text-[#6B7280]"
        )}
      >
        <span>
          What each rating means
          {edited ? <span className="ml-1.5 font-medium text-[#4F8FF7]">· edited</span> : null}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="mt-1.5 space-y-1 rounded-lg border border-[#E5E7EB] bg-white p-2.5">
          {editing ? (
            <>
              {SCORES.map((score) => (
                <label
                  key={`${skillId}-${score}`}
                  className="flex items-center gap-2 text-[11px] text-[#6B7280]"
                >
                  <span className="w-4 shrink-0 text-center font-semibold text-[#111827]">
                    {score}
                  </span>
                  <input
                    value={draft[score]}
                    onChange={(e) => setDraft((prev) => ({ ...prev, [score]: e.target.value }))}
                    className="coach-input h-8 flex-1 px-2 py-1 text-xs"
                  />
                </label>
              ))}
              <div className="flex gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={save}
                  className="min-h-[36px] flex-1 rounded-lg bg-[#111827] text-xs font-semibold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="min-h-[36px] rounded-lg border border-[#E5E7EB] px-3 text-xs font-semibold text-[#6B7280]"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {SCORES.map((score) => (
                <p key={`${skillId}-${score}`} className="text-[11px] leading-snug text-[#6B7280]">
                  <span className="font-semibold text-[#111827]">{score}</span>
                  <span className="text-[#9CA3AF]"> · </span>
                  {labels[score]}
                </p>
              ))}
              {onChangeOverrides ? (
                <button
                  type="button"
                  onClick={startEdit}
                  className="mt-1 min-h-[32px] w-full rounded-lg border border-dashed border-[#D1D5DB] text-[11px] font-semibold text-[#4F8FF7]"
                >
                  Edit meanings
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
