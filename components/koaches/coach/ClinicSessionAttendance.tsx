"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session, SessionAttendanceEntry, Student } from "@/lib/koaches/types";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { InitialsAvatar, useCoachToast } from "@/components/koaches/coach/CoachUi";
import { useClinicMutations } from "@/hooks/useCoachClinics";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { defaultAttendanceForStudents } from "@/lib/koaches/clinic-pricing";
import { cn } from "@/lib/utils";

type ClinicSessionAttendanceProps = {
  session: Session;
};

function mergeAttendance(
  studentIds: string[],
  existing: SessionAttendanceEntry[] | undefined
): SessionAttendanceEntry[] {
  const defaults = defaultAttendanceForStudents(studentIds);
  return defaults.map((entry) => {
    const prior = existing?.find((a) => a.studentId === entry.studentId);
    return prior ?? entry;
  });
}

export function ClinicSessionAttendance({ session }: ClinicSessionAttendanceProps) {
  const clinicId = session.clinicId ?? "";
  const mutations = useClinicMutations(session.coachId, clinicId);
  const { students } = useCoachStudents(session.coachId);
  const { showToast } = useCoachToast();

  const rosterIds = useMemo(() => {
    if (session.attendance?.length) {
      return session.attendance.map((a) => a.studentId);
    }
    return session.participants
      .map((p) => p.studentId)
      .filter((id): id is string => Boolean(id));
  }, [session.attendance, session.participants]);

  const [attendance, setAttendance] = useState<SessionAttendanceEntry[]>(() =>
    mergeAttendance(rosterIds, session.attendance)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAttendance(mergeAttendance(rosterIds, session.attendance));
  }, [rosterIds, session.attendance, session.id]);

  const byId = useMemo(() => {
    const map = new Map<string, Student>();
    for (const s of students) map.set(s.id, s);
    return map;
  }, [students]);

  const presentCount = attendance.filter((a) => a.present).length;

  const toggle = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, present: !a.present } : a))
    );
  };

  const handleSave = async () => {
    if (!clinicId) return;
    setSaving(true);
    try {
      await mutations.saveAttendance.mutateAsync({
        sessionId: session.id,
        attendance,
      });
      showToast("Attendance saved");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  if (rosterIds.length === 0) {
    return (
      <div className="coach-card p-4">
        <p className="font-heading text-sm font-semibold text-[#111827]">Attendance</p>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          No players enrolled yet. Add them on the clinic roster first.
        </p>
      </div>
    );
  }

  return (
    <div className="coach-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-heading text-sm font-semibold text-[#111827]">Attendance</p>
        <span className="text-xs font-semibold text-[#6B7280]">
          {presentCount}/{attendance.length} present
        </span>
      </div>
      <p className="mt-1 text-xs text-[#9CA3AF]">Tap to mark present or no-show.</p>

      <ul className="mt-3 space-y-2">
        {attendance.map((entry) => {
          const student = byId.get(entry.studentId);
          const name = student?.name ?? "Player";
          return (
            <li key={entry.studentId}>
              <button
                type="button"
                onClick={() => toggle(entry.studentId)}
                className={cn(
                  "flex w-full min-h-[48px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                  entry.present
                    ? "border-[#BBF7D0] bg-[#F0FDF4]"
                    : "border-[#FECACA] bg-[#FEF2F2]"
                )}
              >
                <InitialsAvatar name={name} size="sm" />
                <span className="min-w-0 flex-1 font-heading text-sm font-semibold text-[#111827]">
                  {name}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold uppercase",
                    entry.present ? "text-[#166534]" : "text-[#B91C1C]"
                  )}
                >
                  {entry.present ? "Present" : "No-show"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <CoachButton
        type="button"
        className="mt-4 w-full"
        loading={saving}
        onClick={() => void handleSave()}
      >
        Save attendance
      </CoachButton>
    </div>
  );
}
