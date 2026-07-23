"use client";

import { useState } from "react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import type { Student } from "@/lib/koaches/types";
import {
  coachingLevelFromDupr,
  defaultDuprForCoachingLevel,
  STUDENT_COACHING_LEVEL_SELECT_OPTIONS,
  type CoachingLevelId,
} from "@/lib/koaches/application-form";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { updateStudentProfileAction } from "@/lib/koaches/actions/students";
import { notifyRosterUpdated } from "@/hooks/useCoachStudents";
import { invalidateCoachPrograms } from "@/lib/koaches/queries/invalidate";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { crudToast } from "@/lib/koaches/crud-toast";

const FORM_ID = "edit-student-form";

type EditStudentSheetProps = {
  open: boolean;
  onClose: () => void;
  student: Student;
};

export function EditStudentSheet({ open, onClose, student }: EditStudentSheetProps) {
  const coachId = usePortalCoachId();
  const { programs } = useCoachPrograms(coachId);
  const { showToast } = useCoachToast();
  const [saving, setSaving] = useState(false);

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Edit student"
      subtitle="Update contact info and program"
      footer={
        <CoachSheetFooter>
          <CoachButton type="submit" form={FORM_ID} loading={saving} loadingLabel="Saving…">
            Save changes
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <form
        key={student.id}
        id={FORM_ID}
        className="coach-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            const fd = new FormData(e.currentTarget);
            const coachingLevel = String(fd.get("coachingLevel") ?? coachingLevelFromDupr(student.skillLevel)) as CoachingLevelId;
            await updateStudentProfileAction(student.id, {
              firstName: String(fd.get("firstName") ?? ""),
              lastName: String(fd.get("lastName") ?? ""),
              mobile: String(fd.get("mobile") ?? ""),
              email: String(fd.get("email") ?? ""),
              skillLevel: defaultDuprForCoachingLevel(coachingLevel),
              programId: String(fd.get("programId") ?? "") || undefined,
            });
            notifyRosterUpdated(coachId);
            invalidateCoachPrograms(coachId);
            showToast(crudToast.updated("Student"));
            onClose();
          } catch (err) {
            showToast(err instanceof Error ? err.message : crudToast.failed("update student"), "error");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="First name *">
            <input
              className="coach-input"
              name="firstName"
              required
              defaultValue={student.firstName}
              autoComplete="given-name"
            />
          </CoachSheetField>
          <CoachSheetField label="Last name *">
            <input
              className="coach-input"
              name="lastName"
              required
              defaultValue={student.lastName}
              autoComplete="family-name"
            />
          </CoachSheetField>
        </div>
        <CoachSheetField label="Mobile number">
          <input className="coach-input" name="mobile" defaultValue={student.mobile} />
        </CoachSheetField>
        <CoachSheetField label="Email">
          <input className="coach-input" name="email" type="email" defaultValue={student.email} />
        </CoachSheetField>
        <CoachSheetField label="Program">
          <CoachSelect
            name="programId"
            defaultValue={student.programId ?? ""}
            options={[
              { value: "", label: "None (drop-in)" },
              ...programs.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </CoachSheetField>
        <CoachSheetField label="Player level">
          <CoachSelect
            name="coachingLevel"
            defaultValue={coachingLevelFromDupr(student.skillLevel)}
            options={STUDENT_COACHING_LEVEL_SELECT_OPTIONS}
          />
        </CoachSheetField>
      </form>
    </CoachBottomSheet>
  );
}
