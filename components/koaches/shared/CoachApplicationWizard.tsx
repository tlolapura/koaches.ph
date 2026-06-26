"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Mail,
  MessageCircle,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import {
  CoachApplicationFields,
  formatApplicationReview,
  useCoachApplicationDraft,
  type ApplicationFieldStep,
} from "@/components/koaches/shared/CoachApplicationFields";
import { submitCoachApplicationAction } from "@/lib/koaches/actions/applications";
import {
  draftToSubmitInput,
  validateBusinessStep,
  validateCoachingStep,
  validateIdentityStep,
} from "@/lib/koaches/application-form";
import { cn } from "@/lib/utils";

type WizardStep = "welcome" | ApplicationFieldStep | "review" | "success";

const FLOW_STEPS: { id: ApplicationFieldStep | "review"; label: string }[] = [
  { id: "identity", label: "You" },
  { id: "coaching", label: "Coaching" },
  { id: "business", label: "Profile" },
  { id: "review", label: "Send" },
];

const STEP_COPY: Record<ApplicationFieldStep | "review", { title: string; subtitle: string }> = {
  identity: {
    title: "Let's start with you",
    subtitle: "We'll use this to set up your coach account and keep you in the loop.",
  },
  coaching: {
    title: "Tell your coaching story",
    subtitle: "This becomes your public profile — help players know what makes you great.",
  },
  business: {
    title: "Your public profile",
    subtitle: "Choose your profile link and the player levels you work with.",
  },
  review: {
    title: "Ready to join the court?",
    subtitle: "Give it a quick look, then hit send. We're excited to have you.",
  },
};

const BENEFITS = [
  {
    icon: Users,
    title: "Students & sessions",
    body: "Manage bookings, programs, and progress in one place.",
  },
  {
    icon: Sparkles,
    title: "Your public profile",
    body: "A shareable page so new players can find and book you.",
  },
  {
    icon: BarChart3,
    title: "Progress tracking",
    body: "Skill rubrics and progress cards that keep students coming back.",
  },
] as const;

const NEXT_STEPS = [
  {
    icon: ClipboardCheck,
    title: "We review your application",
    body: "Our team checks your details — usually within 1–2 business days.",
  },
  {
    icon: MessageCircle,
    title: "Admin reaches out via SMS & email",
    body: "You'll hear from us to walk through payment and onboarding.",
  },
  {
    icon: CheckCircle2,
    title: "Your portal goes live",
    body: "Sign in, finish your profile, and start coaching on Koaches.",
  },
] as const;

type CoachApplicationWizardProps = {
  backHref: string;
  backLabel: string;
  successHref: string;
  successCta: string;
  className?: string;
};

function WizardNavButtons({
  onBack,
  onNext,
  nextLabel,
  loading,
  loadingLabel,
  hideBack,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  loading?: boolean;
  loadingLabel?: string;
  hideBack?: boolean;
}) {
  return (
    <div className="flex gap-3">
      {!hideBack ? (
        <button
          type="button"
          className="coach-btn-outline flex flex-1 items-center justify-center gap-1"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      ) : null}
      <button
        type="button"
        className={cn(
          "coach-btn-primary flex items-center justify-center gap-1",
          hideBack ? "w-full" : "flex-[2]"
        )}
        onClick={onNext}
        disabled={loading}
      >
        {loading ? (
          loadingLabel ?? "Sending…"
        ) : (
          <>
            {nextLabel}
            {nextLabel !== "Submit application" && <ArrowRight className="h-4 w-4" />}
          </>
        )}
      </button>
    </div>
  );
}

function WizardFooter({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string | null;
}) {
  return (
    <div className="shrink-0 border-t border-[#E5E7EB] bg-[#FAFAF8]/95 px-1 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-center text-xs font-medium text-[#B91C1C]"
        >
          {error}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function CoachApplicationWizard({
  backHref,
  backLabel,
  successHref,
  successCta,
  className,
}: CoachApplicationWizardProps) {
  const { draft, patch } = useCoachApplicationDraft();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const flowIndex = FLOW_STEPS.findIndex((s) => s.id === step);
  const progress = step === "welcome" || step === "success" ? 0 : ((flowIndex + 1) / FLOW_STEPS.length) * 100;

  const goNext = () => {
    setError(null);

    if (step === "identity") {
      const err = validateIdentityStep(draft);
      if (err) {
        setError(err);
        return;
      }
      setStep("coaching");
      return;
    }

    if (step === "coaching") {
      const err = validateCoachingStep(draft);
      if (err) {
        setError(err);
        return;
      }
      setStep("business");
      return;
    }

    if (step === "business") {
      const err = validateBusinessStep(draft);
      if (err) {
        setError(err);
        return;
      }
      setStep("review");
      return;
    }

    if (step === "review") {
      setPending(true);
      void (async () => {
        try {
          await submitCoachApplicationAction(draftToSubmitInput(draft));
          setStep("success");
        } catch {
          setError("Couldn't submit your application. Please try again.");
        } finally {
          setPending(false);
        }
      })();
    }
  };

  const goBack = () => {
    setError(null);
    if (step === "welcome") return;
    if (step === "identity") {
      setStep("welcome");
      return;
    }
    if (step === "review") {
      setStep("business");
      return;
    }
    const prevIdx = FLOW_STEPS.findIndex((s) => s.id === step) - 1;
    if (prevIdx >= 0) setStep(FLOW_STEPS[prevIdx].id);
  };

  const review = step === "review" || step === "success" ? formatApplicationReview(draft) : null;
  const showStickyFooter = step !== "success";

  if (step === "success" && review) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("coach-card p-6 sm:p-8", className)}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A5F]"
          >
            <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <p className="font-heading mt-5 text-2xl font-bold text-[#111827]">
            You&apos;re on the list!
          </p>
          <p className="mt-2 text-sm text-[#6B7280]">
            Thanks for applying{review.email ? `, ${review.email.split("@")[0]}` : ""}. Here&apos;s what happens next.
          </p>
        </div>

        <ol className="mt-8 space-y-4">
          {NEXT_STEPS.map((item, i) => (
            <motion.li
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F] text-white">
                <item.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                <p className="text-xs text-[#6B7280]">{item.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#EDF2F7]/50 p-4 text-sm">
          <p className="font-semibold text-[#1E3A5F]">Watch for a message from us</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            We&apos;ll contact you via SMS ({review.mobile}) and email ({review.email}) for payment and onboarding.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6B7280]">
              <MessageCircle className="h-3.5 w-3.5" /> SMS
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6B7280]">
              <Mail className="h-3.5 w-3.5" /> Email
            </span>
          </div>
        </div>

        <Link href={successHref} className="coach-btn-primary mt-6 inline-flex w-full justify-center">
          {successCta}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {step !== "welcome" && (
        <div className="mb-5 shrink-0">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>
              Step {Math.max(flowIndex + 1, 1)} of {FLOW_STEPS.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
            <motion.div
              className="h-full rounded-full bg-[#1E3A5F]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="mt-3 hidden gap-1 sm:flex">
            {FLOW_STEPS.map((s, i) => {
              const done = flowIndex > i;
              const active = s.id === step;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors",
                    active && "bg-[#EDF2F7] text-[#1E3A5F]",
                    done && !active && "text-[#1E3A5F]",
                    !active && !done && "text-[#9CA3AF]"
                  )}
                >
                  {done && !active ? <Check className="h-3 w-3" /> : null}
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-2">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="coach-card overflow-hidden p-6 sm:p-8"
          >
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1E3A5F]">Join KoachesPH</p>
              <h2 className="font-heading mt-1 text-2xl font-bold">
                Ready to coach on the platform players trust?
              </h2>
              <p className="mt-2 text-sm text-[#6B7280]">
                A few quick steps — about 5 minutes — and you&apos;re in the queue for your coach portal.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {BENEFITS.map((b, i) => (
                <motion.li
                  key={b.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E3A5F] text-white">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#111827]">{b.title}</p>
                    <p className="text-xs text-[#6B7280]">{b.body}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {(step === "identity" || step === "coaching" || step === "business") && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="coach-card p-6 sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F] text-white">
                {step === "identity" ? (
                  <User className="h-5 w-5" />
                ) : step === "coaching" ? (
                  <Sparkles className="h-5 w-5" />
                ) : (
                  <BarChart3 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">{STEP_COPY[step].title}</h2>
                <p className="mt-1 text-sm text-[#6B7280]">{STEP_COPY[step].subtitle}</p>
              </div>
            </div>

            <CoachApplicationFields step={step} draft={draft} onDraftChange={patch} />
          </motion.div>
        )}

        {step === "review" && review && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="coach-card p-6 sm:p-8"
          >
            <div className="mb-6">
              <h2 className="font-heading text-xl font-bold">{STEP_COPY.review.title}</h2>
              <p className="mt-1 text-sm text-[#6B7280]">{STEP_COPY.review.subtitle}</p>
            </div>

            <dl className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAF8] p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Name</dt>
                <dd className="text-right font-medium text-[#111827]">{review.fullName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Contact</dt>
                <dd className="text-right font-medium text-[#111827]">
                  {review.mobile}
                  <br />
                  <span className="text-xs text-[#6B7280]">{review.email}</span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Specialization</dt>
                <dd className="text-right font-medium text-[#1E3A5F]">{review.specialization}</dd>
              </div>
              <div>
                <dt className="text-[#6B7280]">Bio</dt>
                <dd className="mt-1 text-[#374151]">{review.bio}</dd>
              </div>
              {(review.instagram || review.facebook) && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Social</dt>
                  <dd className="text-right text-xs text-[#374151]">
                    {[review.instagram, review.facebook].filter(Boolean).join(" · ")}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-[#6B7280]">Player levels</dt>
                <dd className="text-right font-medium">{review.coachingLevelsLabel}</dd>
              </div>
              {review.students > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Current students</dt>
                  <dd className="font-medium">{review.students}</dd>
                </div>
              )}
              {review.preferredSlug && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#6B7280]">Profile URL</dt>
                  <dd className="font-medium">/coaches/{review.preferredSlug}</dd>
                </div>
              )}
            </dl>

            <p className="mt-4 text-xs text-[#6B7280]">
              After you submit, our admin team will reach out via SMS and email to complete payment and onboarding.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {showStickyFooter && (
        <WizardFooter error={step === "welcome" ? null : error}>
          {step === "welcome" ? (
            <div className="flex gap-3">
              <Link
                href={backHref}
                className="coach-btn-outline flex flex-1 items-center justify-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Link>
              <button
                type="button"
                className="coach-btn-primary flex flex-[2] items-center justify-center gap-1"
                onClick={() => setStep("identity")}
              >
                Let&apos;s go
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : step === "review" ? (
            <WizardNavButtons
              onBack={goBack}
              onNext={goNext}
              nextLabel="Submit application"
              loading={pending}
              loadingLabel="Sending…"
            />
          ) : (
            <WizardNavButtons onBack={goBack} onNext={goNext} nextLabel="Continue" />
          )}
        </WizardFooter>
      )}
    </div>
  );
}
