"use client";

import type { SessionParticipant, Student } from "@/lib/koaches/types";
import { newParticipantId, resizeParticipants } from "@/lib/koaches/session-participants";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { CoachStudentSearchSelect } from "@/components/koaches/coach/CoachStudentSearchSelect";

type SessionParticipantsFieldsProps = {
  playerCount: number;
  participants: SessionParticipant[];
  roster: Student[];
  onChange: (participants: SessionParticipant[]) => void;
};

function rosterForRow(roster: Student[], rows: SessionParticipant[], index: number) {
  const usedElsewhere = new Set(
    rows
      .filter((_, i) => i !== index)
      .map((r) => r.studentId)
      .filter(Boolean) as string[]
  );
  return roster.filter((s) => !usedElsewhere.has(s.id));
}

export function SessionParticipantsFields({
  playerCount,
  participants,
  roster,
  onChange,
}: SessionParticipantsFieldsProps) {
  const rows = resizeParticipants(participants, playerCount);

  const setRowStudent = (index: number, studentId: string) => {
    const student = roster.find((s) => s.id === studentId);
    if (!student) return;
    onChange(
      rows.map((row, i) =>
        i === index
          ? { ...row, studentId: student.id, name: student.name }
          : row
      )
    );
  };

  if (playerCount <= 1) {
    const studentId = rows[0]?.studentId ?? "";
    return (
      <CoachSheetField
        label="Who's playing?"
        hint="Pick from your roster. New players join via your intake link first."
      >
        <CoachStudentSearchSelect
          students={roster}
          value={studentId ? [studentId] : []}
          onChange={(ids) => {
            const id = ids[0];
            if (!id) {
              onChange([{ id: newParticipantId(), name: "", studentId: undefined }]);
              return;
            }
            setRowStudent(0, id);
          }}
          multiple={false}
          max={1}
          placeholder="Search students…"
        />
      </CoachSheetField>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="coach-label mb-0">Who&apos;s playing?</p>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          {playerCount} players · pick from your roster
        </p>
      </div>
      {rows.map((row, index) => {
        const available = rosterForRow(roster, rows, index);
        // Keep the current selection visible even if filtered from "available"
        const current = roster.find((s) => s.id === row.studentId);
        const optionsRoster = current
          ? [current, ...available.filter((s) => s.id !== current.id)]
          : available;

        return (
          <div key={row.id} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3">
            <p className="mb-2 text-xs font-semibold text-[#374151]">Player {index + 1}</p>
            <CoachStudentSearchSelect
              students={optionsRoster}
              value={row.studentId ? [row.studentId] : []}
              onChange={(ids) => {
                const id = ids[0];
                if (!id) {
                  onChange(
                    rows.map((r, i) =>
                      i === index ? { ...r, studentId: undefined, name: "" } : r
                    )
                  );
                  return;
                }
                setRowStudent(index, id);
              }}
              multiple={false}
              max={1}
              placeholder="Search students…"
            />
          </div>
        );
      })}
    </div>
  );
}
