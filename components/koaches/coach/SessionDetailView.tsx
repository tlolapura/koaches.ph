"use client";

import { useState } from "react";
import { CalendarX, CircleCheck } from "lucide-react";
import type { Session } from "@/lib/koaches/types";
import { courtNameFromLookup, useCourts } from "@/hooks/useCourts";
import { useCoachProgram } from "@/hooks/useCoachPrograms";
import { formatParticipantProgramLabel, resolveParticipantProgramContext } from "@/lib/koaches/participant-program";
import { SessionSkillRatingsSection } from "@/components/koaches/coach/SessionSkillRatingsSection";
import { SessionTypeBadge, SessionDisplayStatusBadge, useCoachToast } from "@/components/koaches/coach/CoachUi";
import { SessionPaymentCard } from "@/components/koaches/coach/SessionPaymentCard";
import { ConfirmSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { ScheduleTbdSessionSheet } from "@/components/koaches/coach/ScheduleTbdSessionSheet";
import { useSessionStatus } from "@/hooks/useSessionStatus";
import { updateSessionNotesAction } from "@/lib/koaches/actions/sessions";
import { formatSessionTimeRange } from "@/lib/koaches/session-time";
import {
  isSessionDateScheduled,
} from "@/lib/koaches/session-schedule";
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

export function SessionDetailView({ session }: SessionDetailViewProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [notes, setNotes] = useState(session.notes ?? "");
  const { showToast } = useCoachToast();
  const { status, displayStatus, markDone, markCanceled } = useSessionStatus(session);
  const participants = getSessionParticipants(session);
  const primaryName = formatSessionParticipantNames(session);
  const { lookup } = useCourts();
  const { program } = useCoachProgram(session.programId ?? null);
  const courtName = courtNameFromLookup(lookup, session.courtId);

  return (
    <CoachPageShell>
      <CoachBackLink href="/coach/sessions" label="Schedule" className="hidden md:inline-flex" />

      <div className="coach-card mt-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <CoachEntityTitle>{primaryName}</CoachEntityTitle>
          <span className="shrink-0 rounded-full bg-[#1E3A5F] px-3 py-1 text-sm font-semibold text-white">
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
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FDEEE9] px-2.5 py-1 text-xs font-medium text-[#8B4D3A]"
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

      {displayStatus === "pending_progress_review" && (
        <p className="mt-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-sm text-[#92400E]">
          Save Start + Now skill ratings below to complete this session review.
        </p>
      )}

      {displayStatus === "ready_to_share" && (
        <p className="mt-3 rounded-xl border border-[#E07A5F]/25 bg-[#FDEEE9] px-3 py-2.5 text-sm text-[#8B4D3A]">
          Ratings saved — generate a progress card to share with your student.
        </p>
      )}

      {!isSessionDateScheduled(session) && status === "upcoming" && (
        <div className="mt-3">
          <button type="button" className="coach-btn-secondary w-full text-sm" onClick={() => setScheduleOpen(true)}>
            Schedule date & time
          </button>
        </div>
      )}

      <SessionPaymentCard session={session} />

      <div className="coach-card mt-4 p-4">
        <label className="font-heading text-sm font-semibold">Session notes</label>
        <textarea
          className="coach-input mt-2 min-h-[100px] resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did the session go?"
        />
        <button
          type="button"
          className="coach-btn-outline mt-3 text-sm"
          onClick={async () => {
            await updateSessionNotesAction(session.id, notes);
            showToast("Notes saved");
          }}
        >
          Save notes
        </button>
      </div>

      <SessionSkillRatingsSection session={session} />

      {status !== "canceled" && (
        <div className="coach-session-actions">
          {status === "upcoming" && (
            <button
              type="button"
              className="coach-btn-primary"
              onClick={async () => {
                await markDone();
                showToast("Session marked done — add skill ratings when ready");
              }}
            >
              <CircleCheck className="h-4 w-4" strokeWidth={2.5} />
              Mark done
            </button>
          )}

          <button
            type="button"
            className="coach-btn-ghost-danger"
            onClick={() => setCancelOpen(true)}
          >
            <CalendarX className="h-4 w-4" strokeWidth={2.5} />
            Cancel session
          </button>
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
        onScheduled={() => window.dispatchEvent(new Event("koaches-sessions-updated"))}
      />
    </CoachPageShell>
  );
}
