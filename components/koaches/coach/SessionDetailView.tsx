"use client";

import { useState } from "react";
import { CalendarX, CircleCheck } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { courtNameFromLookup, useCourts } from "@/hooks/useCourts";
import { formatParticipantProgramLabel, resolveParticipantProgramContext } from "@/lib/koaches/participant-program";
import { SessionSkillRatingsSection } from "@/components/koaches/coach/SessionSkillRatingsSection";
import { SessionDetailStepper } from "@/components/koaches/coach/SessionDetailStepper";
import { SessionTypeBadge, SessionDisplayStatusBadge, useCoachToast } from "@/components/koaches/coach/CoachUi";
import { SessionPaymentCard } from "@/components/koaches/coach/SessionPaymentCard";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { ScheduleTbdSessionSheet } from "@/components/koaches/coach/ScheduleTbdSessionSheet";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { updateSessionNotesAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { formatSessionTimeRange } from "@/lib/koaches/session-time";
import { isSessionDateScheduled } from "@/lib/koaches/session-schedule";
import {
  formatSessionParticipantList,
  formatSessionParticipantNames,
  getSessionParticipants,
} from "@/lib/koaches/session-participants";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import {
  CoachBackLink,
  CoachEntityTitle,
  CoachPageShell,
} from "@/components/koaches/coach/CoachPageLayout";

type SessionDetailViewProps = {
  session: Session;
};

function SessionInfoCard({
  session,
  primaryName,
  courtName,
  participants,
  displayStatus,
}: {
  session: Session;
  primaryName: string;
  courtName: string;
  participants: ReturnType<typeof getSessionParticipants>;
  displayStatus: ReturnType<typeof useSessionStatus>["displayStatus"];
}) {
  return (
    <div className="coach-card p-4">
      <div className="flex items-start justify-between gap-3">
        <CoachEntityTitle>{primaryName}</CoachEntityTitle>
        <span className="shrink-0 rounded-full bg-[#14532D] px-3 py-1 text-sm font-semibold text-white">
          {formatCurrency(session.price)}
        </span>
      </div>
      <p className="mt-1 text-sm text-[#6B7280]">
        {isSessionDateScheduled(session)
          ? `${formatDisplayDate(session.date!)} · ${formatSessionTimeRange(session.time, session.endTime)}`
          : `Session ${session.sessionNumber ?? ""} · Date TBD`}
      </p>
      <p className="text-sm text-[#6B7280]">{courtName}</p>
      <p className="text-xs text-[#6B7280]">
        {session.playerCount} player{session.playerCount !== 1 ? "s" : ""}
        {session.playerCount > 1 && ` · ${formatSessionParticipantList(session)}`}
      </p>
      {participants.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {participants.map((p) => {
            const programLabel = formatParticipantProgramLabel(
              resolveParticipantProgramContext(p, session)
            );
            return (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-medium text-[#166534]"
              >
                {p.name}
                <span className="text-[10px] opacity-75">· {programLabel}</span>
              </span>
            );
          })}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <SessionTypeBadge type={session.type} />
        <SessionDisplayStatusBadge status={displayStatus} />
        {session.sessionNumber && (
          <span className="text-sm text-[#6B7280]">Session {session.sessionNumber}</span>
        )}
      </div>
    </div>
  );
}

export function SessionDetailView({ session }: SessionDetailViewProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [notes, setNotes] = useState(session.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [step, setStep] = useState<1 | 2>(() =>
    session.status === "upcoming" || session.status === "canceled" ? 1 : 2
  );
  const { showToast } = useCoachToast();
  const { status, displayStatus, markDone, markCanceled } = useSessionStatus(session);
  const ratingsUnlocked = status !== "upcoming" && status !== "canceled";
  const participants = getSessionParticipants(session);
  const primaryName = formatSessionParticipantNames(session);
  const { lookup } = useCourts();
  const courtName = courtNameFromLookup(lookup, session.courtId);

  const handleMarkDone = async () => {
    setMarkingDone(true);
    try {
      await markDone();
      showToast("Session marked done — add skill ratings");
      setStep(2);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update session", "error");
    } finally {
      setMarkingDone(false);
    }
  };

  return (
    <CoachPageShell>
      <CoachBackLink href="/coach/sessions" label="Schedule" className="hidden md:inline-flex" />

      {status !== "canceled" && (
        <SessionDetailStepper
          step={step}
          onStep={setStep}
          ratingsUnlocked={ratingsUnlocked}
        />
      )}

      {step === 1 && (
        <div className="mt-4 space-y-4 pb-32 lg:pb-4">
          <SessionInfoCard
            session={session}
            primaryName={primaryName}
            courtName={courtName}
            participants={participants}
            displayStatus={displayStatus}
          />

          {!isSessionDateScheduled(session) && status === "upcoming" && (
            <button
              type="button"
              className="coach-btn-secondary w-full text-sm"
              onClick={() => setScheduleOpen(true)}
            >
              Schedule date & time
            </button>
          )}

          <SessionPaymentCard session={session} />

          <div className="coach-card p-4">
            <label className="coach-label" htmlFor="session-notes">
              Session notes
            </label>
            <textarea
              id="session-notes"
              className="coach-input mt-1 min-h-[100px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session go?"
            />
            <CoachButton
              type="button"
              variant="outline"
              className="mt-3 text-sm"
              loading={savingNotes}
              loadingLabel="Saving…"
              onClick={async () => {
                setSavingNotes(true);
                try {
                  await updateSessionNotesAction(session.id, notes);
                  invalidateCoachSessions(session.coachId);
                  showToast("Notes saved");
                } catch (e) {
                  showToast(e instanceof Error ? e.message : "Could not save notes", "error");
                } finally {
                  setSavingNotes(false);
                }
              }}
            >
              Save notes
            </CoachButton>
          </div>

          {status !== "canceled" && (
            <div className="coach-session-step-footer">
              {status === "upcoming" ? (
                <>
                  <CoachButton
                    type="button"
                    loading={markingDone}
                    loadingLabel="Saving…"
                    onClick={() => void handleMarkDone()}
                  >
                    <CircleCheck className="h-4 w-4" strokeWidth={2.5} />
                    Mark done & continue
                  </CoachButton>
                  <button
                    type="button"
                    className="coach-btn-ghost-danger"
                    onClick={() => setCancelOpen(true)}
                  >
                    <CalendarX className="h-4 w-4" strokeWidth={2.5} />
                    Cancel session
                  </button>
                </>
              ) : (
                <CoachButton type="button" onClick={() => setStep(2)}>
                  Continue to ratings
                </CoachButton>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && ratingsUnlocked && (
        <div className="mt-4 space-y-4 pb-8">
          {displayStatus === "pending_progress_review" && (
            <p className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-sm text-[#92400E]">
              Rate Start + Now for each skill, then save ratings.
            </p>
          )}

          {displayStatus === "ready_to_share" && (
            <p className="rounded-xl border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-2.5 text-sm text-[#166534]">
              Ratings saved — generate a progress card to share with your student.
            </p>
          )}

          <SessionSkillRatingsSection session={session} />
        </div>
      )}

      <ConfirmSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        message="Cancel this session?"
        confirmLabel="Cancel Session"
        onConfirm={async () => {
          await markCanceled();
          showToast("Session canceled");
        }}
      />

      <ScheduleTbdSessionSheet
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        session={session}
        onScheduled={() => invalidateCoachSessions(session.coachId)}
      />
    </CoachPageShell>
  );
}
