"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ProgressCardCandidate } from "@/lib/koaches/progress-cards";
import { formatSessionTimeRange } from "@/lib/koaches/session-time";
import { formatSessionDateLabel } from "@/lib/koaches/session-schedule";

type ProgressCardReadySectionProps = {
  candidates: ProgressCardCandidate[];
  onGenerate: (sessionId: string, participantId: string) => void;
  /** When set, only show cards for this student */
  studentId?: string;
  className?: string;
};

export function ProgressCardReadySection({
  candidates,
  onGenerate,
  studentId,
  className,
}: ProgressCardReadySectionProps) {
  const filtered = studentId
    ? candidates.filter((c) => c.studentId === studentId)
    : candidates;

  if (filtered.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#16A34A]" aria-hidden />
        <h2 className="font-heading text-sm font-semibold text-[#111827]">
          {studentId ? "Ready to share" : `${filtered.length} card${filtered.length === 1 ? "" : "s"} ready to share`}
        </h2>
      </div>
      <p className="mb-3 text-xs text-[#6B7280]">
        {studentId
          ? "Ratings saved — generate a progress card for your student."
          : "Sessions with ratings that haven't been shared yet."}
      </p>
      <div className="space-y-2">
        {filtered.map((c) => (
          <div
            key={`${c.session.id}-${c.participantId}`}
            className="coach-card flex items-center justify-between gap-3 p-4"
          >
            <div className="min-w-0">
              {!studentId && (
                <p className="font-heading truncate font-semibold">{c.participantName}</p>
              )}
              <p className={studentId ? "font-heading truncate text-sm font-semibold" : "truncate text-sm text-[#6B7280]"}>
                {c.programLabel} · {formatSessionDateLabel(c.session)}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {formatSessionTimeRange(c.session.time, c.session.endTime)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                className="rounded-full bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white"
                onClick={() => onGenerate(c.session.id, c.participantId)}
              >
                Generate card
              </button>
              {!studentId && c.studentId && (
                <Link
                  href={`/coach/students/${c.studentId}`}
                  className="text-center text-xs font-medium text-[#4F8FF7]"
                >
                  View student
                </Link>
              )}
              {studentId && (
                <Link
                  href={`/coach/sessions/${c.session.id}`}
                  className="text-center text-xs font-medium text-[#6B7280]"
                >
                  Open session
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
