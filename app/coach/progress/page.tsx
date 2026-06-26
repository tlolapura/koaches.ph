"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { formatSessionTimeRange } from "@/lib/koaches/session-time";
import { formatSessionDateLabel } from "@/lib/koaches/session-schedule";
import { useProgressCards } from "@/hooks/useProgressCards";
import { GenerateProgressCardSheet } from "@/components/koaches/coach/GenerateProgressCardSheet";
import { EmptyState } from "@/components/koaches/coach/CoachUi";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachProgressSkeleton } from "@/components/koaches/coach/CoachSkeletons";

/** Inbox: sessions rated but no card yet. Generated cards live on each student's profile. */
export default function ProgressInboxPage() {
  const coachId = usePortalCoachId();
  const { candidates, loading } = useProgressCards(coachId);
  const [generateTarget, setGenerateTarget] = useState<{
    sessionId: string;
    participantId: string;
  } | null>(null);

  const activeCandidate = candidates.find(
    (c) =>
      c.session.id === generateTarget?.sessionId &&
      c.participantId === generateTarget.participantId
  );

  if (loading) {
    return <CoachProgressSkeleton />;
  }

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Progress cards"
        subtitle="Rate skills on a session, then generate a card here or from that session."
      />

      {candidates.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="All caught up"
          description="When you save Start + Now ratings on a session, it'll show up here until you generate a card."
          action={
            <Link href="/coach/sessions" className="coach-btn-primary max-w-xs text-center text-sm">
              Go to sessions
            </Link>
          }
        />
      ) : (
        <div className="mt-6 space-y-2">
          {candidates.map((c) => (
            <div
              key={`${c.session.id}-${c.participantId}`}
              className="coach-card flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="font-heading truncate font-semibold">{c.participantName}</p>
                <p className="truncate text-sm text-[#6B7280]">
                  {c.programLabel} · {formatSessionDateLabel(c.session)}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  {formatSessionTimeRange(c.session.time, c.session.endTime)}
                </p>
                {c.studentId && (
                  <Link
                    href={`/coach/students/${c.studentId}`}
                    className="mt-1 inline-block text-xs font-semibold text-[#E07A5F]"
                  >
                    View student progress →
                  </Link>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  className="rounded-full bg-[#E07A5F] px-3 py-2 text-xs font-semibold text-white"
                  onClick={() =>
                    setGenerateTarget({
                      sessionId: c.session.id,
                      participantId: c.participantId,
                    })
                  }
                >
                  Generate card
                </button>
                <Link
                  href={`/coach/sessions/${c.session.id}`}
                  className="text-center text-xs font-medium text-[#6B7280]"
                >
                  Open session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

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
