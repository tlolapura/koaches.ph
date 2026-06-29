"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSelect } from "@/components/koaches/coach/CoachSelect";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import {
  defaultDuprForCoachingLevel,
  type CoachingLevelId,
  STUDENT_COACHING_LEVEL_SELECT_OPTIONS,
} from "@/lib/koaches/application-form";
import {
  INTAKE_WAIVER_BODY,
  INTAKE_WAIVER_TITLE,
  validateIntakePayload,
} from "@/lib/koaches/intake";
import { submitIntakeAction } from "@/lib/koaches/actions/intake";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { coachFirstName } from "@/lib/koaches/person-name";
import type { CoachProfile } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "welcome",
    title: "Join the roster",
    subtitle: "Sign up and complete your waiver",
    icon: Sparkles,
  },
  {
    id: "details",
    title: "About you",
    subtitle: "So your coach knows who to expect",
    icon: User,
  },
  {
    id: "skill",
    title: "Your game",
    subtitle: "Skill level and anything else we should know",
    icon: ClipboardList,
  },
  {
    id: "waiver",
    title: "Waiver",
    subtitle: "Read, agree, and sign to finish",
    icon: ShieldCheck,
  },
  {
    id: "success",
    title: "You're on the list!",
    subtitle: "Your coach will review your sign-up",
    icon: CheckCircle2,
  },
] as const;

type StudentIntakeWizardProps = {
  coach: CoachProfile;
};

export function StudentIntakeWizard({ coach }: StudentIntakeWizardProps) {
  const firstName = coachFirstName(coach);
  const profilePath = buildPublicCoachPath(coach.slug);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    emergencyContact: "",
    coachingLevel: "intermediate" as CoachingLevelId,
    notes: "",
    signedName: "",
    agreed: false,
  });

  const current = STEPS[step];
  const StepIcon = current.icon;
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const isFirst = step === 0;
  const isWaiver = current.id === "waiver";
  const isSuccess = current.id === "success";

  const validateDetails = () => {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.mobile.trim()) return "Please enter your mobile number.";
    if (!form.email.trim()) return "Please enter your email.";
    return null;
  };

  const skillLevel = defaultDuprForCoachingLevel(form.coachingLevel);

  const validateWaiver = () => {
    if (!form.agreed) return "Please read and accept the waiver to continue.";
    const validationError = validateIntakePayload(
      {
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        emergencyContact: form.emergencyContact || undefined,
        skillLevel,
        notes: form.notes || undefined,
        signedName: form.signedName,
      },
      form.name
    );
    return validationError;
  };

  const goNext = async () => {
    setError(null);

    if (current.id === "welcome") {
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "details") {
      const err = validateDetails();
      if (err) {
        setError(err);
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "skill") {
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "waiver") {
      const err = validateWaiver();
      if (err) {
        setError(err);
        return;
      }

      setPending(true);
      try {
        await submitIntakeAction(coach.id, {
          name: form.name.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          emergencyContact: form.emergencyContact.trim() || undefined,
          skillLevel,
          notes: form.notes.trim() || undefined,
          waiverAccepted: true,
          signedName: form.signedName.trim(),
        });
        window.dispatchEvent(new Event("koaches-intake-updated"));
        setStep((s) => s + 1);
      } catch {
        setError("We couldn't submit your sign-up. Please try again in a moment.");
      } finally {
        setPending(false);
      }
    }
  };

  const goBack = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="coach-portal relative flex h-dvh flex-col overflow-hidden bg-white">
      <PickleballBallBackdrop variant="landing" />

      <header className="relative z-[1] shrink-0 border-b border-[#E5E7EB] bg-white/95 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between gap-3">
            <KoachesWordmark size="sm" />
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
              Join roster
            </span>
          </div>

          {!isSuccess && (
            <>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <CoachProfilePhoto
                  coachId={coach.id}
                  name={coach.name}
                  defaultPhoto={coach.photo}
                  size="lg"
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-semibold text-[#111827]">{coach.name}</p>
                  <p className="text-xs text-[#6B7280]">Coach {firstName}&apos;s roster</p>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A]"
                    aria-hidden
                  >
                    <StepIcon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h1 className="font-heading mt-2.5 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                    {current.title}
                  </h1>
                  <p className="mt-0.5 text-sm text-[#6B7280]">{current.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl font-bold leading-none text-[#16A34A]">{progress}%</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Step {step + 1}/{STEPS.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[#16A34A] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between gap-1">
                {STEPS.map((s, i) => (
                  <StepDot key={s.id} icon={s.icon} active={i === step} done={i < step} />
                ))}
              </div>
            </>
          )}

          {isSuccess && (
            <div className="mt-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A]">
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h1 className="font-heading mt-4 text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
                {current.title}
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">{current.subtitle}</p>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-4 py-5">
          <div className="coach-card p-5 shadow-sm">
            {current.id === "welcome" && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[#6B7280]">
                  Already booked with Coach {firstName}? A few quick steps to join the roster and record your waiver.
                </p>
                <ul className="space-y-3">
                  {[
                    "Your contact details",
                    "Skill level and notes for your coach",
                    "Read and sign the waiver",
                    "Coach approves before your first session",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#374151]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {current.id === "details" && (
              <div className="space-y-4">
                <CoachSheetField label="Full name *" htmlFor="intake-name">
                  <input
                    id="intake-name"
                    className="coach-input"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Juan dela Cruz"
                  />
                </CoachSheetField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CoachSheetField label="Mobile number *" htmlFor="intake-mobile">
                    <input
                      id="intake-mobile"
                      className="coach-input"
                      required
                      type="tel"
                      autoComplete="tel"
                      value={form.mobile}
                      onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))}
                      placeholder="09171234567"
                    />
                  </CoachSheetField>
                  <CoachSheetField label="Email *" htmlFor="intake-email">
                    <input
                      id="intake-email"
                      className="coach-input"
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="juan@email.com"
                    />
                  </CoachSheetField>
                </div>
                <CoachSheetField label="Emergency contact (optional)" htmlFor="intake-emergency">
                  <input
                    id="intake-emergency"
                    className="coach-input"
                    value={form.emergencyContact}
                    onChange={(e) => setForm((f) => ({ ...f, emergencyContact: e.target.value }))}
                    placeholder="Name & number"
                  />
                </CoachSheetField>
              </div>
            )}

            {current.id === "skill" && (
              <div className="space-y-4">
                <CoachSheetField label="Your level" htmlFor="intake-skill">
                  <CoachSelect
                    id="intake-skill"
                    value={form.coachingLevel}
                    onChange={(level) =>
                      setForm((f) => ({ ...f, coachingLevel: level as CoachingLevelId }))
                    }
                    options={STUDENT_COACHING_LEVEL_SELECT_OPTIONS}
                  />
                </CoachSheetField>
                <CoachSheetField label="Notes for your coach (optional)" htmlFor="intake-notes">
                  <textarea
                    id="intake-notes"
                    className="coach-input min-h-[96px] resize-none"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Booking reference, goals, injuries…"
                  />
                </CoachSheetField>
              </div>
            )}

            {current.id === "waiver" && (
              <div className="space-y-4">
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
                        <span className="text-xs font-medium text-[#4F8FF7]">{waiverOpen ? "Hide" : "Read"}</span>
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
                          className="mt-1 h-4 w-4 rounded border-[#D1D5DB] accent-[#16A34A]"
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

                <CoachSheetField
                  label="Sign waiver — type your full name *"
                  htmlFor="intake-signed-name"
                  hint="Must match the name above"
                >
                  <input
                    id="intake-signed-name"
                    className="coach-input font-medium italic"
                    required
                    value={form.signedName}
                    onChange={(e) => setForm((f) => ({ ...f, signedName: e.target.value }))}
                    placeholder={form.name || "Juan dela Cruz"}
                  />
                </CoachSheetField>
              </div>
            )}

            {current.id === "success" && (
              <div className="space-y-4 text-center">
                <p className="text-sm leading-relaxed text-[#6B7280]">
                  Thanks, {form.name.split(" ")[0]}. Coach {firstName} will review your sign-up and add you to the
                  roster once approved.
                </p>
                <p className="text-xs text-[#9CA3AF]">Your waiver has been recorded.</p>
                <ol className="space-y-3 text-left">
                  {[
                    {
                      title: "Coach reviews your sign-up",
                      body: "Usually within a day or two.",
                    },
                    {
                      title: "You're added to the roster",
                      body: "Then you can book sessions and track progress.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#4F8FF7]">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                        <p className="text-xs text-[#6B7280]">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-[1] shrink-0 border-t border-[#E5E7EB] bg-white/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto w-full max-w-lg">
          {error ? (
            <p
              role="alert"
              className="mb-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-center text-xs font-medium text-[#B91C1C]"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-3">
            {isSuccess ? (
              <Link href={profilePath} className="coach-btn-primary min-h-[48px] w-full justify-center">
                Back to profile
              </Link>
            ) : isFirst ? (
              <>
                <Link
                  href={profilePath}
                  className="coach-btn-outline flex min-h-[48px] flex-1 items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Profile
                </Link>
                <CoachButton type="button" className="min-h-[48px] flex-[2]" onClick={() => void goNext()}>
                  Let&apos;s go
                </CoachButton>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="coach-btn-outline flex min-h-[48px] flex-1 items-center justify-center gap-1"
                  disabled={pending}
                  onClick={goBack}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <CoachButton
                  type="button"
                  className="min-h-[48px] flex-[2]"
                  loading={pending}
                  loadingLabel="Submitting…"
                  onClick={() => void goNext()}
                >
                  {isWaiver ? "Submit & join roster" : "Continue"}
                </CoachButton>
              </>
            )}
          </div>

          {!isSuccess && (
            <p className="mt-2 text-center text-xs text-[#9CA3AF]">
              Coach {firstName} approves sign-ups before your first session
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

function StepDot({
  icon: Icon,
  active,
  done,
}: {
  icon: LucideIcon;
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-all",
        done && "bg-[#F0FDF4] text-[#16A34A]",
        active && !done && "bg-[#EFF6FF] text-[#4F8FF7] ring-2 ring-[#BFDBFE] scale-110",
        !active && !done && "bg-[#F3F4F6] text-[#9CA3AF]"
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
    </span>
  );
}
