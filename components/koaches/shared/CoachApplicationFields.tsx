"use client";

import { useState, type ChangeEvent } from "react";
import type { ApplicationDraft, CoachingLevelId } from "@/lib/koaches/application-form";
import {
  COACHING_LEVEL_OPTIONS,
  EMPTY_APPLICATION_DRAFT,
  formatCoachingLevelsLabel,
  toggleCoachingLevel,
} from "@/lib/koaches/application-form";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

export type ApplicationFieldStep = "identity" | "coaching" | "business";

const fieldStyles = {
  section: "font-heading text-sm font-semibold text-[#111827]",
  hint: "mt-0.5 text-xs text-[#6B7280]",
  levelCard:
    "flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] p-3 transition-colors hover:border-[#4F8FF7]/40",
  levelCardActive: "border-[#16A34A] bg-[#F0FDF4]",
} as const;

type CoachApplicationFieldsProps = {
  step: ApplicationFieldStep;
  draft: ApplicationDraft;
  onDraftChange: (patch: Partial<ApplicationDraft>) => void;
};

export function useCoachApplicationDraft() {
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_APPLICATION_DRAFT);

  const patch = (update: Partial<ApplicationDraft>) => {
    setDraft((prev) => ({ ...prev, ...update }));
  };

  return { draft, patch, setDraft };
}

function field(
  draft: ApplicationDraft,
  onDraftChange: (patch: Partial<ApplicationDraft>) => void,
  key: keyof ApplicationDraft,
  value: string
) {
  return {
    value,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onDraftChange({ [key]: e.target.value }),
  };
}

function LevelCheckbox({
  id,
  label,
  dupr,
  checked,
  onToggle,
}: {
  id: CoachingLevelId;
  label: string;
  dupr: string;
  checked: boolean;
  onToggle: (id: CoachingLevelId) => void;
}) {
  return (
    <label htmlFor={id} className={`${fieldStyles.levelCard} ${checked ? fieldStyles.levelCardActive : ""}`}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#1D4ED8] focus:ring-[#16A34A]"
        checked={checked}
        onChange={() => onToggle(id)}
      />
      <div>
        <span className="text-sm font-medium text-[#111827]">{label}</span>
        <p className="text-xs text-[#6B7280]">{dupr} DUPR</p>
      </div>
    </label>
  );
}

export function CoachApplicationFields({ step, draft, onDraftChange }: CoachApplicationFieldsProps) {
  const toggleLevel = (id: CoachingLevelId) => {
    onDraftChange({ coachingLevels: toggleCoachingLevel(draft.coachingLevels, id) });
  };

  if (step === "identity") {
    return (
      <div className="coach-form">
        <CoachSheetField label="Full name" htmlFor="apply-full-name">
          <input
            id="apply-full-name"
            className="coach-input"
            autoComplete="name"
            placeholder="Juan dela Cruz"
            required
            {...field(draft, onDraftChange, "fullName", draft.fullName)}
          />
        </CoachSheetField>
        <CoachSheetField label="Mobile number" htmlFor="apply-mobile">
          <input
            id="apply-mobile"
            className="coach-input"
            type="tel"
            autoComplete="tel"
            placeholder="09171234567"
            required
            {...field(draft, onDraftChange, "mobile", draft.mobile)}
          />
        </CoachSheetField>
        <CoachSheetField
          label="Email"
          htmlFor="apply-email"
          hint="We'll reach out here for onboarding and your coach login."
        >
          <input
            id="apply-email"
            className="coach-input"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            {...field(draft, onDraftChange, "email", draft.email)}
          />
        </CoachSheetField>
      </div>
    );
  }

  if (step === "coaching") {
    return (
      <div className="coach-form">
        <CoachSheetField label="Specialization" htmlFor="apply-specialization">
          <input
            id="apply-specialization"
            className="coach-input"
            placeholder="e.g. Beginner basics · Kitchen play"
            required
            {...field(draft, onDraftChange, "specialization", draft.specialization)}
          />
        </CoachSheetField>
        <CoachSheetField label="About your coaching" htmlFor="apply-bio">
          <textarea
            id="apply-bio"
            className="coach-input min-h-[120px] resize-none"
            required
            placeholder="What do you love teaching? Who do you work best with?"
            {...field(draft, onDraftChange, "bio", draft.bio)}
          />
        </CoachSheetField>
        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="Instagram" htmlFor="apply-instagram">
            <input
              id="apply-instagram"
              className="coach-input"
              placeholder="@handle or profile URL"
              {...field(draft, onDraftChange, "instagram", draft.instagram)}
            />
          </CoachSheetField>
          <CoachSheetField label="Facebook" htmlFor="apply-facebook">
            <input
              id="apply-facebook"
              className="coach-input"
              placeholder="Profile URL"
              {...field(draft, onDraftChange, "facebook", draft.facebook)}
            />
          </CoachSheetField>
        </div>
        <CoachSheetField label="Current students (optional)" htmlFor="apply-students">
          <input
            id="apply-students"
            className="coach-input"
            type="number"
            min={0}
            placeholder="0"
            {...field(draft, onDraftChange, "students", draft.students)}
          />
        </CoachSheetField>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <CoachSheetField
        label="Preferred profile URL"
        htmlFor="apply-slug"
        hint="Optional — your public page on KoachesPH (e.g. koaches.ph/coaches/your-name)."
      >
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm text-[#6B7280]">/coaches/</span>
          <input
            id="apply-slug"
            className="coach-input"
            placeholder="your-name"
            {...field(draft, onDraftChange, "preferredSlug", draft.preferredSlug)}
          />
        </div>
      </CoachSheetField>

      <div>
        <p className={fieldStyles.section}>Which player levels do you coach?</p>
        <p className={fieldStyles.hint}>Select all that apply — beginner, intermediate, or advanced players.</p>
        <div className="mt-3 space-y-2">
          {COACHING_LEVEL_OPTIONS.map((option) => (
            <LevelCheckbox
              key={option.id}
              id={option.id}
              label={option.label}
              dupr={option.dupr}
              checked={draft.coachingLevels.includes(option.id)}
              onToggle={toggleLevel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function formatApplicationReview(draft: ApplicationDraft) {
  return {
    fullName: draft.fullName.trim(),
    mobile: draft.mobile.trim(),
    email: draft.email.trim(),
    specialization: draft.specialization.trim(),
    bio: draft.bio.trim(),
    instagram: draft.instagram.trim(),
    facebook: draft.facebook.trim(),
    preferredSlug: draft.preferredSlug.trim(),
    coachingLevelsLabel: formatCoachingLevelsLabel(draft.coachingLevels),
    students: Number(draft.students) || 0,
  };
}
