"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ClipboardList,
  Layers,
  PenLine,
  Sparkles,
} from "lucide-react";
import type { ProgramDraft } from "@/lib/koaches/program-templates";
import {
  PROGRAM_PRESETS,
  SKILL_RUBRICS,
  draftCustom,
  draftFromPreset,
  draftFromRubric,
} from "@/lib/koaches/program-templates";
import type { ProgramPresetId, SkillRubricId } from "@/lib/koaches/types";
import {
  ALL_SKILL_CATEGORIES,
  DEFAULT_SKILLS,
  SKILL_CATEGORY_LABELS,
  getSkillsForRubric,
} from "@/lib/koaches/constants";
import { PresetIcon } from "@/components/koaches/coach/CoachIcons";
import { SkillRubricPreview } from "@/components/koaches/coach/SkillRubricPreview";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetField, CoachSheetStickyActions } from "@/components/koaches/coach/CoachSheet";
import { SessionCountField } from "@/components/koaches/coach/SessionCountField";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

type FlowMode = "home" | "templates" | "rubrics" | "custom";
type CustomStep = "details" | "rubric" | "review";
type TemplateStep = "pick" | "customize";

type ProgramCreateFlowProps = {
  open: boolean;
  onClose: () => void;
  onSave: (draft: ProgramDraft) => void | Promise<void>;
  /** Open directly into custom wizard */
  initialMode?: FlowMode;
};

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
  const [rubricBase, setRubricBase] = useState<Exclude<SkillRubricId, "custom"> | "scratch">("beginner");
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["fundamentals"]));
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
    setRubricBase("beginner");
    setOpenCategories(new Set(["fundamentals"]));
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

  const pickRubric = (id: Exclude<SkillRubricId, "custom">) => {
    const d = draftFromRubric(id);
    setDraft(d);
    setMode("templates");
    setTemplateStep("customize");
  };

  const applyRubricBase = (base: Exclude<SkillRubricId, "custom"> | "scratch") => {
    setRubricBase(base);
    if (!draft) return;
    if (base === "scratch") {
      setDraft({ ...draft, rubricId: "custom", customSkillIds: [] });
    } else {
      const skillIds = getSkillsForRubric(base).map((s) => s.id);
      setDraft({ ...draft, rubricId: "custom", customSkillIds: skillIds });
    }
  };

  const toggleCategory = (cat: string) => {
    if (!draft) return;
    const catSkills = DEFAULT_SKILLS.filter((s) => s.category === cat).map((s) => s.id);
    const ids = new Set(draft.customSkillIds ?? []);
    const allOn = catSkills.every((id) => ids.has(id));
    if (allOn) catSkills.forEach((id) => ids.delete(id));
    else catSkills.forEach((id) => ids.add(id));
    setDraft({ ...draft, rubricId: "custom", customSkillIds: [...ids] });
  };

  const toggleSkill = (skillId: string) => {
    if (!draft) return;
    const ids = draft.customSkillIds ?? [];
    const next = ids.includes(skillId) ? ids.filter((id) => id !== skillId) : [...ids, skillId];
    setDraft({ ...draft, rubricId: "custom", customSkillIds: next });
  };

  const skillCount = draft?.customSkillIds?.length ?? 0;
  const canSaveCustom = draft?.name.trim() && skillCount > 0;

  const title = useMemo(() => {
    if (mode === "home") return "New Program";
    if (mode === "templates" && templateStep === "pick") return "Choose a Template";
    if (mode === "templates") return "Customize Template";
    if (mode === "rubrics") return "Choose Skill Level";
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

          <button
            type="button"
            onClick={() => setMode("rubrics")}
            className="coach-card w-full p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FACC15] text-[#14532D]">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold">Start from Skill Level</p>
                <p className="text-xs text-[#6B7280]">
                  Beginner, Intermediate, or Advanced rubric — like a Google Form
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

      {/* ── RUBRICS: pick skill level ── */}
      {mode === "rubrics" && (
        <div className="space-y-3">
          <button type="button" onClick={() => setMode("home")} className="inline-flex items-center gap-1 text-sm text-[#6B7280]">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-xs text-[#6B7280]">Pick the skill questionnaire for this program</p>
          {(Object.keys(SKILL_RUBRICS) as Array<keyof typeof SKILL_RUBRICS>).map((id) => {
            const rubric = SKILL_RUBRICS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickRubric(id)}
                className="coach-card w-full p-4 text-left hover:border-[#16A34A]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#4F8FF7]" />
                  <p className="font-heading font-semibold">{rubric.name}</p>
                  <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] font-medium text-[#166534]">
                    {rubric.subtitle}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">{rubric.description}</p>
              </button>
            );
          })}
        </div>
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
          <div className="flex items-center gap-1">
            {customSteps.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center gap-1">
                <div
                  className={cn(
                    "font-heading flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    customStep === s.id
                      ? "bg-[#16A34A] text-white"
                      : customSteps.findIndex((x) => x.id === customStep) > i
                        ? "bg-[#16A34A]/30 text-[#166534]"
                        : "bg-[#E5E7EB] text-[#6B7280]"
                  )}
                >
                  {customSteps.findIndex((x) => x.id === customStep) > i ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="hidden text-[10px] font-medium text-[#6B7280] sm:inline">{s.label}</span>
                {i < customSteps.length - 1 && <div className="h-px flex-1 bg-[#E5E7EB]" />}
              </div>
            ))}
          </div>

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
              <div className="grid grid-cols-2 gap-3">
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
                <CoachSheetField label="Target level" htmlFor="program-level">
                  <input
                    id="program-level"
                    className="coach-input"
                    placeholder="e.g. 2.5 to 3.0"
                    value={draft.targetLevel}
                    onChange={(e) => setDraft({ ...draft, targetLevel: e.target.value })}
                  />
                </CoachSheetField>
              </div>
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

          {customStep === "rubric" && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">
                This is your Google Form-style questionnaire — pick which skills you&apos;ll rate each session.
              </p>

              <div>
                <p className="text-xs font-medium text-[#6B7280]">Quick start from a base rubric</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["beginner", "intermediate", "advanced"] as const).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => applyRubricBase(id)}
                      className={cn(
                        "rounded-full px-3 py-2 text-xs font-semibold min-h-[36px]",
                        rubricBase === id ? "bg-[#16A34A] text-white" : "border border-[#E5E7EB] bg-white"
                      )}
                    >
                      {SKILL_RUBRICS[id].name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => applyRubricBase("scratch")}
                    className={cn(
                      "rounded-full px-3 py-2 text-xs font-semibold min-h-[36px]",
                      rubricBase === "scratch" ? "bg-[#14532D] text-white" : "border border-[#E5E7EB] bg-white"
                    )}
                  >
                    Pick from scratch
                  </button>
                </div>
              </div>

              <p className="text-xs font-medium text-[#6B7280]">
                {skillCount} skill{skillCount !== 1 ? "s" : ""} selected
              </p>

              <div className="space-y-2">
                {ALL_SKILL_CATEGORIES.map((cat) => {
                  const catSkills = DEFAULT_SKILLS.filter((s) => s.category === cat);
                  const selected = catSkills.filter((s) => draft.customSkillIds?.includes(s.id)).length;
                  const isOpen = openCategories.has(cat);
                  const allSelected = selected === catSkills.length;

                  return (
                    <div key={cat} className="overflow-hidden rounded-xl border border-[#E5E7EB]">
                      <div className="flex w-full min-h-[48px] items-center justify-between px-4 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenCategories((prev) => {
                              const next = new Set(prev);
                              if (next.has(cat)) next.delete(cat);
                              else next.add(cat);
                              return next;
                            });
                          }}
                          className="flex flex-1 items-center text-left"
                        >
                          <div>
                            <p className="font-heading text-sm font-semibold">{SKILL_CATEGORY_LABELS[cat]}</p>
                            <p className="text-xs text-[#6B7280]">{selected}/{catSkills.length} skills</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={cn(
                            "shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold min-h-[32px]",
                            allSelected ? "bg-[#16A34A] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                          )}
                        >
                          {allSelected ? "All on" : "Select all"}
                        </button>
                      </div>
                      {isOpen && (
                        <div className="space-y-1 border-t border-[#E5E7EB] px-3 py-2">
                          {catSkills.map((skill) => {
                            const on = draft.customSkillIds?.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                type="button"
                                onClick={() => toggleSkill(skill.id)}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm min-h-[44px]",
                                  on ? "bg-[#F0FDF4]/60" : "hover:bg-[#F9FAFB]"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                    on ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-[#D1D5DB]"
                                  )}
                                >
                                  {on && <Check className="h-3 w-3" />}
                                </span>
                                <span className={on ? "font-medium text-[#111827]" : "text-[#6B7280]"}>
                                  {skill.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

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
                  <span className="rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-semibold text-[#166534]">
                    {draft.targetLevel}
                  </span>
                  <span className="rounded-full border border-[#E5E7EB] px-2.5 py-0.5 text-xs text-[#6B7280]">
                    Custom rubric · {skillCount} skills
                  </span>
                </div>
              </div>

              <SkillRubricPreview rubricId="custom" customSkillIds={draft.customSkillIds} />

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
  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-[#6B7280]">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <SkillRubricPreview rubricId={draft.rubricId} customSkillIds={draft.customSkillIds} />

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

      <CoachSheetStickyActions>
        <CoachButton type="button" loading={saving} loadingLabel="Saving…" onClick={onSave}>
          Save Program
        </CoachButton>
      </CoachSheetStickyActions>
    </div>
  );
}
