"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  Check,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import {
  CoachBackLink,
  CoachPageShell,
  CoachSectionTitle,
} from "@/components/koaches/coach/CoachPageLayout";
import { CoachDetailSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import {
  InitialsAvatar,
  SessionTypeBadge,
  useCoachToast,
} from "@/components/koaches/coach/CoachUi";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachStudentSearchSelect } from "@/components/koaches/coach/CoachStudentSearchSelect";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import { CoachTimePicker } from "@/components/koaches/coach/CoachTimePicker";
import { SessionPaymentCheckbox } from "@/components/koaches/coach/SessionPaymentFields";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useCoachClinic, useClinicMutations } from "@/hooks/useCoachClinics";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { useCourts } from "@/hooks/useCourts";
import {
  clinicCollectedRevenue,
  clinicEnrollmentPaymentStatus,
  clinicExpectedRevenue,
  clinicPaidEnrollmentCount,
  clinicPricingMode,
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
  const pricingMode = clinicPricingMode(clinic);
  const isPerPlayer = pricingMode === "per-player";
  const paidCount = clinicPaidEnrollmentCount(clinic);
  const expected = clinicExpectedRevenue(clinic);
  const collected = clinicCollectedRevenue(clinic);

  const clinicStatusLabel =
    clinic.status === "canceled"
      ? "Canceled"
      : clinic.status === "done"
        ? "Done"
        : clinic.status === "draft"
          ? "Draft"
          : "Active";
  const paymentLine = isPerPlayer
    ? enrolled.length === 0
      ? "No players enrolled yet"
      : `${paidCount}/${enrolled.length} paid · ${formatCurrency(expected)} expected`
    : clinic.paymentStatus === "paid"
      ? `Paid · ${formatCurrency(expected)} flat fee`
      : `Unpaid · ${formatCurrency(expected)} flat fee`;

  return (
    <CoachPageShell>
      <CoachBackLink href="/coach/clinics" label="Clinics" className="hidden md:inline-flex" />

      <div className="mt-4 space-y-4">
        <div className="rounded-3xl bg-[#14532D] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SessionTypeBadge type="clinic" />
                <span className="font-heading rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/90">
                  {clinicStatusLabel}
                </span>
              </div>
              <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
                {clinic.name}
              </h2>
              <p className="mt-1 text-sm text-white/70">{clinic.focus || "Group clinic"}</p>
              <p className="mt-2 font-heading text-lg font-semibold text-[#86EFAC]">
                {formatCurrency(collected)}
                <span className="ml-1.5 text-sm font-medium text-white/55">
                  collected
                </span>
              </p>
            </div>

            {clinic.status !== "canceled" ? (
              <button
                type="button"
                onClick={() =>
                  void mutations.cancel
                    .mutateAsync()
                    .then(() => showToast("Clinic canceled"))
                    .catch((e) =>
                      showToast(e instanceof Error ? e.message : "Failed", "error")
                    )
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                aria-label="Cancel clinic"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2.25} />
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-3 pt-1">
            <p className="flex items-center gap-3 text-sm text-white/90">
              <MapPin className="h-4 w-4 shrink-0 text-[#86EFAC]" strokeWidth={2.25} />
              <span>{courtName}</span>
            </p>
            <p className="flex items-center gap-3 text-sm text-white/90">
              <Users className="h-4 w-4 shrink-0 text-[#86EFAC]" strokeWidth={2.25} />
              <span>
                {clinic.enrolledStudentIds.length}/{clinic.capacity} enrolled
              </span>
            </p>
            <p className="flex items-center gap-3 text-sm text-white/90">
              <Wallet className="h-4 w-4 shrink-0 text-[#86EFAC]" strokeWidth={2.25} />
              <span>{paymentLine}</span>
            </p>
          </div>

          {clinic.description ? (
            <p className="mt-4 rounded-2xl bg-white/10 px-3.5 py-2.5 text-sm text-white/80">
              {clinic.description}
            </p>
          ) : null}
        </div>

        <div className="coach-card p-4">
          <p className="font-heading text-sm font-semibold">Payment</p>
          <p className="mt-1 text-xs text-[#6B7280]">{formatClinicPriceSummary(clinic)}</p>

          {!isPerPlayer ? (
            <div className="mt-3">
              <SessionPaymentCheckbox
                checked={clinic.paymentStatus === "paid"}
                disabled={mutations.setPayment.isPending}
                onChange={(paid) =>
                  void mutations.setPayment
                    .mutateAsync(paid ? "paid" : "unpaid")
                    .then(() => showToast(paid ? "Marked paid" : "Marked unpaid"))
                    .catch((e) =>
                      showToast(e instanceof Error ? e.message : "Failed", "error")
                    )
                }
              />
              <p className="mt-2 text-xs text-[#6B7280]">
                Check when the flat clinic fee is in hand.
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-heading text-2xl font-bold text-[#14532D]">
                    {formatCurrency(collected)}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {paidCount}/{enrolled.length || 0} players paid ·{" "}
                    {formatCurrency(expected)} expected
                  </p>
                </div>
                {enrolled.length > 0 && paidCount < enrolled.length ? (
                  <button
                    type="button"
                    onClick={() => setTab("roster")}
                    className="shrink-0 text-sm font-semibold text-[#16A34A]"
                  >
                    Mark players →
                  </button>
                ) : null}
              </div>
              {enrolled.length > 0 ? (
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-full rounded-full bg-[#16A34A] transition-all"
                    style={{
                      width: `${Math.round((paidCount / enrolled.length) * 100)}%`,
                    }}
                  />
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#9CA3AF]">
                  Add players on the Roster tab, then mark each ticket paid.
                </p>
              )}
            </div>
          )}
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
            enrolled.map((s) => {
              const playerPaid = clinicEnrollmentPaymentStatus(clinic, s.id) === "paid";
              return (
                <div key={s.id} className="coach-card flex items-center gap-3 p-3">
                  <InitialsAvatar name={s.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{s.mobile || s.email}</p>
                    {isPerPlayer ? (
                      <p
                        className={cn(
                          "mt-0.5 text-xs font-medium",
                          playerPaid ? "text-[#6B7280]" : "text-[#C2410C]"
                        )}
                      >
                        {formatCurrency(clinic.pricePerPlayer ?? 0)}{" "}
                        {playerPaid ? "ticket" : "due"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {isPerPlayer ? (
                      <button
                        type="button"
                        aria-pressed={playerPaid}
                        aria-label={
                          playerPaid
                            ? `${s.name} paid — tap to mark unpaid`
                            : `Mark ${s.name} paid`
                        }
                        className={cn(
                          "font-heading inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                          playerPaid
                            ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                            : "border-[#16A34A] bg-white text-[#16A34A] active:bg-[#F0FDF4]"
                        )}
                        onClick={() =>
                          void mutations.setEnrollmentPayment
                            .mutateAsync({
                              studentId: s.id,
                              status: playerPaid ? "unpaid" : "paid",
                            })
                            .then(() =>
                              showToast(playerPaid ? "Marked unpaid" : "Marked paid")
                            )
                            .catch((e) =>
                              showToast(e instanceof Error ? e.message : "Failed", "error")
                            )
                        }
                      >
                        {playerPaid ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {playerPaid ? "Paid" : "Mark paid"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#EF4444]"
                      onClick={() =>
                        void mutations.remove
                          .mutateAsync(s.id)
                          .then(() => showToast("Removed"))
                          .catch((e) =>
                            showToast(e instanceof Error ? e.message : "Failed", "error")
                          )
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
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
