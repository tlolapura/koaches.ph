"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import {
  CoachBackLink,
  CoachPageHeader,
  CoachPageShell,
  CoachSectionTitle,
} from "@/components/koaches/coach/CoachPageLayout";
import { CoachDetailSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import {
  InitialsAvatar,
  SessionPaymentBadge,
  useCoachToast,
} from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachStudentSearchSelect } from "@/components/koaches/coach/CoachStudentSearchSelect";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";
import { useCoachClinic, useClinicMutations } from "@/hooks/useCoachClinics";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { useCourts } from "@/hooks/useCourts";
import {
  clinicExpectedRevenue,
  formatClinicPriceSummary,
} from "@/lib/koaches/clinic-pricing";
import { formatTimeDisplay, formatSessionTimeRange } from "@/lib/koaches/session-time";
import { buildTimeOptions } from "@/lib/koaches/time-options";
import { formatCurrency, cn } from "@/lib/utils";

const CLINIC_TIME_OPTIONS = buildTimeOptions(30, 6, 21);

export function ClinicDetailPageClient() {
  const params = useParams();
  const clinicId = String(params.id ?? "");
  const coachId = usePortalCoachId();
  const { clinic, sessions, loading } = useCoachClinic(clinicId);
  const mutations = useClinicMutations(coachId, clinicId);
  const { students } = useCoachStudents(coachId);
  const { lookup } = useCourts();
  const { showToast } = useCoachToast();

  const [tab, setTab] = useState<"roster" | "sessions">("sessions");
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addDateOpen, setAddDateOpen] = useState(false);
  const [pickStudentId, setPickStudentId] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("12:00");
  const [addingPlayer, setAddingPlayer] = useState(false);

  const enrolled = useMemo(() => {
    if (!clinic) return [];
    return students.filter((s) => clinic.enrolledStudentIds.includes(s.id));
  }, [clinic, students]);

  const available = useMemo(() => {
    if (!clinic) return [];
    return students.filter(
      (s) => !s.isArchived && !clinic.enrolledStudentIds.includes(s.id)
    );
  }, [clinic, students]);

  if (!coachId || loading || !clinic) {
    return <CoachDetailSkeleton />;
  }

  const courtName = lookup.get(clinic.courtId)?.name ?? "Court TBD";

  return (
    <CoachPageShell>
      <CoachBackLink href="/coach/clinics" label="Clinics" />
      <CoachPageHeader
        title={clinic.name}
        subtitle={clinic.focus || "Group clinic"}
        mobileTitle
      />

      <div className="coach-card mt-4 p-4">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-[#EDE9FE] px-2.5 py-1 text-[#5B21B6]">
            {clinic.enrolledStudentIds.length}/{clinic.capacity} enrolled
          </span>
          <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[#6B7280]">{courtName}</span>
          <SessionPaymentBadge status={clinic.paymentStatus} />
        </div>
        <p className="mt-3 text-sm text-[#6B7280]">{formatClinicPriceSummary(clinic)}</p>
        <p className="mt-1 font-heading text-lg font-bold text-[#14532D]">
          {formatCurrency(clinicExpectedRevenue(clinic))}
          <span className="ml-1 text-xs font-medium text-[#9CA3AF]">expected</span>
        </p>
        {clinic.description ? (
          <p className="mt-3 text-sm text-[#4B5563]">{clinic.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <CoachButton
            type="button"
            variant="outline"
            className="w-auto px-3 py-2 text-sm"
            onClick={() =>
              void mutations.setPayment
                .mutateAsync(clinic.paymentStatus === "paid" ? "unpaid" : "paid")
                .then(() =>
                  showToast(clinic.paymentStatus === "paid" ? "Marked unpaid" : "Marked paid")
                )
                .catch((e) => showToast(e instanceof Error ? e.message : "Failed", "error"))
            }
          >
            Mark {clinic.paymentStatus === "paid" ? "unpaid" : "paid"}
          </CoachButton>
          {clinic.status !== "canceled" ? (
            <CoachButton
              type="button"
              variant="outline"
              className="w-auto px-3 py-2 text-sm text-[#EF4444]"
              onClick={() =>
                void mutations.cancel
                  .mutateAsync()
                  .then(() => showToast("Clinic canceled"))
                  .catch((e) => showToast(e instanceof Error ? e.message : "Failed", "error"))
              }
            >
              Cancel clinic
            </CoachButton>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex gap-1 rounded-xl bg-[#F3F4F6] p-1">
        {(
          [
            { id: "sessions" as const, label: "Sessions" },
            { id: "roster" as const, label: "Roster" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "font-heading flex-1 rounded-lg py-2 text-sm font-semibold",
              tab === t.id ? "bg-white text-[#111827] shadow-sm" : "text-[#6B7280]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sessions" ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <CoachSectionTitle>Dates</CoachSectionTitle>
            <button
              type="button"
              onClick={() => setAddDateOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add date
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No dates yet.</p>
          ) : (
            sessions.map((s) => (
              <Link key={s.id} href={`/coach/sessions/${s.id}`} className="coach-card block p-4">
                <p className="font-heading font-semibold text-[#111827]">
                  {s.date ? format(parseISO(s.date), "EEE, MMM d") : "Date TBD"}
                </p>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {formatSessionTimeRange(s.time, s.endTime)} · {s.status}
                </p>
              </Link>
            ))
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <CoachSectionTitle>Players</CoachSectionTitle>
            <button
              type="button"
              onClick={() => setAddPlayerOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add player
            </button>
          </div>
          {enrolled.length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No players enrolled yet.</p>
          ) : (
            enrolled.map((s) => (
              <div key={s.id} className="coach-card flex items-center gap-3 p-3">
                <InitialsAvatar name={s.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{s.mobile || s.email}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#EF4444]"
                  onClick={() =>
                    void mutations.remove
                      .mutateAsync(s.id)
                      .then(() => showToast("Removed"))
                      .catch((e) => showToast(e instanceof Error ? e.message : "Failed", "error"))
                  }
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <CoachBottomSheet
        open={addPlayerOpen}
        onClose={() => {
          setAddPlayerOpen(false);
          setPickStudentId([]);
        }}
        title="Add player"
        subtitle="Search your student roster"
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="button"
              className="w-full"
              loading={addingPlayer}
              disabled={!pickStudentId[0] || available.length === 0}
              onClick={() => {
                const studentId = pickStudentId[0];
                if (!studentId) return;
                setAddingPlayer(true);
                void mutations.enroll
                  .mutateAsync(studentId)
                  .then(() => {
                    showToast("Added");
                    setPickStudentId([]);
                    setAddPlayerOpen(false);
                  })
                  .catch((e) => showToast(e instanceof Error ? e.message : "Failed", "error"))
                  .finally(() => setAddingPlayer(false));
              }}
            >
              Add to clinic
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        {available.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">Everyone on your roster is already enrolled.</p>
        ) : (
          <CoachSheetField label="Student">
            <CoachStudentSearchSelect
              students={available}
              value={pickStudentId}
              onChange={setPickStudentId}
              multiple={false}
              max={1}
              placeholder="Search students…"
            />
          </CoachSheetField>
        )}
      </CoachBottomSheet>

      <CoachBottomSheet
        open={addDateOpen}
        onClose={() => setAddDateOpen(false)}
        title="Add clinic date"
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="button"
              className="w-full"
              onClick={() =>
                void mutations.addSession
                  .mutateAsync({
                    date: newDate,
                    time: formatTimeDisplay(newStart),
                    endTime: formatTimeDisplay(newEnd),
                    courtId: clinic.courtId,
                  })
                  .then(() => {
                    showToast("Date added");
                    setAddDateOpen(false);
                  })
                  .catch((e) => showToast(e instanceof Error ? e.message : "Failed", "error"))
              }
            >
              Save date
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <div className="space-y-3">
          <CoachSheetField label="Date">
            <CoachDatePicker
              value={newDate}
              onChange={setNewDate}
              placeholder="Pick a date"
            />
          </CoachSheetField>
          <div className="grid grid-cols-2 gap-2">
            <CoachSheetField label="Start">
              <CoachTimePicker
                value={newStart}
                onChange={setNewStart}
                options={CLINIC_TIME_OPTIONS}
                placeholder="Start time"
              />
            </CoachSheetField>
            <CoachSheetField label="End">
              <CoachTimePicker
                value={newEnd}
                onChange={setNewEnd}
                options={CLINIC_TIME_OPTIONS}
                placeholder="End time"
              />
            </CoachSheetField>
          </div>
        </div>
      </CoachBottomSheet>
    </CoachPageShell>
  );
}
