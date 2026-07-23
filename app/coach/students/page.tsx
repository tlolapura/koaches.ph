"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock, UserCheck, Users, X } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { approveIntakeAction, fetchIntakeSubmissionsAction, rejectIntakeAction } from "@/lib/koaches/actions/intake";
import {
  coachingLevelFromDupr,
  defaultDuprForCoachingLevel,
  formatStudentCoachingLevelLabel,
  formatStudentLevelWithDuprHelper,
  STUDENT_COACHING_LEVEL_SELECT_OPTIONS,
  type CoachingLevelId,
} from "@/lib/koaches/application-form";
import { createStudentAction } from "@/lib/koaches/actions/students";
import { notifyRosterUpdated, useCoachStudents } from "@/hooks/useCoachStudents";
import {
  CoachFab,
  EmptyState,
  InitialsAvatar,
  ProgressBar,
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
import { getStudentSessionRatings } from "@/lib/koaches/session-progress";
import { GenerateProgressCardSheet } from "@/components/koaches/coach/GenerateProgressCardSheet";
import { useProgressCards } from "@/hooks/useProgressCards";
import { crudToast } from "@/lib/koaches/crud-toast";
import { cn, formatDisplayDate } from "@/lib/utils";

const ADD_STUDENT_FORM_ID = "add-student-form";

type StatusFilter = "all" | "active" | "archived" | "pending";

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-heading shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold min-h-[32px]",
        active ? "bg-[#16A34A] text-white" : "border border-[#E5E7EB] bg-white text-[#6B7280]"
      )}
    >
      {label}
    </button>
  );
}

export default function StudentsPage() {
  const coachId = usePortalCoachId();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const { showToast } = useCoachToast();
  const { students: rosterStudents } = useCoachStudents(coachId, true);
  const [savingStudent, setSavingStudent] = useState(false);
  const [declineTarget, setDeclineTarget] = useState<{ id: string; name: string } | null>(null);
  const [processingIntakeId, setProcessingIntakeId] = useState<string | null>(null);

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

  const rosterCounts = useMemo(() => {
    const active = rosterStudents.filter((s) => !s.isArchived).length;
    const archived = rosterStudents.filter((s) => s.isArchived).length;
    return {
      total: rosterStudents.length,
      active,
      archived,
      pending: pendingIntakes.length,
    };
  }, [rosterStudents, pendingIntakes.length]);

  const rosterForStatus = useMemo(() => {
    if (statusFilter === "pending") return [];
    return rosterStudents.filter((s) => {
      if (statusFilter === "active" && s.isArchived) return false;
      if (statusFilter === "archived" && !s.isArchived) return false;
      return true;
    });
  }, [statusFilter, rosterStudents]);

  const students = useMemo(() => {
    if (statusFilter === "pending") return [];
    const q = search.trim().toLowerCase();
    if (!q) return rosterForStatus;
    return rosterForStatus.filter((s) => s.name.toLowerCase().includes(q));
  }, [statusFilter, rosterForStatus, search]);

  const emptyRosterState = useMemo(() => {
    if (statusFilter === "pending") return null;
    const q = search.trim();
    if (q && rosterForStatus.length > 0 && students.length === 0) {
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
    if (statusFilter === "archived") {
      return {
        title: "No archived students",
        description: "Students you archive will appear here.",
      };
    }
    if (statusFilter === "active" && rosterStudents.length > 0 && rosterForStatus.length === 0) {
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
  }, [statusFilter, search, rosterForStatus.length, rosterStudents.length, students.length]);

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

  if (!coachId) {
    return <CoachStudentListSkeleton />;
  }

  const statusChips: { key: StatusFilter; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "all", label: "All" },
    {
      key: "pending",
      label: rosterCounts.pending > 0 ? `Pending (${rosterCounts.pending})` : "Pending",
    },
    { key: "archived", label: "Archived" },
  ];

  return (
    <CoachPageShell>
      <CoachPageHeader title="Students" subtitle="Everyone you're coaching right now" />

      <div className="mt-3 space-y-2">
        <CoachSearchInput value={search} onChange={setSearch} placeholder="Search students..." />
        <div className="flex flex-wrap gap-2">
          {statusChips.map(({ key, label }) => (
            <FilterChip
              key={key}
              active={statusFilter === key}
              label={label}
              onClick={() => setStatusFilter(key)}
            />
          ))}
        </div>
      </div>

      {statusFilter !== "pending" && candidates.length > 0 && (
        <ProgressCardReadySection
          className="mt-3"
          candidates={candidates}
          onGenerate={(sessionId, participantId) =>
            setGenerateTarget({ sessionId, participantId })
          }
        />
      )}

      {statusFilter === "pending" ? (
        pendingIntakes.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No pending sign-ups"
            description="Students who complete your intake form will show up here."
          />
        ) : (
          <div className="mt-3 space-y-3">
            {pendingIntakes.map((s) => (
              <div key={s.id} className="coach-card border-[#16A34A]/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4]">
                    <Clock className="h-5 w-5 text-[#166534]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading font-semibold">{s.name}</p>
                    <p className="text-sm text-[#6B7280]">
                      {s.mobile} · {s.email}
                    </p>
                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      {formatStudentLevelWithDuprHelper(s.skillLevel)} · waiver{" "}
                      {formatDisplayDate(s.submittedAt)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <CoachButton
                        type="button"
                        className="w-auto flex-1 py-2 text-xs"
                        loading={processingIntakeId === s.id}
                        loadingLabel="Accepting…"
                        onClick={async () => {
                          setProcessingIntakeId(s.id);
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
                          } finally {
                            setProcessingIntakeId(null);
                          }
                        }}
                      >
                        Accept
                      </CoachButton>
                      <CoachButton
                        type="button"
                        variant="outline"
                        className="w-auto flex-1 gap-1 py-2 text-xs text-[#6B7280]"
                        disabled={processingIntakeId !== null}
                        onClick={() => setDeclineTarget({ id: s.id, name: s.name })}
                      >
                        <X className="h-3.5 w-3.5" />
                        Decline
                      </CoachButton>
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
        <div className="mt-3 space-y-2">
          {students.map((s, i) => {
            const prog = programs.find((p) => p.id === s.programId);
            const lastSession = allSessions
              .filter(
                (x) =>
                  x.status === "done" &&
                  (x.studentId === s.id || x.participants.some((p) => p.studentId === s.id))
              )
              .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
            const lastLabel = lastSession?.date
              ? formatDisplayDate(lastSession.date)
              : null;

            return (
              <Link
                key={s.id}
                href={`/coach/students/${s.id}`}
                className="coach-card block px-3 py-2.5 active:bg-[#FAFAF8]"
              >
                <div className="flex items-center gap-2.5">
                  <InitialsAvatar name={s.name} size="sm" variant={i % 2 === 0 ? "lime" : "navy"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="font-heading truncate text-sm font-semibold text-[#111827]">
                          {s.name}
                        </p>
                        {s.isArchived && (
                          <span className="shrink-0 rounded bg-[#F3F4F6] px-1.5 py-0.5 text-[9px] font-semibold text-[#6B7280]">
                            Archived
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full bg-[#E5EFE8] px-2 py-0.5 text-[10px] font-semibold text-[#3D5C47]">
                        {formatStudentCoachingLevelLabel(s.skillLevel)}
                      </span>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#6B7280]">
                      {prog ? (
                        <>
                          <span className="truncate font-medium text-[#374151]">{prog.name}</span>
                          <span className="text-[#D1D5DB]">·</span>
                          <span className="shrink-0 tabular-nums">
                            {s.sessionsCompleted}/{prog.sessionCount}
                          </span>
                          {lastLabel && (
                            <>
                              <span className="text-[#D1D5DB]">·</span>
                              <span className="shrink-0">{lastLabel}</span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="shrink-0">{lastLabel ?? "No sessions yet"}</span>
                      )}
                    </div>

                    {prog && (
                      <ProgressBar
                        value={s.sessionsCompleted}
                        max={prog.sessionCount}
                        className="mt-1.5 h-1"
                      />
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
        subtitle="Bring someone new onto your roster"
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
              const coachingLevel = String(fd.get("coachingLevel") ?? "intermediate") as CoachingLevelId;
              await createStudentAction(coachId, {
                firstName: String(fd.get("firstName") ?? ""),
                lastName: String(fd.get("lastName") ?? ""),
                mobile: String(fd.get("mobile") ?? ""),
                email: String(fd.get("email") ?? ""),
                skillLevel: defaultDuprForCoachingLevel(coachingLevel),
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
          <CoachSheetField label="Player level">
            <CoachSelect
              name="coachingLevel"
              defaultValue={coachingLevelFromDupr("3.0")}
              options={STUDENT_COACHING_LEVEL_SELECT_OPTIONS}
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
          ratings={getStudentSessionRatings(activeCandidate.session, activeCandidate.studentId)}
          onGenerated={() => setGenerateTarget(null)}
        />
      )}
    </CoachPageShell>
  );
}
