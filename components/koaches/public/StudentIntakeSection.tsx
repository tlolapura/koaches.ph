"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import type { DuprLevel } from "@/lib/koaches/types";
import { DUPR_LEVELS } from "@/lib/koaches/constants";
import {
  INTAKE_WAIVER_BODY,
  INTAKE_WAIVER_TITLE,
  validateIntakePayload,
} from "@/lib/koaches/intake";
import { submitIntakeAction } from "@/lib/koaches/actions/intake";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { cn } from "@/lib/utils";

type StudentIntakeSectionProps = {
  coach: CoachProfile;
};

export function StudentIntakeSection({ coach }: StudentIntakeSectionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    emergencyContact: "",
    skillLevel: "3.0" as DuprLevel,
    notes: "",
    signedName: "",
    agreed: false,
  });

  const coachFirstName = coach.name.replace(/^Coach\s+/i, "").split(" ")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.agreed) {
      setError("Please read and accept the waiver to continue.");
      return;
    }

    const validationError = validateIntakePayload(
      {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        emergencyContact: form.emergencyContact || undefined,
        skillLevel: form.skillLevel,
        notes: form.notes || undefined,
        signedName: form.signedName,
      },
      form.name
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await submitIntakeAction(coach.id, {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        emergencyContact: form.emergencyContact.trim() || undefined,
        skillLevel: form.skillLevel,
        notes: form.notes.trim() || undefined,
        waiverAccepted: true,
        signedName: form.signedName.trim(),
      });
      window.dispatchEvent(new Event("koaches-intake-updated"));
      setSubmitted(true);
    } catch {
      setError("We couldn't submit your sign-up. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="coach-card border border-[#E5EFE8] bg-gradient-to-br from-[#F4FAF6] to-white p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5EFE8]">
          <CheckCircle2 className="h-8 w-8 text-[#3D5C47]" strokeWidth={1.5} />
        </div>
        <h3 className="font-heading mt-4 text-lg font-bold text-[#111827]">You&apos;re on the list!</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
          Thanks, {form.name.split(" ")[0]}. Coach {coachFirstName} will review your sign-up and add you to the roster
          once approved.
        </p>
        <p className="mt-2 text-xs text-[#9CA3AF]">Your waiver has been recorded.</p>
      </div>
    );
  }

  return (
    <form className="coach-card space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
      <Field label="Full name *">
        <input
          className="coach-input"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Juan dela Cruz"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mobile number *">
          <input
            className="coach-input"
            required
            type="tel"
            value={form.mobile}
            onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
            placeholder="09171234567"
          />
        </Field>
        <Field label="Email *">
          <input
            className="coach-input"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="juan@email.com"
          />
        </Field>
      </div>
      <Field label="Emergency contact (optional)">
        <input
          className="coach-input"
          value={form.emergencyContact}
          onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))}
          placeholder="Name & number"
        />
      </Field>
      <Field label="Your skill level">
        <CoachSelect
          value={form.skillLevel}
          onChange={(level) => setForm((f) => ({ ...f, skillLevel: level as DuprLevel }))}
          options={DUPR_LEVELS.map((d) => ({
            value: d.level,
            label: `${d.level} — ${d.label}`,
          }))}
        />
      </Field>
      <Field label="Notes for your coach (optional)">
        <textarea
          className="coach-input min-h-[72px] resize-none"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Booking reference, goals, injuries…"
        />
      </Field>

      <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#3D5C47]" />
          <div className="min-w-0 flex-1">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setWaiverOpen((o) => !o)}
            >
              <span className="font-heading text-sm font-semibold text-[#111827]">{INTAKE_WAIVER_TITLE}</span>
              <span className="text-xs font-medium text-[#E07A5F]">{waiverOpen ? "Hide" : "Read"}</span>
            </button>
            <div
              className={cn(
                "mt-3 overflow-hidden text-xs leading-relaxed text-[#6B7280] transition-all",
                waiverOpen ? "max-h-64 overflow-y-auto" : "max-h-14"
              )}
            >
              {INTAKE_WAIVER_BODY}
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[#D1D5DB] accent-[#E07A5F]"
                checked={form.agreed}
                onChange={(e) => setForm((f) => ({ ...f, agreed: e.target.checked }))}
              />
              <span className="text-sm text-[#374151]">
                I have read and agree to the waiver. I understand pickleball involves physical risk.
              </span>
            </label>
          </div>
        </div>
      </div>

      <Field label="Sign waiver — type your full name *" hint="Must match the name above">
        <input
          className="coach-input font-medium italic"
          required
          value={form.signedName}
          onChange={(e) => setForm((f) => ({ ...f, signedName: e.target.value }))}
          placeholder={form.name || "Juan dela Cruz"}
        />
      </Field>

      {error && <p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#991B1B]">{error}</p>}

      <button type="submit" className="coach-btn-primary w-full py-3.5" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit & join roster"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#374151]">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[10px] text-[#9CA3AF]">{hint}</p> : null}
    </div>
  );
}
