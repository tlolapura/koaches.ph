"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Student } from "@/lib/koaches/types";
import { courtNameFromLookup, useCoachCourts } from "@/hooks/useCourts";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { formatSessionTimeRange } from "@/lib/koaches/session-time";
import { formatSessionDateLabel } from "@/lib/koaches/session-schedule";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { StudentProgressTab } from "@/components/koaches/coach/StudentProgressTab";
import {
  DuprChip,
  InitialsAvatar,
  MilestoneBadges,
  ProgressBar,
  SessionDisplayStatusBadge,
  useCoachToast,
} from "@/components/koaches/coach/CoachUi";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { useStudentSessions } from "@/hooks/useCoachSessions";
import { archiveStudentAction, updateStudentNotesAction } from "@/lib/koaches/actions/students";
import { notifyRosterUpdated } from "@/hooks/useCoachStudents";
import { crudToast } from "@/lib/koaches/crud-toast";
import type { Session } from "@/lib/koaches/types";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import {
  CoachBackLink,
  CoachEntityTitle,
  CoachPageShell,
} from "@/components/koaches/coach/CoachPageLayout";

const tabs = ["Progress", "Sessions", "Notes"] as const;

function StudentSessionStatusBadge({ session }: { session: Session }) {
  const { displayStatus } = useSessionStatus(session);
  return <SessionDisplayStatusBadge status={displayStatus} />;
}

export function StudentProfileView({ student }: { student: Student }) {
  const coachId = usePortalCoachId();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Progress");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [note, setNote] = useState(student.notes ?? "");
  const { showToast } = useCoachToast();

  const { programs } = useCoachPrograms(coachId);
  const { courts } = useCoachCourts(coachId);
  const courtLookup = useMemo(() => new Map(courts.map((c) => [c.id, c])), [courts]);
  const program = student.programId ? programs.find((p) => p.id === student.programId) : undefined;
  const { sessions } = useStudentSessions(coachId, student.id);
  const completed = sessions.filter((s) => s.status === "done");
  const upcoming = sessions.find((s) => s.status === "upcoming");

  return (
    <CoachPageShell>
      <div className="flex items-center justify-between">
        <CoachBackLink href="/coach/students" label="Students" className="hidden md:inline-flex" />
        <button
          type="button"
          onClick={() => setArchiveOpen(true)}
          className="text-sm font-medium text-[#6B7280]"
        >
          Archive
        </button>
      </div>

      <div className="coach-card mt-4 p-5">
        <div className="flex items-center gap-4">
          <InitialsAvatar name={student.name} size="lg" />
          <div>
            <CoachEntityTitle>{student.name}</CoachEntityTitle>
            <div className="mt-2"><DuprChip level={student.skillLevel} /></div>
            <p className="mt-2 text-sm text-[#6B7280]">{student.email}</p>
            <p className="text-sm text-[#6B7280]">{student.mobile}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Enrolled {formatDate(student.enrolledDate)}</p>
          </div>
        </div>
      </div>

      {program && (
        <div className="coach-card mt-4 p-4">
          <p className="font-heading font-semibold">{program.name}</p>
          <p className="mt-1 font-heading text-lg font-semibold">
            Session {student.sessionsCompleted} of {program.sessionCount}
          </p>
          <ProgressBar value={student.sessionsCompleted} max={program.sessionCount} className="mt-3" />
          <div className="mt-3">
            <MilestoneBadges current={student.sessionsCompleted} total={program.sessionCount} />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {upcoming && (
          <Link
            href={`/coach/sessions/${upcoming.id}`}
            className="coach-btn-primary flex-1 text-center text-sm"
          >
            Rate next session
          </Link>
        )}
        <button
          type="button"
          onClick={() => setTab("Notes")}
          className="coach-btn-outline flex-1 text-sm"
        >
          Add note
        </button>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-[#E5E7EB]">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "font-heading shrink-0 px-4 py-3 text-sm font-semibold",
              tab === t ? "border-b-2 border-[#E07A5F] text-[#111827]" : "text-[#6B7280]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Progress" && (
          <StudentProgressTab student={student} upcomingSessionId={upcoming?.id} />
        )}

        {tab === "Sessions" && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-center text-sm text-[#6B7280]">No sessions yet.</p>
            ) : (
              sessions.map((s) => (
                <Link key={s.id} href={`/coach/sessions/${s.id}`} className="coach-card block p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-semibold">
                        {s.sessionNumber ? `Session ${s.sessionNumber}` : "Drop-in"} ·{" "}
                        {formatSessionDateLabel(s)}
                      </p>
                      <p className="text-sm text-[#6B7280]">
                        {formatSessionTimeRange(s.time, s.endTime)} · {formatCurrency(s.price)}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">{courtNameFromLookup(courtLookup, s.courtId)}</p>
                      {s.notes && <p className="mt-2 text-sm text-[#6B7280]">{s.notes}</p>}
                    </div>
                    <StudentSessionStatusBadge session={s} />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {tab === "Notes" && (
          <div className="space-y-4">
            <div className="coach-card p-4">
              <textarea
                className="coach-input min-h-[100px] resize-none"
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                type="button"
                className="coach-btn-primary mt-3"
                onClick={async () => {
                  await updateStudentNotesAction(student.id, note);
                  notifyRosterUpdated(coachId);
                  showToast(crudToast.saved("Note"));
                  setNote("");
                }}
              >
                Save Note
              </button>
            </div>
            {completed
              .filter((s) => s.notes)
              .map((s) => (
                <div key={s.id} className="coach-card p-4">
                  <p className="text-xs font-medium text-[#6B7280]">{formatSessionDateLabel(s)}</p>
                  <p className="mt-1 text-sm">{s.notes}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      <ConfirmSheet
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        message={`Archive ${student.name}?`}
        confirmLabel="Archive"
        onConfirm={async () => {
          await archiveStudentAction(student.id);
          notifyRosterUpdated(coachId);
          showToast(crudToast.deleted("Student"));
          setArchiveOpen(false);
        }}
      />
    </CoachPageShell>
  );
}
