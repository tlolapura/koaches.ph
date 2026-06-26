"use client";

import { useState, type ChangeEvent } from "react";
import type { ApplicationDraft, CoachingLevelId } from "@/lib/koaches/application-form";
import {
  COACHING_LEVEL_OPTIONS,
  EMPTY_APPLICATION_DRAFT,
  formatCoachingLevelsLabel,
  toggleCoachingLevel,
} from "@/lib/koaches/application-form";

export type ApplicationFieldStep = "identity" | "coaching" | "business";

const fieldStyles = {
  label: "font-heading text-xs font-semibold text-[#374151]",
  input: "coach-input mt-1.5",
  textarea: "coach-input mt-1.5 min-h-[120px] resize-none",
  section: "font-heading text-sm font-semibold text-[#111827]",
  hint: "mt-0.5 text-xs text-[#6B7280]",
  levelCard:
    "flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] p-3 transition-colors hover:border-[#1E3A5F]/30",
  levelCardActive: "border-[#1E3A5F] bg-[#EDF2F7]/70",
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
    <label className={`${fieldStyles.levelCard} ${checked ? fieldStyles.levelCardActive : ""}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D1D5DB] text-[#1E3A5F] focus:ring-[#1E3A5F]"
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
      <div className="space-y-4">
        <div>
          <label className={fieldStyles.label}>Full name</label>
          <input className={fieldStyles.input} autoComplete="name" required {...field(draft, onDraftChange, "fullName", draft.fullName)} />
        </div>
        <div>
          <label className={fieldStyles.label}>Mobile number</label>
          <input className={fieldStyles.input} type="tel" autoComplete="tel" required {...field(draft, onDraftChange, "mobile", draft.mobile)} />
        </div>
        <div>
          <label className={fieldStyles.label}>Email</label>
          <input className={fieldStyles.input} type="email" autoComplete="email" required {...field(draft, onDraftChange, "email", draft.email)} />
          <p className={fieldStyles.hint}>We&apos;ll reach out here for onboarding and your coach login.</p>
        </div>
      </div>
    );
  }

  if (step === "coaching") {
    return (
      <div className="space-y-4">
        <div>
          <label className={fieldStyles.label}>Specialization</label>
          <input
            className={fieldStyles.input}
            placeholder="e.g. Beginner basics · Kitchen play"
            required
            {...field(draft, onDraftChange, "specialization", draft.specialization)}
          />
        </div>
        <div>
          <label className={fieldStyles.label}>About your coaching</label>
          <textarea
            className={fieldStyles.textarea}
            required
            placeholder="What do you love teaching? Who do you work best with?"
            {...field(draft, onDraftChange, "bio", draft.bio)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldStyles.label}>Instagram</label>
            <input
              className={fieldStyles.input}
              placeholder="@handle or profile URL"
              {...field(draft, onDraftChange, "instagram", draft.instagram)}
            />
          </div>
          <div>
            <label className={fieldStyles.label}>Facebook</label>
            <input
              className={fieldStyles.input}
              placeholder="Profile URL"
              {...field(draft, onDraftChange, "facebook", draft.facebook)}
            />
          </div>
        </div>
        <div>
          <label className={fieldStyles.label}>Current students (optional)</label>
          <input
            className={fieldStyles.input}
            type="number"
            min={0}
            placeholder="0"
            {...field(draft, onDraftChange, "students", draft.students)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className={fieldStyles.section}>Preferred profile URL</p>
        <p className={fieldStyles.hint}>Optional — your public page on KoachesPH (e.g. koaches.ph/coaches/your-name).</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="shrink-0 text-sm text-[#6B7280]">/coaches/</span>
          <input
            className="coach-input flex-1"
            placeholder="your-name"
            {...field(draft, onDraftChange, "preferredSlug", draft.preferredSlug)}
          />
        </div>
      </div>

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
