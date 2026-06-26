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
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSearchInput } from "@/components/koaches/coach/CoachSearchInput";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachStudentListSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
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
    void fetchIntakeSubmissionsAction(coachId).then((list) =>
      setPendingIntakesList(list.filter((s) => s.status === "pending"))
    );
  }, [pendingVersion]);

  const pendingIntakes = pendingIntakesList;

  const students = useMemo(() => {
    if (filter === "pending") return [];
    return rosterStudents.filter((s) => {
      if (filter === "active" && s.isArchived) return false;
      if (filter === "archived" && !s.isArchived) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [filter, search, rosterStudents]);

  const { programs } = useCoachPrograms(coachId);
  const { sessions: allSessions } = useCoachSessions(coachId);

  if (loading) return <CoachStudentListSkeleton />;

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
                filter === f ? "bg-[#E07A5F] text-white" : "bg-white text-[#6B7280] border border-[#E5E7EB]"
              )}
            >
              {f}
              {f === "pending" && pendingIntakes.length > 0 && ` (${pendingIntakes.length})`}
            </button>
          ))}
        </div>
      </div>

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
              <div key={s.id} className="coach-card border-[#E07A5F]/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDEEE9]">
                    <Clock className="h-5 w-5 text-[#8B4D3A]" />
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
                          await approveIntakeAction(coachId, s.id);
                          notifyRosterUpdated(coachId);
                          refreshPending();
                          showToast(`${s.name} accepted`);
                        }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="coach-btn-outline w-auto flex-1 gap-1 py-2 text-xs text-[#6B7280]"
                        onClick={async () => {
                          await rejectIntakeAction(coachId, s.id);
                          refreshPending();
                          showToast("Sign-up declined");
                        }}
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
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Add a student manually to get started."
          action={
            <button type="button" onClick={() => setAddOpen(true)} className="coach-btn-outline max-w-xs">
              Add manually
            </button>
          }
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
          onSubmit={async (e) => {
            e.preventDefault();
            setSavingStudent(true);
            try {
              const fd = new FormData(e.currentTarget);
              await createStudentAction(coachId, {
                name: String(fd.get("name") ?? ""),
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
          <CoachSheetField label="Full name *">
            <input className="coach-input" name="name" required placeholder="Juan dela Cruz" />
          </CoachSheetField>
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
    </CoachPageShell>
  );
}
