"use client";

import { useEffect, useState } from "react";
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
import type { CoachProfile } from "@/lib/koaches/types";

type DropInSkillsSheetProps = {
  open: boolean;
  onClose: () => void;
  coach: CoachProfile;
  onSaved?: () => void;
};

export function DropInSkillsSheet({ open, onClose, coach, onSaved }: DropInSkillsSheetProps) {
  const { showToast } = useCoachToast();
  const [value, setValue] = useState<SkillRubricPickerValue>(() => dropInSkillsFromCoach(coach));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(dropInSkillsFromCoach(coach));
  }, [open, coach]);

  const handleSave = async () => {
    if (value.customSkillIds.length === 0) {
      showToast("Pick at least one skill", "error");
      return;
    }
    setSaving(true);
    try {
      await updateDropInSkillsAction(coach.id, {
        skillTemplateId: coach.skillTemplateId,
        customSkillIds: value.customSkillIds,
        customSkills: value.customSkills,
        skillLabelOverrides: value.skillLabelOverrides,
      });
      showToast("Drop-in skills saved");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save skills", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CoachBottomSheet open={open} onClose={onClose} title="Drop-in skills">
      <SkillRubricPicker
        value={value}
        onChange={setValue}
        hint="Pick catalog skills, add your own per category, or rename anything to match how you coach."
      />

      <CoachSheetFooter>
        <CoachButton type="button" className="w-full" loading={saving} onClick={() => void handleSave()}>
          Save drop-in skills
        </CoachButton>
      </CoachSheetFooter>
    </CoachBottomSheet>
  );
}
