"use client";

import { useEffect, useState } from "react";
import type { CoachApplication } from "@/lib/koaches/types";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import {
  approveCoachApplicationAction,
  type ApproveCoachApplicationResult,
} from "@/lib/koaches/actions/applications";

type ApproveCoachApplicationSheetProps = {
  application: CoachApplication | null;
  onClose: () => void;
  onApproved: (result: Extract<ApproveCoachApplicationResult, { ok: true }>) => void;
};

export function ApproveCoachApplicationSheet({
  application,
  onClose,
  onApproved,
}: ApproveCoachApplicationSheetProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!application) return;
    setEmail(application.email);
    setPassword("");
    setError(null);
    setSubmitting(false);
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setSubmitting(true);
    setError(null);
    const result = await approveCoachApplicationAction(application.id, { email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onApproved(result);
    onClose();
  };

  return (
    <CoachBottomSheet
      open={Boolean(application)}
      onClose={onClose}
      title="Approve coach"
      subtitle={
        application
          ? `Create login for ${application.fullName}. They can change their password after signing in.`
          : undefined
      }
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
            form="approve-coach-form"
            className="coach-btn-primary w-full py-3 text-sm"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Approve & create account"}
          </button>
        </CoachSheetFooter>
      }
    >
      {application && (
        <form id="approve-coach-form" onSubmit={(e) => void handleSubmit(e)} className="coach-form">
          <CoachSheetField
            label="Login email"
            htmlFor="approve-email"
            hint={
              email.trim().toLowerCase() !== application.email.trim().toLowerCase()
                ? `Application email: ${application.email} · you are using a different login email`
                : `Application email: ${application.email}`
            }
          >
            <input
              id="approve-email"
              type="email"
              autoComplete="off"
              className="coach-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={application.email}
              required
            />
          </CoachSheetField>

          <CoachSheetField
            label="Temporary password"
            htmlFor="approve-password"
            hint="Share this with the coach. They should update it from their profile after first login."
          >
            <input
              id="approve-password"
              type="password"
              autoComplete="new-password"
              className="coach-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </CoachSheetField>

          {application.preferredSlug && (
            <p className="rounded-xl bg-[#F9FAFB] px-3 py-2.5 text-xs text-[#6B7280]">
              Public profile: <span className="font-semibold text-[#374151]">/coach/{application.preferredSlug}</span>
              {" "}(or similar if taken)
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#B91C1C]" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </CoachBottomSheet>
  );
}
