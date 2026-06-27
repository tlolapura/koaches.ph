"use client";

import Link from "next/link";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useEffect, useState } from "react";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { SKILL_RUBRICS } from "@/lib/koaches/program-templates";
import { formatPricingSummary, formatTierRate, formatTierLabel, DEFAULT_SESSION_PRICING, getStartingRate } from "@/lib/koaches/pricing";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { PricingTiersEditor } from "@/components/koaches/coach/PricingTiersEditor";
import { WorkingHoursCard } from "@/components/koaches/coach/WorkingHoursCard";
import { CoachAchievementsCard } from "@/components/koaches/coach/CoachAchievementsCard";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachProfileSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import {
  updateCoachBioAction,
  updateCoachPricingAction,
  updateCoachSkillTemplateAction,
} from "@/lib/koaches/actions/coach-profile";
import { CoachContactSocialsCard } from "@/components/koaches/coach/CoachContactSocialsCard";
import { CoachPublicProfileLinkCard } from "@/components/koaches/coach/CoachPublicProfileLinkCard";
import { CoachChangePasswordCard } from "@/components/koaches/coach/CoachChangePasswordCard";
import { CoachSignOutButton } from "@/components/koaches/coach/CoachSignOutButton";
import { invalidateCoachProfile } from "@/lib/koaches/queries/invalidate";
import type { SkillRubricId } from "@/lib/koaches/types";

const EDIT_BIO_FORM_ID = "edit-bio-form";

export default function ProfilePage() {
  const coachId = usePortalCoachId();
  const { coach, loading, refresh } = useCoachProfile(coachId);
  const [editOpen, setEditOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [pricing, setPricing] = useState<import("@/lib/koaches/types").CoachSessionPricing>(DEFAULT_SESSION_PRICING);
  const [skillTemplateId, setSkillTemplateId] = useState<SkillRubricId>("intermediate");
  const [savingBio, setSavingBio] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const { showToast } = useCoachToast();

  useEffect(() => {
    if (!coach) return;
    setBio(coach.bio);
    setPricing(coach.sessionPricing ?? DEFAULT_SESSION_PRICING);
    setSkillTemplateId(coach.skillTemplateId);
  }, [coach]);

  if (loading || !coach) {
    return <CoachProfileSkeleton />;
  }

  const specialization = coach.specialization?.trim() ?? "";
  const hasPricing = pricing.tiers.length > 0 && getStartingRate(pricing) > 0;
  const pricingSummary = hasPricing ? formatPricingSummary(pricing) : null;

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Profile"
        subtitle="Public page, drop-in rates, availability, and account"
      />

      <div className="coach-card mt-6 p-6 text-center">
        <CoachProfilePhoto
          coachId={coachId}
          name={coach.name}
          defaultPhoto={coach.photo}
          size="xl"
          editable
          className="mx-auto"
        />
        <p className="font-heading mt-4 text-xl font-bold">{coach.name}</p>
        <div className="mt-2">
          {bio.trim() ? (
            <p className="text-sm leading-relaxed text-[#6B7280]">{bio.trim()}</p>
          ) : (
            <p className="text-sm text-[#9CA3AF]">Add a short bio for your public profile.</p>
          )}
          <button
            type="button"
            className="mt-1.5 text-sm font-semibold text-[#4F8FF7]"
            onClick={() => setEditOpen(true)}
          >
            {bio.trim() ? "Edit bio" : "Add bio"}
          </button>
        </div>

        {(specialization || pricingSummary) ? (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {specialization ? (
              <span className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-semibold text-[#166534]">
                {specialization}
              </span>
            ) : null}
            {pricingSummary ? (
              <span className="rounded-full bg-[#14532D] px-3 py-1 text-xs font-semibold text-white">
                {pricingSummary}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-xs text-[#9CA3AF]">
            Set your specialization and drop-in rates so players know what you offer.
          </p>
        )}
      </div>

      <CoachPublicProfileLinkCard coach={coach} className="mt-4" />

      <CoachContactSocialsCard coachId={coachId} coach={coach} onSaved={refresh} />

      <div className="coach-card mt-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold">Drop-in rates</p>
            <p className="text-sm text-[#6B7280]">
              Per session, by group size · {pricing.defaultDurationMinutes} min · {pricing.minimumPlayers}–{pricing.maximumPlayers} pax
            </p>
          </div>
          <button type="button" className="text-sm font-semibold text-[#4F8FF7]" onClick={() => setPricingOpen(true)}>
            Edit
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {pricing.tiers.map((tier) => (
            <li
              key={tier.id}
              className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm"
            >
              <span className="text-[#374151]">{formatTierLabel(tier)}</span>
              <span className="font-semibold text-[#14532D]">{formatTierRate(tier)}</span>
            </li>
          ))}
        </ul>
      </div>

      <WorkingHoursCard />

      <CoachAchievementsCard />

      <div className="coach-card mt-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold">Skill Template</p>
            <p className="text-sm text-[#6B7280]">
              {SKILL_RUBRICS[skillTemplateId as keyof typeof SKILL_RUBRICS]?.name ?? "Custom"} rubric
            </p>
          </div>
          <button type="button" className="text-sm font-semibold text-[#4F8FF7]" onClick={() => setTemplateOpen(true)}>
            Customize
          </button>
        </div>
      </div>

      <div className="coach-card mt-4 p-4">
        <p className="font-heading font-semibold">Subscription</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          Manage billing, invoices, and payment receipts.
        </p>
        <Link href="/coach/billing" className="mt-3 inline-block text-sm font-semibold text-[#4F8FF7]">
          Go to billing →
        </Link>
      </div>

      <CoachChangePasswordCard />

      <CoachSignOutButton className="coach-btn-ghost-danger mt-6 w-full" />

      <CoachBottomSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit bio"
        footer={
          <CoachSheetFooter>
            <button type="submit" form={EDIT_BIO_FORM_ID} className="coach-btn-primary" disabled={savingBio}>
              {savingBio ? "Saving…" : "Save bio"}
            </button>
          </CoachSheetFooter>
        }
      >
        <form
          id={EDIT_BIO_FORM_ID}
          className="coach-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setSavingBio(true);
            try {
              await updateCoachBioAction(coachId, bio, coach.specialization);
              invalidateCoachProfile(coachId);
              await refresh();
              showToast("Bio updated!");
              setEditOpen(false);
            } catch (err) {
              showToast(err instanceof Error ? err.message : "Could not save bio", "error");
            } finally {
              setSavingBio(false);
            }
          }}
        >
          <CoachSheetField label="Bio" htmlFor="coach-bio">
            <textarea
              id="coach-bio"
              className="coach-input min-h-[120px] resize-none"
              placeholder="Tell students about your coaching style and experience"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </CoachSheetField>
          <button type="submit" form={EDIT_BIO_FORM_ID} className="hidden" />
        </form>
      </CoachBottomSheet>

      <CoachBottomSheet
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        title="Drop-in rates"
        subtitle="Rates for drop-in sessions — programs have their own bundle price per person"
        footer={
          <CoachSheetFooter>
            <button
              type="button"
              className="coach-btn-primary"
              disabled={savingPricing}
              onClick={async () => {
                setSavingPricing(true);
                try {
                  await updateCoachPricingAction(coachId, pricing);
                  invalidateCoachProfile(coachId);
                  await refresh();
                  showToast("Pricing saved!");
                  setPricingOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Could not save pricing", "error");
                } finally {
                  setSavingPricing(false);
                }
              }}
            >
              {savingPricing ? "Saving…" : "Save Pricing"}
            </button>
          </CoachSheetFooter>
        }
      >
        <PricingTiersEditor pricing={pricing} onChange={setPricing} />
      </CoachBottomSheet>

      <CoachBottomSheet
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title="Skill Categories"
        subtitle="Default rubric for rating students"
        footer={
          <CoachSheetFooter>
            <button
              type="button"
              className="coach-btn-primary"
              disabled={savingTemplate}
              onClick={async () => {
                setSavingTemplate(true);
                try {
                  await updateCoachSkillTemplateAction(coachId, skillTemplateId);
                  invalidateCoachProfile(coachId);
                  await refresh();
                  showToast("Template saved!");
                  setTemplateOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Could not save template", "error");
                } finally {
                  setSavingTemplate(false);
                }
              }}
            >
              {savingTemplate ? "Saving…" : "Save Template"}
            </button>
          </CoachSheetFooter>
        }
      >
        <div className="space-y-3">
          {(Object.keys(SKILL_RUBRICS) as Array<keyof typeof SKILL_RUBRICS>).map((id) => {
            const rubric = SKILL_RUBRICS[id];
            return (
              <label key={id} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3">
                <input
                  type="radio"
                  name="rubric"
                  checked={skillTemplateId === id}
                  onChange={() => setSkillTemplateId(id)}
                />
                <div>
                  <span className="text-sm font-medium">{rubric.name}</span>
                  <p className="text-xs text-[#6B7280]">{rubric.subtitle}</p>
                </div>
              </label>
            );
          })}
        </div>
      </CoachBottomSheet>
    </CoachPageShell>
  );
}
