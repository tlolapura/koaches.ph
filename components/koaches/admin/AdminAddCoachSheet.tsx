"use client";

import { useEffect, useState } from "react";
import {
  createCoachManuallyAction,
  type CreateCoachManuallyResult,
} from "@/lib/koaches/actions/coaches";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
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
      <form id="admin-add-coach-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-1">
        <div>
          <label htmlFor="add-coach-name" className="coach-label">
            Full name
          </label>
          <input
            id="add-coach-name"
            className="coach-input mt-1.5"
            value={form.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="add-coach-mobile" className="coach-label">
            Mobile
          </label>
          <input
            id="add-coach-mobile"
            type="tel"
            className="coach-input mt-1.5"
            value={form.mobile}
            onChange={(e) => patch({ mobile: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="add-coach-email" className="coach-label">
            Login email
          </label>
          <input
            id="add-coach-email"
            type="email"
            autoComplete="off"
            className="coach-input mt-1.5"
            value={form.email}
            onChange={(e) => patch({ email: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="add-coach-password" className="coach-label">
            Temporary password
          </label>
          <input
            id="add-coach-password"
            type="password"
            autoComplete="new-password"
            className="coach-input mt-1.5"
            value={form.password}
            onChange={(e) => patch({ password: e.target.value })}
            minLength={8}
            required
          />
          <p className="mt-1.5 text-xs text-[#6B7280]">
            Share with the coach — they can change it after first sign-in.
          </p>
        </div>

        <div>
          <label htmlFor="add-coach-slug" className="coach-label">
            Profile URL slug <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </label>
          <div className="mt-1.5 flex items-center gap-2">
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
        </div>

        <div>
          <label htmlFor="add-coach-specialization" className="coach-label">
            Specialization <span className="font-normal text-[#9CA3AF]">(optional)</span>
          </label>
          <input
            id="add-coach-specialization"
            className="coach-input mt-1.5"
            value={form.specialization}
            onChange={(e) => patch({ specialization: e.target.value })}
            placeholder="e.g. Beginner fundamentals"
          />
        </div>

        <div>
          <label htmlFor="add-coach-plan" className="coach-label">
            Subscription plan
          </label>
          <select
            id="add-coach-plan"
            className="coach-input mt-1.5"
            value={form.subscriptionPlan}
            onChange={(e) =>
              patch({ subscriptionPlan: e.target.value as CoachProfile["subscriptionPlan"] })
            }
          >
            <option value="early-bird">Early bird (₱299/mo)</option>
            <option value="regular">Regular (₱499/mo)</option>
          </select>
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
