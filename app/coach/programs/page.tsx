"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import Link from "next/link";
import { useState } from "react";
import { ClipboardList, PenLine, Plus, Zap } from "lucide-react";
import { getProgramPreset } from "@/lib/koaches/program-templates";
import type { ProgramDraft } from "@/lib/koaches/program-templates";
import { resolveSkills } from "@/lib/koaches/constants";
import { CoachFab, EmptyState } from "@/components/koaches/coach/CoachUi";
import { ProgramListIcon } from "@/components/koaches/coach/CoachIcons";
import { ProgramCreateFlow } from "@/components/koaches/coach/ProgramCreateFlow";
import { DropInSkillsSheet } from "@/components/koaches/coach/DropInSkillsSheet";
import { formatProgramBundleSummary } from "@/lib/koaches/program-pricing";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachProgramListSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { useCoachPrograms, useCreateProgram } from "@/hooks/useCoachPrograms";
import { useCoachProfile } from "@/hooks/useCoachProfile";

export default function ProgramsPage() {
  const coachId = usePortalCoachId();
  const [createOpen, setCreateOpen] = useState(false);
  const [dropInOpen, setDropInOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"home" | "custom">("home");
  const { programs, loading } = useCoachPrograms(coachId);
  const { coach, refresh: refreshCoach } = useCoachProfile(coachId);
  const createProgram = useCreateProgram(coachId);

  const dropInSkillCount = coach
    ? resolveSkills({
        rubricId: coach.customSkillIds?.length ? "custom" : coach.skillTemplateId,
        customSkillIds: coach.customSkillIds,
        customSkills: coach.customSkills,
        skillLabelOverrides: coach.skillLabelOverrides,
      }).length
    : 0;

  const openCreate = (mode: "home" | "custom" = "home") => {
    setCreateMode(mode);
    setCreateOpen(true);
  };

  const handleSave = async (draft: ProgramDraft) => {
    await createProgram.mutateAsync(draft);
  };

  if (!coachId) return <CoachProgramListSkeleton />;

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Programs"
        subtitle="Packages and skill lists you reuse with students"
      />

      {coach && (
        <button
          type="button"
          onClick={() => setDropInOpen(true)}
          className="coach-card mt-5 flex w-full items-center gap-3 p-4 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <Zap className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold">Drop-in skills</p>
            <p className="text-xs text-[#6B7280]">
              {dropInSkillCount} skills · customize what you rate on one-off sessions
            </p>
          </div>
          <span className="text-xs font-semibold text-[#4F8FF7]">Edit →</span>
        </button>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => openCreate("custom")}
          className="flex min-h-[72px] items-center gap-3 rounded-2xl border-2 border-[#16A34A] bg-[#F0FDF4]/30 p-4 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] text-white">
            <PenLine className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Create Custom Program</p>
            <p className="text-xs text-[#6B7280]">Your name, price, sessions & skills</p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => openCreate("home")}
          className="coach-card flex min-h-[72px] items-center gap-3 p-4 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14532D] text-white">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Use a Template</p>
            <p className="text-xs text-[#6B7280]">Open Play Ready, Tournament Ready…</p>
          </div>
        </button>
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Your programs</h2>
        {programs.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={ClipboardList}
              title="No programs yet"
              action={
                <button type="button" className="coach-btn-primary max-w-xs" onClick={() => openCreate("custom")}>
                  Create Custom Program
                </button>
              }
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {programs.map((p) => {
              const preset = p.presetId ? getProgramPreset(p.presetId) : null;
              const isCustom = p.source === "custom";
              const skillCount = p.customSkillIds?.length ?? 0;

              return (
                <Link key={p.id} href={`/coach/programs/${p.id}`} className="coach-card block p-4">
                  <div className="flex items-start gap-3">
                    <ProgramListIcon presetIcon={preset?.icon} isCustom={isCustom} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-lg font-bold">{p.name}</p>
                        {isCustom && (
                          <span className="rounded-full bg-[#14532D] px-2 py-0.5 text-[10px] font-semibold text-white">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#6B7280]">{p.description}</p>
                      <p className="font-heading mt-2 text-sm font-semibold text-[#4F8FF7]">
                        {formatProgramBundleSummary(p)}
                      </p>
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        {p.enrolledStudentIds.length} enrolled · {skillCount} skills
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <CoachFab onClick={() => openCreate("home")} label="Create program" />

      <ProgramCreateFlow
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        initialMode={createMode}
        onSave={handleSave}
      />

      {coach && (
        <DropInSkillsSheet
          open={dropInOpen}
          onClose={() => setDropInOpen(false)}
          coach={coach}
          onSaved={() => void refreshCoach()}
        />
      )}
    </CoachPageShell>
  );
}
