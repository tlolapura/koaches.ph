"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Layers,
  PenLine,
} from "lucide-react";
import type { ProgramDraft } from "@/lib/koaches/program-templates";
import {
  PROGRAM_PRESETS,
  draftCustom,
  draftFromPreset,
} from "@/lib/koaches/program-templates";
import type { ProgramPresetId } from "@/lib/koaches/types";
import { getSkillsForRubric } from "@/lib/koaches/constants";
import { PresetIcon } from "@/components/koaches/coach/CoachIcons";
import { SkillRubricPreview } from "@/components/koaches/coach/SkillRubricPreview";
import {
  SkillRubricPicker,
  type SkillRubricPickerValue,
} from "@/components/koaches/coach/SkillRubricPicker";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachStepper } from "@/components/koaches/coach/CoachStepper";
import { CoachSheetField, CoachSheetStickyActions } from "@/components/koaches/coach/CoachSheet";
import { SessionCountField } from "@/components/koaches/coach/SessionCountField";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

type FlowMode = "home" | "templates" | "custom";
type CustomStep = "details" | "rubric" | "review";
type TemplateStep = "pick" | "customize";

type ProgramCreateFlowProps = {
  open: boolean;
  onClose: () => void;
  onSave: (draft: ProgramDraft) => void | Promise<void>;
  /** Open directly into custom wizard */
  initialMode?: FlowMode;
};

function draftToSkillRubric(draft: ProgramDraft): SkillRubricPickerValue {
  if (draft.source === "custom") {
    return {
      rubricId: "custom",
      customSkillIds: draft.customSkillIds ?? [],
      customSkills: draft.customSkills ?? [],
      skillLabelOverrides: draft.skillLabelOverrides ?? {},
    };
  }

  if (draft.customSkillIds?.length) {
    return {
      rubricId: draft.rubricId === "custom" ? "custom" : draft.rubricId,
      customSkillIds: draft.customSkillIds,
      customSkills: draft.customSkills ?? [],
      skillLabelOverrides: draft.skillLabelOverrides ?? {},
    };
  }

  const base = draft.rubricId === "custom" ? "intermediate" : draft.rubricId;
  return {
    rubricId: base,
    customSkillIds: getSkillsForRubric(base).map((skill) => skill.id),
    customSkills: draft.customSkills ?? [],
    skillLabelOverrides: draft.skillLabelOverrides ?? {},
  };
}

function applySkillRubricToDraft(
  draft: ProgramDraft,
  value: SkillRubricPickerValue
): ProgramDraft {
  return {
    ...draft,
    rubricId: "custom",
    customSkillIds: value.customSkillIds,
    customSkills: value.customSkills,
    skillLabelOverrides: value.skillLabelOverrides,
  };
}

export function ProgramCreateFlow({
  open,
  onClose,
  onSave,
  initialMode = "home",
}: ProgramCreateFlowProps) {
  const [mode, setMode] = useState<FlowMode>(initialMode);
  const [customStep, setCustomStep] = useState<CustomStep>("details");
  const [templateStep, setTemplateStep] = useState<TemplateStep>("pick");
  const [draft, setDraft] = useState<ProgramDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const submitDraft = async (next: ProgramDraft) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(next);
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (initialMode === "custom") {
      setDraft(draftCustom());
      setMode("custom");
      setCustomStep("details");
    } else {
      setMode("home");
      setDraft(null);
    }
  }, [open, initialMode]);

  const reset = () => {
    setMode(initialMode);
    setCustomStep("details");
    setTemplateStep("pick");
    setDraft(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startCustom = () => {
    setDraft(draftCustom());
    setMode("custom");
    setCustomStep("details");
  };

  const pickPreset = (id: ProgramPresetId) => {
    const d = draftFromPreset(id);
    setDraft(d);
    setMode("templates");
    setTemplateStep("customize");
  };

  const skillCount = draft?.customSkillIds?.length ?? 0;
  const canSaveCustom = draft?.name.trim() && skillCount > 0;

  const title = useMemo(() => {
    if (mode === "home") return "New Program";
    if (mode === "templates" && templateStep === "pick") return "Choose a Template";
    if (mode === "templates") return "Customize Template";
    if (mode === "custom") {
      if (customStep === "details") return "Create Your Program";
      if (customStep === "rubric") return "Build Your Skill Rubric";
      return "Review & Save";
    }
    return "New Program";
  }, [mode, templateStep, customStep]);

  const customSteps: { id: CustomStep; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "rubric", label: "Skills" },
    { id: "review", label: "Review" },
  ];

  return (
    <CoachBottomSheet open={open} onClose={handleClose} title={title}>
      {/* ── HOME: 3 clear paths ── */}
      {mode === "home" && (
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">How would you like to create this program?</p>

          <button
            type="button"
            onClick={startCustom}
            className="w-full rounded-2xl border-2 border-[#16A34A] bg-[#F0FDF4]/40 p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16A34A] text-white">
                <PenLine className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-[#111827]">Create Your Own</p>
                <p className="text-xs text-[#6B7280]">
                  Name it, set your price, pick your sessions, and build a custom skill rubric
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#4F8FF7]" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setMode("templates"); setTemplateStep("pick"); }}
            className="coach-card w-full p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14532D] text-white">
                <Layers className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold">Use a Program Template</p>
                <p className="text-xs text-[#6B7280]">
                  Open Play Ready, Tournament Ready, and more — customize to fit
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-[#6B7280]" />
            </div>
          </button>
        </div>
      )}

      {/* ── TEMPLATES: pick preset ── */}
      {mode === "templates" && templateStep === "pick" && (
        <div className="space-y-3">
          <button type="button" onClick={() => setMode("home")} className="inline-flex items-center gap-1 text-sm text-[#6B7280]">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {PROGRAM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => pickPreset(preset.id)}
              className="coach-card w-full p-4 text-left hover:border-[#16A34A]"
            >
              <div className="flex items-start gap-3">
                <PresetIcon icon={preset.icon} />
                <div>
                  <p className="font-heading font-semibold">{preset.name}</p>
                  <p className="text-xs text-[#4F8FF7]">{preset.tagline}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">{preset.description}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="rounded-full bg-[#14532D] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {preset.sessionCount} sessions · {formatCurrency(preset.price)}/person
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── TEMPLATES: customize preset ── */}
      {mode === "templates" && templateStep === "customize" && draft && (
        <TemplateCustomizeForm
          draft={draft}
          setDraft={setDraft}
          onBack={() => setTemplateStep("pick")}
          onSave={() => void submitDraft(draft)}
          saving={saving}
        />
      )}

      {/* ── CUSTOM: 3-step wizard ── */}
      {mode === "custom" && draft && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              if (customStep === "details") setMode("home");
              else if (customStep === "rubric") setCustomStep("details");
              else setCustomStep("rubric");
            }}
            className="inline-flex items-center gap-1 text-sm text-[#6B7280]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {/* Step indicator */}
          <CoachStepper
            card={false}
            variant="compact"
            steps={customSteps}
            currentStepId={customStep}
          />

          {customStep === "details" && (
            <div className="space-y-4">
              <CoachSheetField label="Program name *" htmlFor="program-name">
                <input
                  id="program-name"
                  className="coach-input"
                  placeholder="e.g. Weekend Warriors"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </CoachSheetField>
              <CoachSheetField label="Description" htmlFor="program-description">
                <textarea
                  id="program-description"
                  className="coach-input min-h-[88px] resize-none"
                  placeholder="What will students learn and achieve?"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </CoachSheetField>
              <CoachSheetField label="Bundle price per person (₱)" htmlFor="program-price">
                <input
                  id="program-price"
                  className="coach-input"
                  type="number"
                  min={0}
                  placeholder="2500"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                />
              </CoachSheetField>
              <SessionCountField
                value={draft.sessionCount}
                onChange={(sessionCount) => setDraft({ ...draft, sessionCount })}
              />
              <CoachSheetStickyActions>
                <button
                  type="button"
                  className="coach-btn-primary"
                  disabled={!draft.name.trim()}
                  onClick={() => setCustomStep("rubric")}
                >
                  Next: Build Skill Rubric
                </button>
              </CoachSheetStickyActions>
            </div>
          )}

          {customStep === "rubric" && draft && (
            <div className="space-y-4">
              <SkillRubricPicker
                value={draftToSkillRubric(draft)}
                onChange={(value) => setDraft(applySkillRubricToDraft(draft, value))}
                hint="Pick catalog skills, add your own per category, or rename anything."
                defaultExpanded
              />

              <CoachSheetStickyActions>
                <button
                  type="button"
                  className="coach-btn-primary"
                  disabled={skillCount === 0}
                  onClick={() => setCustomStep("review")}
                >
                  Next: Review
                </button>
              </CoachSheetStickyActions>
            </div>
          )}

          {customStep === "review" && (
            <div className="space-y-4">
              <div className="coach-card p-4">
                <p className="font-heading text-lg font-bold">{draft.name}</p>
                {draft.description && (
                  <p className="mt-1 text-sm text-[#6B7280]">{draft.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#16A34A] px-2.5 py-0.5 text-xs font-semibold text-white">
                    {formatCurrency(draft.price)}/person
                  </span>
                  <span className="rounded-full bg-[#14532D] px-2.5 py-0.5 text-xs font-semibold text-white">
                    {draft.sessionCount} sessions
                  </span>
                  <span className="rounded-full border border-[#E5E7EB] px-2.5 py-0.5 text-xs text-[#6B7280]">
                    Custom rubric · {skillCount} skills
                  </span>
                </div>
              </div>

              <SkillRubricPreview
                rubricId="custom"
                customSkillIds={draft.customSkillIds}
                customSkills={draft.customSkills}
                skillLabelOverrides={draft.skillLabelOverrides}
              />

              <CoachSheetStickyActions>
                <CoachButton
                  type="button"
                  disabled={!canSaveCustom}
                  loading={saving}
                  loadingLabel="Creating…"
                  onClick={() => void submitDraft({ ...draft, source: "custom", rubricId: "custom" })}
                >
                  Create Program
                </CoachButton>
              </CoachSheetStickyActions>
            </div>
          )}
        </div>
      )}
    </CoachBottomSheet>
  );
}

function TemplateCustomizeForm({
  draft,
  setDraft,
  onBack,
  onSave,
  saving = false,
}: {
  draft: ProgramDraft;
  setDraft: (d: ProgramDraft) => void;
  onBack: () => void;
  onSave: () => void;
  saving?: boolean;
}) {
  const skillCount = draft.customSkillIds?.length ?? 0;

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-[#6B7280]">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <CoachSheetField label="Program name" htmlFor="template-program-name">
        <input
          id="template-program-name"
          className="coach-input"
          placeholder="e.g. Play Ready"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
      </CoachSheetField>
      <CoachSheetField label="Description" htmlFor="template-program-description">
        <textarea
          id="template-program-description"
          className="coach-input min-h-[72px] resize-none"
          placeholder="What will students learn and achieve?"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </CoachSheetField>
      <CoachSheetField label="Bundle price per person (₱)" htmlFor="template-program-price">
        <input
          id="template-program-price"
          className="coach-input"
          type="number"
          min={0}
          placeholder="2500"
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
        />
      </CoachSheetField>
      <SessionCountField
        value={draft.sessionCount}
        onChange={(sessionCount) => setDraft({ ...draft, sessionCount })}
      />

      <div className="border-t border-[#E5E7EB] pt-4">
        <p className="font-heading text-sm font-semibold text-[#111827]">Skills</p>
        <p className="mt-0.5 text-xs text-[#6B7280]">
          Starts from the template rubric — adjust, rename, or add your own.
        </p>
        <div className="mt-3">
          <SkillRubricPicker
            value={draftToSkillRubric(draft)}
            onChange={(value) => setDraft(applySkillRubricToDraft(draft, value))}
            defaultExpanded
          />
        </div>
      </div>

      <CoachSheetStickyActions>
        <CoachButton
          type="button"
          loading={saving}
          loadingLabel="Saving…"
          disabled={!draft.name.trim() || skillCount === 0}
          onClick={onSave}
        >
          Save Program
        </CoachButton>
      </CoachSheetStickyActions>
    </div>
  );
}
