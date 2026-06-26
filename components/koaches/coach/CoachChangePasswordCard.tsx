"use client";

import { useState } from "react";
import { changeCoachPasswordAction } from "@/lib/koaches/actions/auth";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

const FORM_ID = "change-password-form";

export function CoachChangePasswordCard() {
  const { showToast } = useCoachToast();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  return (
    <>
      <div className="coach-card mt-4 p-4">
        <p className="font-heading font-semibold">Account security</p>
        <p className="mt-1 text-sm text-[#6B7280]">Update your login password.</p>
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-[#4F8FF7]"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          Change password
        </button>
      </div>

      <CoachBottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Change password"
        subtitle="Use at least 8 characters"
        footer={
          <CoachSheetFooter>
            <button type="submit" form={FORM_ID} className="coach-btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Update password"}
            </button>
          </CoachSheetFooter>
        }
      >
        <form
          id={FORM_ID}
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            if (newPassword !== confirmPassword) {
              setError("New passwords do not match.");
              return;
            }
            setSaving(true);
            const result = await changeCoachPasswordAction(currentPassword, newPassword);
            setSaving(false);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            showToast("Password updated");
            setOpen(false);
            reset();
          }}
        >
          <CoachSheetField label="Current password">
            <input
              type="password"
              autoComplete="current-password"
              className="coach-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </CoachSheetField>
          <CoachSheetField label="New password">
            <input
              type="password"
              autoComplete="new-password"
              className="coach-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </CoachSheetField>
          <CoachSheetField label="Confirm new password">
            <input
              type="password"
              autoComplete="new-password"
              className="coach-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </CoachSheetField>
          {error && (
            <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
              {error}
            </p>
          )}
        </form>
      </CoachBottomSheet>
    </>
  );
}
