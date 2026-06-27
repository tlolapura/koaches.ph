"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, UserCheck, Users, X } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { DUPR_LEVELS } from "@/lib/koaches/constants";
import { approveIntakeAction, fetchIntakeSubmissionsAction, rejectIntakeAction } from "@/lib/koaches/actions/intake";
import { createStudentAction } from "@/lib/koaches/actions/students";
import { notifyRosterUpdated, useCoachStudents } from "@/hooks/useCoachStudents";
import {
  CoachFab,
  DuprChip,
  EmptyState,
  InitialsAvatar,
  ProgressBar,
  SessionTypeBadge,
  useCoachToast,
} from "@/components/koaches/coach/CoachUi";
import { CoachBottomSheet, ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSearchInput } from "@/components/koaches/coach/CoachSearchInput";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachStudentListSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { ProgressCardReadySection } from "@/components/koaches/coach/ProgressCardReadySection";
import { GenerateProgressCardSheet } from "@/components/koaches/coach/GenerateProgressCardSheet";
import { useProgressCards } from "@/hooks/useProgressCards";
import { crudToast } from "@/lib/koaches/crud-toast";
import { cn, formatDisplayDate } from "@/lib/utils";

const ADD_STUDENT_FORM_ID = "add-student-form";

type Filter = "all" | "active" | "archived" | "pending";

export default function StudentsPage() {
  const coachId = usePortalCoachId();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { showToast } = useCoachToast();
  const { students: rosterStudents, loading } = useCoachStudents(coachId, true);
  const [savingStudent, setSavingStudent] = useState(false);
  const [declineTarget, setDeclineTarget] = useState<{ id: string; name: string } | null>(null);

  const [pendingVersion, setPendingVersion] = useState(0);
  const refreshPending = useCallback(() => setPendingVersion((v) => v + 1), []);

  useEffect(() => {
    window.addEventListener("koaches-intake-updated", refreshPending);
    window.addEventListener("koaches-roster-updated", refreshPending);
    return () => {
      window.removeEventListener("koaches-roster-updated", refreshPending);
      window.removeEventListener("storage", refreshPending);
      window.removeEventListener("koaches-intake-updated", refreshPending);
    };
  }, [refreshPending]);

  const [pendingIntakesList, setPendingIntakesList] = useState<Awaited<ReturnType<typeof fetchIntakeSubmissionsAction>>>([]);

  useEffect(() => {
    if (!coachId) return;
    void fetchIntakeSubmissionsAction(coachId)
      .then((list) => setPendingIntakesList(list.filter((s) => s.status === "pending")))
      .catch(() => setPendingIntakesList([]));
  }, [coachId, pendingVersion]);

  const pendingIntakes = pendingIntakesList;

  const rosterForFilter = useMemo(() => {
    if (filter === "pending") return [];
    return rosterStudents.filter((s) => {
      if (filter === "active" && s.isArchived) return false;
      if (filter === "archived" && !s.isArchived) return false;
      return true;
    });
  }, [filter, rosterStudents]);

  const students = useMemo(() => {
    if (filter === "pending") return [];
    const q = search.trim().toLowerCase();
    return rosterForFilter.filter((s) => !q || s.name.toLowerCase().includes(q));
  }, [filter, search, rosterForFilter]);

  const emptyRosterState = useMemo(() => {
    if (filter === "pending") return null;
    const q = search.trim();
    if (q && rosterForFilter.length > 0 && students.length === 0) {
      return {
        title: "No matches",
        description: `No students match "${search}".`,
        action: (
          <button type="button" onClick={() => setSearch("")} className="coach-btn-outline max-w-xs">
            Clear search
          </button>
        ),
      };
    }
    if (filter === "archived") {
      return {
        title: "No archived students",
        description: "Students you archive will appear here.",
      };
    }
    if (filter === "active" && rosterStudents.length > 0 && rosterForFilter.length === 0) {
      return {
        title: "No active students",
        description: "All students on your roster are archived.",
      };
    }
    return {
      title: "No students yet",
      description: "Add a student manually to get started.",
      action: (
        <button type="button" onClick={() => setAddOpen(true)} className="coach-btn-outline max-w-xs">
          Add manually
        </button>
      ),
    };
  }, [filter, search, rosterForFilter.length, rosterStudents.length, students.length]);

  const { programs } = useCoachPrograms(coachId);
  const { sessions: allSessions } = useCoachSessions(coachId);
  const { candidates } = useProgressCards(coachId);
  const [generateTarget, setGenerateTarget] = useState<{
    sessionId: string;
    participantId: string;
  } | null>(null);

  const activeCandidate = candidates.find(
    (c) =>
      c.session.id === generateTarget?.sessionId &&
      c.participantId === generateTarget?.participantId
  );

  if (!coachId || (loading && rosterStudents.length === 0)) {
    return <CoachStudentListSkeleton />;
  }

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Students"
        subtitle="Roster and session progress"
      />

      <div className="sticky top-14 z-20 -mx-4 mt-4 bg-[#FAFAF8]/95 px-4 py-3 backdrop-blur md:top-0 md:mt-6">
        <CoachSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search students..."
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(["all", "active", "pending", "archived"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "font-heading shrink-0 rounded-full px-4 py-2 text-xs font-semibold capitalize min-h-[36px]",
                filter === f ? "bg-[#16A34A] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"
              )}
            >
              {f}
              {f === "pending" && pendingIntakes.length > 0 && ` (${pendingIntakes.length})`}
            </button>
          ))}
        </div>
      </div>

      {filter !== "pending" && candidates.length > 0 && (
        <ProgressCardReadySection
          className="mt-4"
          candidates={candidates}
          onGenerate={(sessionId, participantId) =>
            setGenerateTarget({ sessionId, participantId })
          }
        />
      )}

      {filter === "pending" ? (
        pendingIntakes.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No pending sign-ups"
            description="Students who complete your intake form will show up here."
          />
        ) : (
          <div className="mt-4 space-y-3">
            {pendingIntakes.map((s) => (
              <div key={s.id} className="coach-card border-[#16A34A]/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]">
                    <Clock className="h-5 w-5 text-[#166534]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold">{s.name}</p>
                    <p className="text-sm text-[#6B7280]">{s.mobile} · {s.email}</p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      DUPR {s.skillLevel} · waiver signed {formatDisplayDate(s.submittedAt)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="coach-btn-primary w-auto flex-1 py-2 text-xs"
                        onClick={async () => {
                          try {
                            await approveIntakeAction(coachId, s.id);
                            notifyRosterUpdated(coachId);
                            refreshPending();
                            showToast(`${s.name} accepted`);
                          } catch (e) {
                            showToast(
                              e instanceof Error ? e.message : "Could not accept sign-up",
                              "error"
                            );
                          }
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="coach-btn-outline w-auto flex-1 gap-1 py-2 text-xs text-[#6B7280]"
                        onClick={() => setDeclineTarget({ id: s.id, name: s.name })}
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : students.length === 0 && emptyRosterState ? (
        <EmptyState
          icon={Users}
          title={emptyRosterState.title}
          description={emptyRosterState.description}
          action={emptyRosterState.action}
        />
      ) : (
        <div className="mt-4 space-y-3">
          {students.map((s, i) => {
            const prog = programs.find((p) => p.id === s.programId);
            const lastSession = allSessions
              .filter(
                (x) =>
                  x.status === "done" &&
                  (x.studentId === s.id || x.participants.some((p) => p.studentId === s.id))
              )
              .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
            return (
              <Link key={s.id} href={`/coach/students/${s.id}`} className="coach-card block p-4">
                <div className="flex items-start gap-3">
                  <InitialsAvatar name={s.name} variant={i % 2 === 0 ? "lime" : "navy"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold">{s.name}</p>
                    <div className="mt-1">
                      {prog ? <SessionTypeBadge type="program" /> : <SessionTypeBadge type="drop-in" />}
                      <span className="ml-2 text-xs text-[#6B7280]">{prog?.name ?? "Drop-in"}</span>
                    </div>
                    <div className="mt-2">
                      <DuprChip level={s.skillLevel} />
                    </div>
                    {prog && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-[#111827]">
                          Session {s.sessionsCompleted} of {prog.sessionCount}
                        </p>
                        <ProgressBar value={s.sessionsCompleted} max={prog.sessionCount} className="mt-1" />
                      </div>
                    )}
                    {lastSession && (
                      <p className="mt-2 text-xs text-[#6B7280]">Last session: {formatDisplayDate(lastSession.date!)}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <CoachFab onClick={() => setAddOpen(true)} label="Add student" />

      <CoachBottomSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Student"
        subtitle="Add a student to your roster"
        footer={
          <CoachSheetFooter>
            <CoachButton type="submit" form={ADD_STUDENT_FORM_ID} loading={savingStudent} loadingLabel="Saving…">
              Save Student
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <form
          id={ADD_STUDENT_FORM_ID}
          className="coach-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setSavingStudent(true);
            try {
              const fd = new FormData(e.currentTarget);
              await createStudentAction(coachId, {
                firstName: String(fd.get("firstName") ?? ""),
                lastName: String(fd.get("lastName") ?? ""),
                mobile: String(fd.get("mobile") ?? ""),
                email: String(fd.get("email") ?? ""),
                skillLevel: String(fd.get("skillLevel") ?? "3.0") as import("@/lib/koaches/types").DuprLevel,
                programId: String(fd.get("programId") ?? "") || undefined,
              });
              notifyRosterUpdated(coachId);
              showToast(crudToast.created("Student"));
              setAddOpen(false);
            } catch {
              showToast(crudToast.failed("add student"), "error");
            } finally {
              setSavingStudent(false);
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CoachSheetField label="First name *">
              <input className="coach-input" name="firstName" required placeholder="Juan" autoComplete="given-name" />
            </CoachSheetField>
            <CoachSheetField label="Last name *">
              <input className="coach-input" name="lastName" required placeholder="dela Cruz" autoComplete="family-name" />
            </CoachSheetField>
          </div>
          <CoachSheetField label="Mobile number">
            <input className="coach-input" name="mobile" placeholder="09171234567" />
          </CoachSheetField>
          <CoachSheetField label="Email">
            <input className="coach-input" name="email" type="email" placeholder="juan@email.com" />
          </CoachSheetField>
          <CoachSheetField label="Assign to program (optional)">
            <CoachSelect
              name="programId"
              defaultValue=""
              options={[
                { value: "", label: "None — Drop-in" },
                ...programs.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </CoachSheetField>
          <CoachSheetField label="Starting DUPR level">
            <CoachSelect
              name="skillLevel"
              defaultValue="3.0"
              options={DUPR_LEVELS.map((d) => ({
                value: d.level,
                label: `${d.level} — ${d.label}`,
              }))}
            />
          </CoachSheetField>
        </form>
      </CoachBottomSheet>

      <ConfirmSheet
        open={Boolean(declineTarget)}
        onClose={() => setDeclineTarget(null)}
        message={declineTarget ? `Decline sign-up from ${declineTarget.name}?` : ""}
        confirmLabel="Decline"
        onConfirm={async () => {
          if (!declineTarget) return;
          try {
            await rejectIntakeAction(coachId, declineTarget.id);
            refreshPending();
            showToast("Sign-up declined");
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Could not decline sign-up", "error");
          } finally {
            setDeclineTarget(null);
          }
        }}
      />

      {activeCandidate && (
        <GenerateProgressCardSheet
          open={!!generateTarget}
          onClose={() => setGenerateTarget(null)}
          session={activeCandidate.session}
          participantId={activeCandidate.participantId}
          onGenerated={() => setGenerateTarget(null)}
        />
      )}
    </CoachPageShell>
  );
}
