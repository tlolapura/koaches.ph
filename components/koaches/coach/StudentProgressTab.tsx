"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import Link from "next/link";
import { ArrowRight, ExternalLink, Share2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { Student } from "@/lib/koaches/types";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { useStudentProgressHistory } from "@/hooks/useStudentProgressHistory";
import { useProgressCards } from "@/hooks/useProgressCards";
import { getStudentSessionRatings } from "@/lib/koaches/session-progress";
import { buildSkillChanges, summarizeSkillChanges } from "@/lib/koaches/skill-progress-display";
import {
  groupStudentProgressHistory,
  type StudentSessionProgressEntry,
} from "@/lib/koaches/student-progress";
import { SkillWinRow } from "@/components/koaches/SkillProgressDisplay";
import { ProgressCardReadySection } from "@/components/koaches/coach/ProgressCardReadySection";
import { ProgramSessionComparison } from "@/components/koaches/coach/ProgramSessionComparison";
import { GenerateProgressCardSheet } from "@/components/koaches/coach/GenerateProgressCardSheet";
import { formatDate } from "@/lib/utils";
import type { ProgressCard } from "@/lib/koaches/types";

type StudentProgressTabProps = {
  student: Student;
  upcomingSessionId?: string;
};

function DropInProgressCard({
  entry,
  card,
}: {
  entry: StudentSessionProgressEntry;
  card?: ProgressCard;
}) {
  const before = entry.ratings.ratingsBefore ?? [];
  const after = entry.ratings.ratingsAfter ?? [];
  const { improved, improvedCount } = summarizeSkillChanges(buildSkillChanges(before, after));

  return (
    <div className="coach-card overflow-hidden">
      <Link
        href={`/coach/sessions/${entry.session.id}`}
        className="block p-4 active:bg-[#FAFAF8]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
              Drop-in
            </span>
            <p className="mt-1.5 text-sm font-semibold text-[#111827]">
              {entry.session.date ? formatDate(entry.session.date) : "Date TBD"}
            </p>
            <p className="mt-0.5 text-xs text-[#6B7280]">In-session before → after</p>
          </div>
          {improvedCount > 0 && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-sm font-bold text-[#166534]">
              +{improvedCount}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {improved.length > 0 ? (
            improved.slice(0, 3).map((change) => <SkillWinRow key={change.skillId} change={change} />)
          ) : (
            <p className="text-xs text-[#9CA3AF]">No level-ups this visit</p>
          )}
        </div>
      </Link>
      {card && (
        <Link
          href={`/progress/${card.id}`}
          className="flex items-center justify-between gap-2 border-t border-[#E5E7EB] bg-[#FAFAF8] px-4 py-2.5 text-xs font-semibold text-[#4F8FF7]"
        >
          <span className="inline-flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            View shared card
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-[#9CA3AF]" />
        </Link>
      )}
    </div>
  );
}

export function StudentProgressTab({
  student,
  upcomingSessionId,
}: StudentProgressTabProps) {
  const coachId = usePortalCoachId();
  const history = useStudentProgressHistory(student.id);
  const { cards: allCards, candidates } = useProgressCards(coachId);
  const cards = allCards.filter((c) => c.studentId === student.id);
  const [generateTarget, setGenerateTarget] = useState<{
    sessionId: string;
    participantId: string;
  } | null>(null);

  const { programs } = useCoachPrograms(coachId);

  const activeCandidate = candidates.find(
    (c) =>
      c.studentId === student.id &&
      c.session.id === generateTarget?.sessionId &&
      c.participantId === generateTarget?.participantId
  );

  const cardsBySession = useMemo(
    () => new Map(cards.filter((c) => c.sessionId).map((c) => [c.sessionId!, c])),
    [cards]
  );

  const groups = useMemo(
    () => groupStudentProgressHistory(history, student.programId),
    [history, student.programId]
  );

  const dropInGroup = groups.find((g) => g.kind === "drop-in");

  const generateSheet = activeCandidate && (
    <GenerateProgressCardSheet
      open={!!generateTarget}
      onClose={() => setGenerateTarget(null)}
      session={activeCandidate.session}
      participantId={activeCandidate.participantId}
      ratings={getStudentSessionRatings(activeCandidate.session, student.id)}
      onGenerated={() => setGenerateTarget(null)}
    />
  );

  if (history.length === 0) {
    const studentCandidates = candidates.filter((c) => c.studentId === student.id);
    return (
      <div className="space-y-4">
        {studentCandidates.length > 0 && (
          <ProgressCardReadySection
            candidates={candidates}
            studentId={student.id}
            onGenerate={(sessionId, participantId) =>
              setGenerateTarget({ sessionId, participantId })
            }
          />
        )}
        <div className="coach-card py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0FDF4]">
            <TrendingUp className="h-6 w-6 text-[#16A34A]" />
          </div>
          <p className="font-heading mt-3 text-base font-semibold text-[#111827]">No ratings yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-[#6B7280]">
            Mark a session done and rate skills to track growth here.
          </p>
          {upcomingSessionId && (
            <Link
              href={`/coach/sessions/${upcomingSessionId}`}
              className="coach-btn-primary mx-auto mt-5 inline-flex max-w-xs text-sm"
            >
              Open next session
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
        {generateSheet}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressCardReadySection
        candidates={candidates}
        studentId={student.id}
        onGenerate={(sessionId, participantId) =>
          setGenerateTarget({ sessionId, participantId })
        }
      />

      {groups
        .filter((g) => g.kind === "program")
        .map((group) => {
          const groupProgram = programs.find((p) => p.id === group.programId);
          const maxSessionNum = Math.max(
            ...group.entries.map((e) => e.session.sessionNumber ?? 0),
            0
          );
          return (
            <ProgramSessionComparison
              key={group.id}
              programName={groupProgram?.name ?? "Program"}
              sessionCount={groupProgram?.sessionCount ?? (maxSessionNum || group.entries.length)}
              student={student}
              entries={group.entries}
            />
          );
        })}

      {dropInGroup && (
        <section>
          <div className="mb-3">
            <h3 className="font-heading text-sm font-semibold text-[#111827]">Drop-ins</h3>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              One-off visits — compared within each session, not vs your program
            </p>
          </div>
          <div className="space-y-2">
            {[...dropInGroup.entries].reverse().map((entry) => (
              <DropInProgressCard
                key={entry.session.id}
                entry={entry}
                card={cardsBySession.get(entry.session.id)}
              />
            ))}
          </div>
        </section>
      )}

      {cards.length > 0 && (
        <section>
          <h3 className="font-heading text-sm font-semibold text-[#111827]">Shared cards</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {cards.map((c) => (
              <Link
                key={c.id}
                href={`/progress/${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#374151] active:bg-[#F9FAFB]"
              >
                <Share2 className="h-3.5 w-3.5 text-[#16A34A]" />
                {c.programOrSession}
                <ExternalLink className="h-3 w-3 text-[#9CA3AF]" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {generateSheet}
    </div>
  );
}
