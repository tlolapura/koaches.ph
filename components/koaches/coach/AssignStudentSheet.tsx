"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useMemo, useState } from "react";
import type { Program } from "@/lib/koaches/types";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { enrollStudentInProgramAction } from "@/lib/koaches/actions/programs";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { notifyRosterUpdated } from "@/hooks/useCoachStudents";
import { crudToast } from "@/lib/koaches/crud-toast";
import { invalidateCoachProgram } from "@/lib/koaches/queries/invalidate";

const FORM_ID = "assign-student-form";

type AssignStudentSheetProps = {
  open: boolean;
  onClose: () => void;
  program: Program;
  onAssigned: () => void;
};

export function AssignStudentSheet({ open, onClose, program, onAssigned }: AssignStudentSheetProps) {
  const coachId = usePortalCoachId();
  const { students } = useCoachStudents(coachId);
  const { showToast } = useCoachToast();
  const [assigning, setAssigning] = useState(false);

  const options = useMemo(
    () =>
      students
        .filter((s) => !s.isArchived && !program.enrolledStudentIds.includes(s.id))
        .map((s) => ({ value: s.id, label: s.name })),
    [students, program.enrolledStudentIds]
  );

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Assign student"
      subtitle={`Add a student to ${program.name}`}
      footer={
        <CoachSheetFooter>
          <CoachButton type="submit" form={FORM_ID} loading={assigning} loadingLabel="Assigning…" disabled={options.length === 0}>
            Assign
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      {options.length === 0 ? (
        <p className="text-sm text-[#6B7280]">All active students are already enrolled.</p>
      ) : (
        <form
          id={FORM_ID}
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const studentId = String(fd.get("studentId") ?? "");
            if (!studentId) return;
            setAssigning(true);
            try {
              await enrollStudentInProgramAction(program.id, studentId);
              notifyRosterUpdated(coachId);
              invalidateCoachProgram(program.id);
              onAssigned();
              showToast(crudToast.updated("Program enrollment"));
              onClose();
            } catch {
              showToast(crudToast.failed("assign student"), "error");
            } finally {
              setAssigning(false);
            }
          }}
        >
          <CoachSheetField label="Student">
            <CoachSelect name="studentId" required defaultValue="" options={[{ value: "", label: "Select…" }, ...options]} />
          </CoachSheetField>
        </form>
      )}
    </CoachBottomSheet>
  );
}
