"use client";

import { useEffect, useState } from "react";
import {
  createCoachManuallyAction,
  type CreateCoachManuallyResult,
} from "@/lib/koaches/actions/coaches";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import type { CoachProfile } from "@/lib/koaches/types";

const EMPTY_FORM = {
  fullName: "",
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
      fullName: form.fullName,
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
          <button
            type="button"
            className="coach-btn-outline w-full py-3 text-sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="admin-add-coach-form"
            className="coach-btn-primary w-full py-3 text-sm"
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create coach"}
          </button>
        </CoachSheetFooter>
      }
    >
      <form id="admin-add-coach-form" onSubmit={(e) => void handleSubmit(e)} className="coach-form">
        <CoachSheetField label="Full name" htmlFor="add-coach-name">
          <input
            id="add-coach-name"
            className="coach-input"
            value={form.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            placeholder="Coach Juan dela Cruz"
            autoComplete="name"
            required
          />
        </CoachSheetField>

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

        <CoachSheetField label="Specialization (optional)" htmlFor="add-coach-specialization">
          <input
            id="add-coach-specialization"
            className="coach-input"
            value={form.specialization}
            onChange={(e) => patch({ specialization: e.target.value })}
            placeholder="e.g. Beginner fundamentals"
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
