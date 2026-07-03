"use client";

import type { SessionParticipant, Student } from "@/lib/koaches/types";
import { newParticipantId, resizeParticipants } from "@/lib/koaches/session-participants";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";

type SessionParticipantsFieldsProps = {
  playerCount: number;
  participants: SessionParticipant[];
  roster: Student[];
  onChange: (participants: SessionParticipant[]) => void;
};

function rosterOptionsForRow(
  roster: Student[],
  rows: SessionParticipant[],
  index: number
) {
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
  if (playerCount <= 1) {
    const studentId = participants[0]?.studentId ?? roster[0]?.id ?? "";

    return (
      <CoachSheetField label="Player" hint="Progress reports are tied to students on your roster">
        <CoachSelect
          value={studentId}
          onChange={(id) => {
            const student = roster.find((s) => s.id === id);
            if (student) {
              onChange([{ id: newParticipantId(), name: student.name, studentId: student.id }]);
            }
          }}
          options={roster.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          required
        />
      </CoachSheetField>
    );
  }

  const rows = resizeParticipants(participants, playerCount);

  const updateRow = (index: number, student: Student) => {
    onChange(
      rows.map((row, i) =>
        i === index ? { ...row, studentId: student.id, name: student.name } : row
      )
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-[#6B7280]">Players ({playerCount})</p>
        <p className="mt-0.5 text-[10px] text-[#6B7280]">
          Pick from your roster — new players join via your intake link first
        </p>
      </div>
      {rows.map((row, index) => {
        const options = rosterOptionsForRow(roster, rows, index);

        return (
          <div key={row.id} className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3">
            <p className="text-xs font-semibold text-[#374151]">Player {index + 1}</p>
            <CoachSelect
              className="mt-2"
              value={row.studentId ?? ""}
              onChange={(id) => {
                const student = roster.find((s) => s.id === id);
                if (student) updateRow(index, student);
              }}
              placeholder="Select student"
              options={[
                { value: "", label: "Select student", disabled: true },
                ...options.map((s) => ({
                  value: s.id,
                  label: s.name,
                })),
              ]}
              required
            />
          </div>
        );
      })}
    </div>
  );
}
