"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Student } from "@/lib/koaches/types";
import {
  collectSkillsAcrossSnapshots,
  countJourneySkillWins,
  toProgramSessionSnapshots,
  type ProgramSessionSnapshot,
  type StudentSessionProgressEntry,
} from "@/lib/koaches/student-progress";
import { RadarChart } from "@/components/koaches/RadarChart";
import { SkillWinRow } from "@/components/koaches/SkillProgressDisplay";
import { ProgressBar } from "@/components/koaches/coach/CoachUi";
import { buildSkillChanges } from "@/lib/koaches/skill-progress-display";
import { formatDate, cn } from "@/lib/utils";

function scoreCellClass(score: number): string {
  if (score >= 4) return "bg-[#DCFCE7] text-[#166534]";
  if (score >= 3) return "bg-[#F0FDF4] text-[#166534]";
  return "bg-[#F9FAFB] text-[#6B7280]";
}

const COMPACT_GRID_THRESHOLD = 6;

/** Session 1 + last 5 when the program is long — avoids 12-column swipe on mobile */
function gridSnapshots(snapshots: ProgramSessionSnapshot[], showAll: boolean): ProgramSessionSnapshot[] {
  if (showAll || snapshots.length <= COMPACT_GRID_THRESHOLD) return snapshots;
  const first = snapshots[0];
  const tail = snapshots.slice(-5);
  if (tail[0]?.sessionId === first.sessionId) return tail;
  return [first, ...tail];
}

type ProgramSessionComparisonProps = {
  programName: string;
  sessionCount: number;
  student: Student;
  entries: StudentSessionProgressEntry[];
};

export function ProgramSessionComparison({
  programName,
  sessionCount,
  student,
  entries,
}: ProgramSessionComparisonProps) {
  const [showAllSessions, setShowAllSessions] = useState(false);
  const snapshots = useMemo(() => toProgramSessionSnapshots(entries), [entries]);
  const tableSnapshots = useMemo(
    () => gridSnapshots(snapshots, showAllSessions),
    [snapshots, showAllSessions]
  );
  const isCompactGrid =
    snapshots.length > COMPACT_GRID_THRESHOLD && !showAllSessions;
  const skills = useMemo(() => collectSkillsAcrossSnapshots(snapshots), [snapshots]);

  const first = entries[0];
  const latest = entries[entries.length - 1];
  const journeyWins =
    first && latest && entries.length > 1 ? countJourneySkillWins(first, latest) : 0;

  const firstAfter = snapshots[0]?.ratingsAfter ?? [];
  const latestAfter = snapshots[snapshots.length - 1]?.ratingsAfter ?? [];

  const journeyWinsList =
    first && latest && entries.length > 1
      ? buildSkillChanges(
          first.ratings.ratingsBefore ?? [],
          latest.ratings.ratingsAfter ?? []
        )
          .filter((c) => c.delta > 0)
          .slice(0, 3)
      : [];

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#F0FDF4] to-[#EFF6FF] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#16A34A]">Program</p>
          <p className="font-heading text-lg font-bold text-[#111827]">{programName}</p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-[#6B7280]">
              <span>
                Session {student.sessionsCompleted} of {sessionCount}
              </span>
              <span>{snapshots.length} rated</span>
            </div>
            <ProgressBar
              value={student.sessionsCompleted}
              max={sessionCount}
              className="mt-1.5"
            />
          </div>
        </div>

        {snapshots.length === 1 ? (
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Session 1 snapshot
            </p>
            <div className="mt-3">
              <RadarChart
                before={snapshots[0].ratingsBefore}
                after={snapshots[0].ratingsAfter}
                height={200}
                compact
              />
            </div>
            <p className="mt-3 text-center text-xs text-[#6B7280]">
              Rate more sessions to compare growth across the program.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Session {snapshots[0].sessionNumber} → Session {snapshots[snapshots.length - 1].sessionNumber}
            </p>
            <p className="mt-0.5 text-sm text-[#374151]">
              {journeyWins > 0
                ? `${journeyWins} skill${journeyWins !== 1 ? "s" : ""} stronger since day one`
                : "Holding steady across the program"}
            </p>
            <div className="mt-3">
              <RadarChart before={firstAfter} after={latestAfter} height={220} compact />
            </div>
            {journeyWinsList.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-[#E5E7EB] pt-4">
                {journeyWinsList.map((change) => (
                  <SkillWinRow key={change.skillId} change={change} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {snapshots.length > 0 && skills.length > 0 && (
        <div className="coach-card overflow-hidden">
          <div className="border-b border-[#E5E7EB] px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-sm font-semibold text-[#111827]">
                  End-of-session levels
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {isCompactGrid
                    ? `Session 1 + last 5 of ${snapshots.length}. Tap a column to open.`
                    : "Compare skills across program sessions. Tap a column to open."}
                </p>
              </div>
              {snapshots.length > COMPACT_GRID_THRESHOLD && (
                <button
                  type="button"
                  onClick={() => setShowAllSessions((v) => !v)}
                  className="shrink-0 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#374151] active:bg-[#F9FAFB]"
                >
                  {showAllSessions ? "Show recent" : `All ${snapshots.length}`}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#FAFAF8]">
                  <th className="sticky left-0 z-10 bg-[#FAFAF8] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                    Skill
                  </th>
                  {tableSnapshots.map((snapshot) => (
                    <th
                      key={snapshot.sessionId}
                      className={cn(
                        "px-1 py-2 text-center",
                        isCompactGrid ? "min-w-[44px]" : "min-w-[52px]"
                      )}
                    >
                      <Link
                        href={`/coach/sessions/${snapshot.sessionId}`}
                        className="inline-flex flex-col items-center rounded-lg px-1 py-1 active:bg-[#F0FDF4]"
                      >
                        <span className="text-xs font-bold text-[#166534]">{snapshot.label}</span>
                        {snapshot.date && !isCompactGrid && snapshots.length <= 8 && (
                          <span className="mt-0.5 text-[9px] font-medium text-[#9CA3AF]">
                            {formatDate(snapshot.date).split(",")[0]}
                          </span>
                        )}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => {
                  const allScores = snapshots.map(
                    (snapshot) =>
                      snapshot.ratingsAfter.find((rating) => rating.skillId === skill.id)?.score
                  );
                  const firstScore = allScores.find((s) => s != null);
                  const lastScore = [...allScores].reverse().find((s) => s != null);
                  const grew =
                    firstScore != null && lastScore != null && lastScore > firstScore;

                  const scores = tableSnapshots.map(
                    (snapshot) =>
                      snapshot.ratingsAfter.find((rating) => rating.skillId === skill.id)?.score
                  );

                  return (
                    <tr key={skill.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td
                        className={cn(
                          "sticky left-0 z-10 max-w-[130px] truncate bg-white px-3 py-2 text-xs font-medium text-[#111827]",
                          grew && "border-l-2 border-l-[#16A34A]"
                        )}
                      >
                        {skill.name}
                      </td>
                      {scores.map((score, index) => (
                        <td key={tableSnapshots[index].sessionId} className="px-1 py-2 text-center">
                          {score != null ? (
                            <span
                              className={cn(
                                "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                                scoreCellClass(score)
                              )}
                            >
                              {score}
                            </span>
                          ) : (
                            <span className="text-[#D1D5DB]">-</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
