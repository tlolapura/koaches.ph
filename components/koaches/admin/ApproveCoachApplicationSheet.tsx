"use client";

import { useEffect, useState } from "react";
import type { CoachApplication } from "@/lib/koaches/types";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!application) return;
    setEmail(application.email);
    setError(null);
    setSubmitting(false);
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setSubmitting(true);
    setError(null);
    const result = await approveCoachApplicationAction(application.id, { email });
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
      subtitle={application ? application.fullName : undefined}
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
            form="approve-coach-form"
            className="w-full py-3 text-sm"
            loading={submitting}
            loadingLabel="Approving…"
          >
            Approve & send welcome email
          </CoachButton>
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
                ? `Application email: ${application.email} · welcome email will go to the login email`
                : "We'll email a temporary password and a link to the coach portal."
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

          {application.preferredSlug && (
            <p className="rounded-xl bg-[#F9FAFB] px-3 py-2.5 text-xs text-[#6B7280]">
              Public profile:{" "}
              <span className="font-semibold text-[#374151]">/coach/{application.preferredSlug}</span>
              {" "}
              (or similar if taken)
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
