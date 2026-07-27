"use client";

import { useState } from "react";
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
import { getSkillsForRubric } from "@/lib/koaches/constants";
import type { CoachProfile, SkillRubricId } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

type DropInSkillsSheetProps = {
  open: boolean;
  onClose: () => void;
  coach: CoachProfile;
  onSaved?: () => void;
  /** @deprecated No longer used — skills open on the checklist directly. */
  forcePick?: boolean;
};

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
  // First setup: start blank so coaches pick skills themselves.
  return emptySkills();
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
}: DropInSkillsSheetProps) {
  const { showToast } = useCoachToast();
  const [value, setValue] = useState<SkillRubricPickerValue>(() => initialValue(coach));
  const [saving, setSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setValue(initialValue(coach));
    }
  }

  const applyQuickSet = (id: Exclude<SkillRubricId, "custom">) => {
    setValue({
      rubricId: id,
      customSkillIds: getSkillsForRubric(id).map((s) => s.id),
      customSkills: [],
      skillLabelOverrides: {},
    });
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
      title="Skills you score"
      subtitle="Check every skill you want to rate after a session"
      wide
      footer={
        <CoachSheetFooter>
          <CoachButton
            type="button"
            className="w-full"
            loading={saving}
            loadingLabel="Saving…"
            disabled={count === 0}
            onClick={() => void handleSave()}
          >
            Save · {count} skill{count === 1 ? "" : "s"}
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Optional quick start</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Tap a set to check those skills. You can still change any checkbox below.
          </p>
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
                onClick={() => setValue(emptySkills())}
                className="min-h-10 rounded-full px-3.5 text-sm font-semibold text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        <SkillRubricPicker
          key={open ? `skills-${coach.id}` : "closed"}
          value={value}
          onChange={setValue}
          hint="Open a group, then check the skills you use."
          defaultExpanded
        />
      </div>
    </CoachBottomSheet>
  );
}
