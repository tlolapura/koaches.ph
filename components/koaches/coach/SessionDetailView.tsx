"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleCheck } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { courtNameFromLookup, useCourts } from "@/hooks/useCourts";
import { formatParticipantProgramLabel, resolveParticipantProgramContext } from "@/lib/koaches/participant-program";
import { SessionSkillRatingsSection } from "@/components/koaches/coach/SessionSkillRatingsSection";
import { SessionDetailStepper } from "@/components/koaches/coach/SessionDetailStepper";
import { SessionDetailStepFooter } from "@/components/koaches/coach/SessionDetailStepFooter";
import type { SkillRatingActions } from "@/components/koaches/coach/SkillRatingPanel";
import { SessionTypeBadge, SessionDisplayStatusBadge, useCoachToast } from "@/components/koaches/coach/CoachUi";
import { SessionPaymentCard } from "@/components/koaches/coach/SessionPaymentCard";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { ScheduleTbdSessionSheet } from "@/components/koaches/coach/ScheduleTbdSessionSheet";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { deleteSessionAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions } from "@/lib/koaches/queries/invalidate";
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
import { isSessionRatingStep, type SessionDetailStep } from "@/lib/koaches/session-detail-steps";

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
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [markingDone, setMarkingDone] = useState(false);
  const [step, setStep] = useState<SessionDetailStep>("session");
  const [ratingActions, setRatingActions] = useState<SkillRatingActions | null>(null);
  const { showToast } = useCoachToast();
  const { status, displayStatus, markDone } = useSessionStatus(session);
  const ratingsUnlocked = status !== "upcoming" && status !== "canceled";
  const participants = getSessionParticipants(session);
  const primaryName = formatSessionParticipantNames(session);
  const { lookup } = useCourts();
  const courtName = courtNameFromLookup(lookup, session.courtId);
  const deleteSessionDetails = isSessionDateScheduled(session)
    ? `${formatDisplayDate(session.date!)} · ${formatSessionTimeRange(session.time, session.endTime)}`
    : "Date & time not set yet";
  const deleteDescription = `You are deleting: ${primaryName}\n${deleteSessionDetails}\n${courtName} · ${formatCurrency(session.price)}\n\nThis permanently removes the record and cannot be undone.`;

  useEffect(() => {
    if (step === "session") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (!isSessionRatingStep(step) || step === "complete") {
      setRatingActions(null);
    }
  }, [step]);

  const handleMarkDone = async () => {
    setMarkingDone(true);
    try {
      await markDone();
      showToast("Session marked done — mark skill coverage");
      setStep("coverage");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update session", "error");
    } finally {
      setMarkingDone(false);
    }
  };

  const renderStepFooter = () => {
    if (status === "canceled" || step === "complete") return null;

    if (step === "session") {
      if (status === "upcoming") {
        return (
          <SessionDetailStepFooter
            nextLabel="Mark done & continue"
            nextIcon={<CircleCheck className="h-4 w-4" strokeWidth={2.5} />}
            onNext={() => void handleMarkDone()}
            nextLoading={markingDone}
            nextLoadingLabel="Saving…"
          />
        );
      }

      return (
        <SessionDetailStepFooter
          onNext={() => setStep("coverage")}
          nextDisabled={!ratingsUnlocked}
        />
      );
    }

    if (step === "coverage") {
      return (
        <SessionDetailStepFooter
          onBack={() => setStep("session")}
          onNext={() => setStep("ratings")}
        />
      );
    }

    if (step === "ratings") {
      return (
        <SessionDetailStepFooter
          onBack={() => setStep("coverage")}
          onNext={() => ratingActions?.continueToFeedback()}
          nextDisabled={!ratingActions?.canContinueFromRatings}
        />
      );
    }

    if (step === "feedback") {
      return (
        <SessionDetailStepFooter
          onBack={() => setStep("ratings")}
          nextLabel="Save session"
          nextIcon={<Check className="h-4 w-4" strokeWidth={2.5} />}
          onNext={() => void ratingActions?.saveSession()}
          nextLoading={ratingActions?.saving}
          nextLoadingLabel="Saving…"
        />
      );
    }

    return null;
  };

  return (
    <CoachPageShell>
      <CoachBackLink href="/coach/sessions" label="Schedule" className="hidden md:inline-flex" />

      {status !== "canceled" && step !== "complete" && (
        <SessionDetailStepper
          step={step}
          onStep={setStep}
          ratingsUnlocked={ratingsUnlocked}
        />
      )}

      {step === "session" && (
        <div className="mt-4 space-y-4 coach-portal-fixed-cta-pad lg:pb-4">
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

          <button
            type="button"
            className="coach-btn-ghost-danger w-full"
            onClick={() => setDeleteOpen(true)}
          >
            Delete session
          </button>
        </div>
      )}

      {isSessionRatingStep(step) && ratingsUnlocked && (
        <div className="mt-4 coach-portal-fixed-cta-pad pb-8">
          <SessionSkillRatingsSection
            session={session}
            step={step}
            onStepChange={setStep}
            onRatingActionsChange={setRatingActions}
          />
        </div>
      )}

      {renderStepFooter()}

      <ConfirmSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        message="Delete this session permanently?"
        description={deleteDescription}
        confirmLabel="Delete Session"
        onConfirm={async () => {
          try {
            await deleteSessionAction(session.id);
            invalidateCoachSessions(session.coachId);
            showToast("Session deleted");
            router.push("/coach/sessions");
            router.refresh();
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Could not delete session", "error");
          }
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
