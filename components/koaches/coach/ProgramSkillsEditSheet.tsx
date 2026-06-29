"use client";

import { useEffect, useState } from "react";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  programSkillsFromProgram,
  SkillRubricPicker,
  type SkillRubricPickerValue,
} from "@/components/koaches/coach/SkillRubricPicker";
import { updateProgramSkillsAction } from "@/lib/koaches/actions/programs";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import type { Program } from "@/lib/koaches/types";

type ProgramSkillsEditSheetProps = {
  open: boolean;
  onClose: () => void;
  program: Program;
  onSaved?: () => void;
};

export function ProgramSkillsEditSheet({
  open,
  onClose,
  program,
  onSaved,
}: ProgramSkillsEditSheetProps) {
  const { showToast } = useCoachToast();
  const [value, setValue] = useState<SkillRubricPickerValue>(() => programSkillsFromProgram(program));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValue(programSkillsFromProgram(program));
  }, [open, program]);

  const handleSave = async () => {
    if (value.customSkillIds.length === 0) {
      showToast("Pick at least one skill", "error");
      return;
    }
    setSaving(true);
    try {
      await updateProgramSkillsAction(program.id, {
        rubricId: "custom",
        customSkillIds: value.customSkillIds,
        customSkills: value.customSkills,
        skillLabelOverrides: value.skillLabelOverrides,
      });
      showToast("Program skills saved");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save skills", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CoachBottomSheet open={open} onClose={onClose} title="Edit program skills">
      <SkillRubricPicker
        value={value}
        onChange={setValue}
        hint="Pick catalog skills, add your own per category, or rename anything."
      />

      <CoachSheetFooter>
        <CoachButton type="button" className="w-full" loading={saving} onClick={() => void handleSave()}>
          Save program skills
        </CoachButton>
      </CoachSheetFooter>
    </CoachBottomSheet>
  );
}
