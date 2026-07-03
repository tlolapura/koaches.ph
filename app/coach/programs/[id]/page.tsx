"use client";

import Link from "next/link";
import { use, useState } from "react";
import { notFound } from "next/navigation";
import {
  getProgramPreset,
} from "@/lib/koaches/program-templates";
import { programSkillsFromProgram } from "@/components/koaches/coach/SkillRubricPicker";
import { SkillRubricPreview } from "@/components/koaches/coach/SkillRubricPreview";
import { PresetIcon } from "@/components/koaches/coach/CoachIcons";
import { InitialsAvatar } from "@/components/koaches/coach/CoachUi";
import {
  CoachBackLink,
  CoachEntityTitle,
  CoachPageShell,
  CoachSectionHint,
  CoachSectionTitle,
} from "@/components/koaches/coach/CoachPageLayout";
import { CoachDetailSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { ScheduleProgramSessionsTrigger } from "@/components/koaches/coach/ScheduleProgramSessionsTrigger";
import { AssignStudentSheet } from "@/components/koaches/coach/AssignStudentSheet";
import { ProgramSkillsEditSheet } from "@/components/koaches/coach/ProgramSkillsEditSheet";
import { formatProgramBundleSummary } from "@/lib/koaches/program-pricing";
import { useCoachProgram } from "@/hooks/useCoachPrograms";
import { useCoachStudents } from "@/hooks/useCoachStudents";

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [assignOpen, setAssignOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);
  const { program, loading, refresh } = useCoachProgram(id);
  const { students: rosterStudents } = useCoachStudents(program?.coachId ?? "", true);

  if (loading) return <CoachDetailSkeleton />;

  if (!program) notFound();

  const preset = program.presetId ? getProgramPreset(program.presetId) : null;
  const programSkills = programSkillsFromProgram(program);

  const enrolled = rosterStudents.filter((s) => program.enrolledStudentIds.includes(s.id));

  return (
    <CoachPageShell>
      <CoachBackLink href="/coach/programs" label="Programs" className="hidden md:inline-flex" />

      <div className="coach-card mt-4 p-5">
        <div className="flex items-start gap-3">
          {preset && <PresetIcon icon={preset.icon} className="h-12 w-12 rounded-xl" iconClassName="h-6 w-6" />}
          <div>
            <CoachEntityTitle>{program.name}</CoachEntityTitle>
            {preset && <p className="text-sm text-[#4F8FF7]">{preset.tagline}</p>}
            <p className="mt-2 text-sm text-[#6B7280]">{program.description}</p>
            <p className="font-heading mt-3 text-lg font-semibold text-[#4F8FF7]">
              {formatProgramBundleSummary(program)}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {program.sessionCount} sessions
              {programSkills.customSkillIds.length > 0 &&
                ` · ${programSkills.customSkillIds.length} skills`}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <CoachSectionTitle size="sm">Skill rubric</CoachSectionTitle>
          <button
            type="button"
            onClick={() => setSkillsOpen(true)}
            className="text-xs font-semibold text-[#4F8FF7]"
          >
            Edit skills →
          </button>
        </div>
        <CoachSectionHint>Students in this program are rated on these skills each session</CoachSectionHint>
        <SkillRubricPreview
          rubricId={programSkills.rubricId}
          customSkillIds={programSkills.customSkillIds}
          customSkills={programSkills.customSkills}
          skillLabelOverrides={programSkills.skillLabelOverrides}
          className="mt-3"
        />
      </section>

      <ScheduleProgramSessionsTrigger program={program} />

      <CoachSectionTitle className="mt-8">Roster</CoachSectionTitle>
      <CoachSectionHint>Skill progress and ratings are on each student&apos;s profile</CoachSectionHint>
      <div className="mt-4 space-y-3">
        {enrolled.map((s) => (
          <Link key={s.id} href={`/coach/students/${s.id}`} className="coach-card block p-4">
            <div className="flex items-center gap-3">
              <InitialsAvatar name={s.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="font-heading font-semibold">{s.name}</p>
                <p className="text-xs text-[#6B7280]">
                  {s.sessionsCompleted} of {program.sessionCount} sessions
                </p>
              </div>
              <span className="text-xs font-semibold text-[#4F8FF7]">View →</span>
            </div>
          </Link>
        ))}
      </div>

      <button type="button" className="coach-btn-secondary mt-8" onClick={() => setAssignOpen(true)}>
        Assign Student
      </button>

      <AssignStudentSheet
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        program={program}
        onAssigned={refresh}
      />

      <ProgramSkillsEditSheet
        open={skillsOpen}
        onClose={() => setSkillsOpen(false)}
        program={program}
        onSaved={refresh}
      />
    </CoachPageShell>
  );
}
