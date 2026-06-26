"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Session, Student } from "@/lib/koaches/types";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { useStudentProgressHistory } from "@/hooks/useStudentProgressHistory";
import { useProgressCards } from "@/hooks/useProgressCards";
import { SKILL_RUBRICS, resolveProgramRubric } from "@/lib/koaches/program-templates";
import type { ParticipantRatings } from "@/lib/koaches/session-progress";
import {
  buildSkillChanges,
  journeyHeadline,
  sessionProgressHeadline,
} from "@/lib/koaches/skill-progress-display";
import { formatSessionProgressLabel } from "@/lib/koaches/student-progress";
import {
  ScoreLegend,
  SessionProgressSummary,
  SkillProgressList,
  TopWinsList,
} from "@/components/koaches/SkillProgressDisplay";
import { formatDate, cn } from "@/lib/utils";

type StudentProgressTabProps = {
  student: Student;
  upcomingSessionId?: string;
};

function SessionProgressCard({
  session,
  ratings,
  isLatest,
  defaultOpen,
}: {
  session: Session;
  ratings: ParticipantRatings;
  isLatest?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const before = ratings.ratingsBefore ?? [];
  const after = ratings.ratingsAfter ?? [];
  const headline = sessionProgressHeadline(buildSkillChanges(before, after));

  return (
    <article className="coach-card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading text-sm font-semibold text-[#111827]">
              {formatSessionProgressLabel(session)}
            </p>
            {isLatest && (
              <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                Latest
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {session.date ? formatDate(session.date) : "Date TBD"}
          </p>
          <p className="mt-1.5 text-sm font-medium text-[#374151]">{headline}</p>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-[#E5E7EB] px-4 pb-4 pt-2">
          <SkillProgressList before={before} after={after} />
          <div className="mt-3 flex items-center justify-between gap-2">
            <ScoreLegend />
            <Link
              href={`/coach/sessions/${session.id}`}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
            >
              Open session
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

export function StudentProgressTab({ student, upcomingSessionId }: StudentProgressTabProps) {
  const coachId = usePortalCoachId();
  const history = useStudentProgressHistory(student.id);
  const { cards: allCards } = useProgressCards(coachId);
  const cards = allCards.filter((c) => c.studentId === student.id);

  const { programs } = useCoachPrograms(coachId);
  const program = student.programId ? programs.find((p) => p.id === student.programId) : undefined;
  const rubricId = program ? resolveProgramRubric(program) : "intermediate";
  const rubric = rubricId !== "custom" ? SKILL_RUBRICS[rubricId as keyof typeof SKILL_RUBRICS] : null;

  if (history.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-[#6B7280]">
          No rated sessions yet. Save Start + Now ratings on a session to track progress here.
        </p>
        {upcomingSessionId && (
          <Link
            href={`/coach/sessions/${upcomingSessionId}`}
            className="coach-btn-primary mx-auto mt-4 max-w-xs text-center text-sm"
          >
            Open next session
          </Link>
        )}
      </div>
    );
  }

  const first = history[0];
  const latest = history[history.length - 1];
  const overallBefore = first.ratings.ratingsBefore ?? [];
  const overallAfter = latest.ratings.ratingsAfter ?? [];
  const headline = journeyHeadline(history.length, overallBefore, overallAfter);

  return (
    <div className="space-y-4">
      <div className="coach-card p-4">
        <p className="font-heading text-lg font-semibold text-[#111827]">{headline}</p>
        <p className="mt-1 text-xs text-[#6B7280]">
          {rubric ? `${rubric.name} program` : "Custom program"}
          {program && ` · Session ${student.sessionsCompleted} of ${program.sessionCount}`}
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Biggest wins so far
          </p>
          <div className="mt-2">
            <TopWinsList before={overallBefore} after={overallAfter} limit={4} />
          </div>
        </div>

        {history.length > 1 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Session by session
            </p>
            <ol className="mt-2 space-y-1.5">
              {[...history].reverse().map((entry) => {
                const changes = buildSkillChanges(
                  entry.ratings.ratingsBefore ?? [],
                  entry.ratings.ratingsAfter ?? []
                );
                const line = sessionProgressHeadline(changes);
                return (
                  <li
                    key={entry.session.id}
                    className="flex items-baseline justify-between gap-2 text-sm"
                  >
                    <span className="font-medium text-[#374151]">
                      {formatSessionProgressLabel(entry.session)}
                    </span>
                    <span className="text-xs text-[#6B7280]">{line}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-heading text-sm font-semibold text-[#111827]">Latest session</h3>
        <div className="mt-3">
          <SessionProgressSummary
            before={latest.ratings.ratingsBefore ?? []}
            after={latest.ratings.ratingsAfter ?? []}
          />
          <div className="coach-card mt-3 p-4">
            <SkillProgressList
              before={latest.ratings.ratingsBefore ?? []}
              after={latest.ratings.ratingsAfter ?? []}
            />
            <div className="mt-3">
              <ScoreLegend />
            </div>
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <div>
          <h3 className="font-heading text-sm font-semibold text-[#111827]">Earlier sessions</h3>
          <p className="mt-1 text-xs text-[#6B7280]">Tap a session to see what changed</p>
          <div className="mt-3 space-y-2">
            {[...history].reverse().slice(1).map((entry) => (
              <SessionProgressCard
                key={entry.session.id}
                session={entry.session}
                ratings={entry.ratings}
              />
            ))}
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div>
          <h3 className="font-heading text-sm font-semibold text-[#111827]">Shared with student</h3>
          <p className="mt-1 text-xs text-[#6B7280]">Progress cards they can open via link</p>
          <div className="mt-3 space-y-2">
            {cards.map((c) => (
              <Link key={c.id} href={`/progress/${c.id}`} className="coach-card block p-4">
                <p className="font-heading font-semibold">{c.programOrSession}</p>
                <p className="text-xs text-[#6B7280]">{formatDate(c.dateCompleted)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
