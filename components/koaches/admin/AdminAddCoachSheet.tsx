"use client";

import { useEffect, useState } from "react";
import {
  createCoachManuallyAction,
  type CreateCoachManuallyResult,
} from "@/lib/koaches/actions/coaches";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { SpecializationPicker } from "@/components/koaches/shared/SpecializationPicker";
import type { CoachProfile } from "@/lib/koaches/types";

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  password: "",
  preferredSlug: "",
  specialization: "",
  subscriptionPlan: "early-bird" as CoachProfile["subscriptionPlan"],
};

type AdminAddCoachSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (result: Extract<CreateCoachManuallyResult, { ok: true }>) => void;
};

export function AdminAddCoachSheet({ open, onClose, onCreated }: AdminAddCoachSheetProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setError(null);
    setSubmitting(false);
  }, [open]);

  const patch = (update: Partial<typeof EMPTY_FORM>) => {
    setForm((prev) => ({ ...prev, ...update }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await createCoachManuallyAction({
      firstName: form.firstName,
      lastName: form.lastName,
      mobile: form.mobile,
      email: form.email,
      password: form.password,
      preferredSlug: form.preferredSlug || undefined,
      specialization: form.specialization || undefined,
      subscriptionPlan: form.subscriptionPlan,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCreated(result);
    onClose();
  };

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Add coach"
      subtitle="Create a coach account directly — no application required."
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
            form="admin-add-coach-form"
            className="w-full py-3 text-sm"
            loading={submitting}
            loadingLabel="Creating…"
          >
            Create coach
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <form id="admin-add-coach-form" onSubmit={(e) => void handleSubmit(e)} className="coach-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <CoachSheetField label="First name" htmlFor="add-coach-first-name">
            <input
              id="add-coach-first-name"
              className="coach-input"
              value={form.firstName}
              onChange={(e) => patch({ firstName: e.target.value })}
              placeholder="Juan"
              autoComplete="given-name"
              required
            />
          </CoachSheetField>
          <CoachSheetField label="Last name" htmlFor="add-coach-last-name">
            <input
              id="add-coach-last-name"
              className="coach-input"
              value={form.lastName}
              onChange={(e) => patch({ lastName: e.target.value })}
              placeholder="dela Cruz"
              autoComplete="family-name"
              required
            />
          </CoachSheetField>
        </div>

        <CoachSheetField label="Mobile" htmlFor="add-coach-mobile">
          <input
            id="add-coach-mobile"
            type="tel"
            className="coach-input"
            value={form.mobile}
            onChange={(e) => patch({ mobile: e.target.value })}
            placeholder="09171234567"
            autoComplete="tel"
            required
          />
        </CoachSheetField>

        <CoachSheetField label="Login email" htmlFor="add-coach-email">
          <input
            id="add-coach-email"
            type="email"
            autoComplete="off"
            className="coach-input"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            placeholder="coach@email.com"
            required
          />
        </CoachSheetField>

        <CoachSheetField
          label="Temporary password"
          htmlFor="add-coach-password"
          hint="Share with the coach — they can change it after first sign-in."
        >
          <input
            id="add-coach-password"
            type="password"
            autoComplete="new-password"
            className="coach-input"
            value={form.password}
            onChange={(e) => patch({ password: e.target.value })}
            placeholder="Min. 8 characters"
            minLength={8}
            required
          />
        </CoachSheetField>

        <CoachSheetField
          label="Profile URL slug (optional)"
          htmlFor="add-coach-slug"
          hint="Public page path, e.g. /coach/your-name"
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-[#6B7280]">/coach/</span>
            <input
              id="add-coach-slug"
              className="coach-input"
              value={form.preferredSlug}
              onChange={(e) => patch({ preferredSlug: e.target.value.toLowerCase() })}
              placeholder="coach-name"
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </div>
        </CoachSheetField>

        <CoachSheetField label="Specialization (optional)">
          <SpecializationPicker
            id="add-coach-specialization"
            value={form.specialization}
            onChange={(specialization) => patch({ specialization })}
            hint="Optional when creating an account — coach can set this later."
          />
        </CoachSheetField>

        <CoachSheetField label="Subscription plan" htmlFor="add-coach-plan">
          <select
            id="add-coach-plan"
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

        {error && (
          <p className="rounded-xl bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#B91C1C]" role="alert">
            {error}
          </p>
        )}
      </form>
    </CoachBottomSheet>
  );
}
