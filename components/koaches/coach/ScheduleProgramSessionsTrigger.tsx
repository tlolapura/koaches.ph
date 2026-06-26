"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import type { Program } from "@/lib/koaches/types";
import { ScheduleProgramSessionsSheet } from "@/components/koaches/coach/ScheduleProgramSessionsSheet";

type ScheduleProgramSessionsTriggerProps = {
  program: Program;
};

export function ScheduleProgramSessionsTrigger({ program }: ScheduleProgramSessionsTriggerProps) {
  const [open, setOpen] = useState(false);
  const hasRoster = program.enrolledStudentIds.length > 0;

  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!hasRoster}
        className="coach-btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        <CalendarPlus className="h-4 w-4" />
        Add program session
      </button>
      {!hasRoster && (
        <p className="mt-2 text-xs text-[#6B7280]">
          Enroll a student on the roster before scheduling.
        </p>
      )}
      <ScheduleProgramSessionsSheet
        program={program}
        open={open}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}
