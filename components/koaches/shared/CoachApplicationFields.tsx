"use client";

import { useState, type ChangeEvent } from "react";
import type { ApplicationDraft } from "@/lib/koaches/application-form";
import {
  EMPTY_APPLICATION_DRAFT,
  formatCoachingLevelsLabel,
} from "@/lib/koaches/application-form";
import { joinPersonName } from "@/lib/koaches/person-name";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { CoachingLevelsPicker } from "@/components/koaches/shared/CoachingLevelsPicker";
import { SpecializationPicker } from "@/components/koaches/shared/SpecializationPicker";

export type ApplicationFieldStep = "identity" | "coaching" | "business";

const fieldStyles = {
  section: "font-heading text-sm font-semibold text-[#111827]",
  hint: "mt-0.5 text-xs text-[#6B7280]",
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


export function CoachApplicationFields({ step, draft, onDraftChange }: CoachApplicationFieldsProps) {
  if (step === "identity") {
    return (
      <div className="coach-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="First name" htmlFor="apply-first-name">
            <input
              id="apply-first-name"
              className="coach-input"
              autoComplete="given-name"
              placeholder="Bianca"
              required
              {...field(draft, onDraftChange, "firstName", draft.firstName)}
            />
          </CoachSheetField>
          <CoachSheetField label="Last name" htmlFor="apply-last-name">
            <input
              id="apply-last-name"
              className="coach-input"
              autoComplete="family-name"
              placeholder="Santos"
              required
              {...field(draft, onDraftChange, "lastName", draft.lastName)}
            />
          </CoachSheetField>
        </div>
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
        <CoachSheetField label="What do you coach?" htmlFor="apply-specialization">
          <SpecializationPicker
            id="apply-specialization"
            value={draft.specialization}
            onChange={(specialization) => onDraftChange({ specialization })}
            required
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
        hint="Optional — your public page on PickleKoach (e.g. picklekoach.com/coach/your-name)."
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
        <CoachingLevelsPicker
          className="mt-2"
          value={draft.coachingLevels}
          onChange={(coachingLevels) => onDraftChange({ coachingLevels })}
          hint=""
        />
      </div>
    </div>
  );
}

export function formatApplicationReview(draft: ApplicationDraft) {
  return {
    fullName: joinPersonName(draft.firstName, draft.lastName),
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
