"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useState } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import {
  ACHIEVEMENT_KIND_LABELS,
  ACHIEVEMENT_KINDS,
  achievementToDraft,
  createCoachAchievementId,
  draftsToAchievements,
  validateCoachAchievement,
  type CoachAchievementDraft,
} from "@/lib/koaches/coach-achievements";
import type { CoachAchievementKind } from "@/lib/koaches/types";
import { useCoachAchievements } from "@/hooks/useCoachAchievements";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { CoachAchievementsList } from "@/components/koaches/coach/CoachAchievementsList";

const ACHIEVEMENTS_FORM_ID = "coach-achievements-form";

const kindOptions = ACHIEVEMENT_KINDS.map((kind) => ({
  value: kind,
  label: ACHIEVEMENT_KIND_LABELS[kind],
}));

function emptyDraft(): CoachAchievementDraft {
  return {
    id: createCoachAchievementId(),
    kind: "certification",
    title: "",
    organization: "",
    year: "",
    detail: "",
  };
}

export function CoachAchievementsCard() {
  const coachId = usePortalCoachId();
  const { achievements, setAchievements } = useCoachAchievements(coachId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CoachAchievementDraft[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useCoachToast();

  const openEditor = () => {
    setDraft(
      achievements.length > 0 ? achievements.map(achievementToDraft) : [emptyDraft()]
    );
    setOpen(true);
  };

  const updateDraft = (id: string, patch: Partial<CoachAchievementDraft>) => {
    setDraft((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addDraft = () => {
    setDraft((rows) => [...rows, emptyDraft()]);
  };

  const removeDraft = (id: string) => {
    setDraft((rows) => rows.filter((row) => row.id !== id));
  };

  return (
    <>
      <div className="coach-card mt-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]">
              <Trophy className="h-5 w-5 text-[#166534]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold">Achievements</p>
              <p className="text-sm text-[#6B7280]">
                Certifications, education, competitions, tournaments, and leagues
              </p>
            </div>
          </div>
          <button type="button" className="shrink-0 text-sm font-semibold text-[#4F8FF7]" onClick={openEditor}>
            {achievements.length > 0 ? "Manage" : "Add"}
          </button>
        </div>

        {achievements.length === 0 ? (
          <p className="mt-4 rounded-xl bg-[#F9FAFB] px-3 py-4 text-center text-sm text-[#6B7280]">
            Showcase your credentials and competitive history on your public profile.
          </p>
        ) : (
          <CoachAchievementsList achievements={achievements} compact />
        )}
      </div>

      <CoachBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Achievements"
        subtitle="Shown on your public coach profile"
        footer={
          <CoachSheetFooter>
            <CoachButton type="submit" form={ACHIEVEMENTS_FORM_ID} loading={saving} loadingLabel="Saving…">
              Save achievements
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <form
          id={ACHIEVEMENTS_FORM_ID}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            for (const row of draft) {
              const error = validateCoachAchievement({
                title: row.title,
                kind: row.kind,
              });
              if (error) {
                showToast(error, "error");
                return;
              }
            }
            void (async () => {
              setSaving(true);
              try {
                await setAchievements(draftsToAchievements(draft));
                showToast("Achievements saved");
                setOpen(false);
              } catch {
                showToast("Could not save achievements. Please try again.", "error");
              } finally {
                setSaving(false);
              }
            })();
          }}
        >
          <div className="space-y-3">
            {draft.map((row, index) => (
              <div key={row.id} className="rounded-xl border border-[#E5E7EB] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Entry {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeDraft(row.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#EF4444]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>

                <div className="space-y-3">
                  <CoachSheetField label="Type">
                    <CoachSelect
                      value={row.kind}
                      onChange={(value) =>
                        updateDraft(row.id, { kind: value as CoachAchievementKind })
                      }
                      options={kindOptions}
                    />
                  </CoachSheetField>

                  <CoachSheetField label="Title" hint="e.g. PPR Level 2, BS Sports Science">
                    <input
                      className="coach-input"
                      value={row.title}
                      onChange={(e) => updateDraft(row.id, { title: e.target.value })}
                      placeholder="Achievement title"
                      required
                    />
                  </CoachSheetField>

                  <CoachSheetField label="Organization" hint="Optional">
                    <input
                      className="coach-input"
                      value={row.organization}
                      onChange={(e) => updateDraft(row.id, { organization: e.target.value })}
                      placeholder="Federation, school, cert body…"
                    />
                  </CoachSheetField>

                  <div className="grid grid-cols-2 gap-3">
                    <CoachSheetField label="Year" hint="Optional">
                      <input
                        className="coach-input"
                        value={row.year}
                        onChange={(e) => updateDraft(row.id, { year: e.target.value })}
                        placeholder="2024"
                        inputMode="numeric"
                      />
                    </CoachSheetField>
                    <CoachSheetField label="Result / level" hint="Optional">
                      <input
                        className="coach-input"
                        value={row.detail}
                        onChange={(e) => updateDraft(row.id, { detail: e.target.value })}
                        placeholder="Gold, Semi-final…"
                      />
                    </CoachSheetField>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addDraft}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#16A34A]/50 bg-[#F0FDF4]/50 text-sm font-semibold text-[#4F8FF7]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add another
          </button>

          <p className="text-xs text-[#6B7280]">
            Use Education for degrees and sports science — e.g. BS Sports Science.
          </p>
        </form>
      </CoachBottomSheet>
    </>
  );
}
