"use client";

import { useEffect, useState } from "react";
import {
  adminUpdateCoachAction,
  type AdminUpdateCoachInput,
} from "@/lib/koaches/actions/coaches";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { PricingTiersEditor } from "@/components/koaches/coach/PricingTiersEditor";
import { CoachingLevelsPicker } from "@/components/koaches/shared/CoachingLevelsPicker";
import { SpecializationPicker } from "@/components/koaches/shared/SpecializationPicker";
import { joinPersonName } from "@/lib/koaches/person-name";
import type { CoachingLevelId } from "@/lib/koaches/application-form";
import type { CoachProfile } from "@/lib/koaches/types";

type AdminEditCoachSheetProps = {
  coach: CoachProfile | null;
  open: boolean;
  onClose: () => void;
  onSaved: (coach: CoachProfile) => void;
};

function coachToForm(coach: CoachProfile) {
  return {
    firstName: coach.firstName,
    lastName: coach.lastName,
    slug: coach.slug,
    bio: coach.bio,
    specialization: coach.specialization,
    mobile: coach.mobile ?? "",
    instagram: coach.instagram ?? "",
    facebook: coach.facebook ?? "",
    coachingLevels: [...coach.coachingLevels] as CoachingLevelId[],
    sessionPricing: coach.sessionPricing,
    subscriptionPlan: coach.subscriptionPlan,
    subscriptionExpiry: coach.subscriptionExpiry,
  };
}

export function AdminEditCoachSheet({ coach, open, onClose, onSaved }: AdminEditCoachSheetProps) {
  const [form, setForm] = useState(() => (coach ? coachToForm(coach) : null));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !coach) return;
    setForm(coachToForm(coach));
    setError(null);
    setSubmitting(false);
  }, [open, coach]);

  if (!coach || !form) return null;

  const patch = (update: Partial<typeof form>) => {
    setForm((prev) => (prev ? { ...prev, ...update } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const input: AdminUpdateCoachInput = {
      coachId: coach.id,
      ...form,
    };

    const result = await adminUpdateCoachAction(input);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onSaved({
      ...coach,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: joinPersonName(form.firstName, form.lastName),
      slug: form.slug.trim().toLowerCase(),
      bio: form.bio.trim(),
      specialization: form.specialization.trim(),
      mobile: form.mobile.trim() || undefined,
      instagram: form.instagram.trim() || undefined,
      facebook: form.facebook.trim() || undefined,
      coachingLevels: form.coachingLevels,
      sessionPricing: form.sessionPricing,
      subscriptionPlan: form.subscriptionPlan,
      subscriptionExpiry: form.subscriptionExpiry,
      ratePerSession: form.sessionPricing.tiers[0]?.rate ?? coach.ratePerSession,
    });
    onClose();
  };

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Edit coach"
      subtitle={coach.name}
      footer={
        <CoachSheetFooter>
          <CoachButton
            type="button"
            variant="outline"
            className="w-full py-3 text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </CoachButton>
          <CoachButton
            type="submit"
            form="admin-edit-coach-form"
            className="w-full py-3 text-sm"
            loading={submitting}
            loadingLabel="Saving…"
          >
            Save changes
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <form id="admin-edit-coach-form" onSubmit={(e) => void handleSubmit(e)} className="coach-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="First name" htmlFor="edit-coach-first-name">
            <input
              id="edit-coach-first-name"
              className="coach-input"
              value={form.firstName}
              onChange={(e) => patch({ firstName: e.target.value })}
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Last name" htmlFor="edit-coach-last-name">
            <input
              id="edit-coach-last-name"
              className="coach-input"
              value={form.lastName}
              onChange={(e) => patch({ lastName: e.target.value })}
            />
          </CoachSheetField>
        </div>

        <CoachSheetField label="Profile URL slug" htmlFor="edit-coach-slug">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-[#6B7280]">/coach/</span>
            <input
              id="edit-coach-slug"
              className="coach-input"
              value={form.slug}
              onChange={(e) => patch({ slug: e.target.value.toLowerCase() })}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              required
            />
          </div>
        </CoachSheetField>

        <CoachSheetField label="Mobile" htmlFor="edit-coach-mobile">
          <input
            id="edit-coach-mobile"
            type="tel"
            className="coach-input"
            value={form.mobile}
            onChange={(e) => patch({ mobile: e.target.value })}
          />
        </CoachSheetField>

        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="Instagram" htmlFor="edit-coach-instagram">
            <input
              id="edit-coach-instagram"
              className="coach-input"
              placeholder="@handle or profile URL"
              value={form.instagram}
              onChange={(e) => patch({ instagram: e.target.value })}
            />
          </CoachSheetField>
          <CoachSheetField label="Facebook" htmlFor="edit-coach-facebook">
            <input
              id="edit-coach-facebook"
              className="coach-input"
              placeholder="Profile URL or page name"
              value={form.facebook}
              onChange={(e) => patch({ facebook: e.target.value })}
            />
          </CoachSheetField>
        </div>

        <CoachSheetField label="Bio" htmlFor="edit-coach-bio">
          <textarea
            id="edit-coach-bio"
            className="coach-input min-h-[100px] resize-none"
            value={form.bio}
            onChange={(e) => patch({ bio: e.target.value })}
          />
        </CoachSheetField>

        <CoachSheetField label="Specialization">
          <SpecializationPicker
            id="edit-coach-specialization"
            value={form.specialization}
            onChange={(specialization) => patch({ specialization })}
          />
        </CoachSheetField>

        <div>
          <p className="text-sm font-semibold text-[#111827]">Player levels</p>
          <CoachingLevelsPicker
            className="mt-2"
            value={form.coachingLevels}
            onChange={(coachingLevels) => patch({ coachingLevels })}
            hint="Which levels does this coach work with?"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#111827]">Drop-in rates</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">Programs use separate bundle pricing.</p>
          <div className="mt-3">
            <PricingTiersEditor pricing={form.sessionPricing} onChange={(sessionPricing) => patch({ sessionPricing })} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="Subscription plan" htmlFor="edit-coach-plan">
            <select
              id="edit-coach-plan"
              className="coach-input"
              value={form.subscriptionPlan}
              onChange={(e) =>
                patch({ subscriptionPlan: e.target.value as CoachProfile["subscriptionPlan"] })
              }
            >
              <option value="early-bird">Early bird (₱299/mo)</option>
              <option value="regular">Regular (₱499/mo)</option>
            </select>
          </CoachSheetField>
          <CoachSheetField label="Subscription expiry" htmlFor="edit-coach-expiry">
            <input
              id="edit-coach-expiry"
              type="date"
              className="coach-input"
              value={form.subscriptionExpiry}
              onChange={(e) => patch({ subscriptionExpiry: e.target.value })}
              required
            />
          </CoachSheetField>
        </div>

        {error && (
          <p className="rounded-xl bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#B91C1C]" role="alert">
            {error}
          </p>
        )}
      </form>
    </CoachBottomSheet>
  );
}
