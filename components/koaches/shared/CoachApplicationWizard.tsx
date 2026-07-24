"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  CoachApplicationFields,
  formatApplicationReview,
  useCoachApplicationDraft,
  type ApplicationFieldStep,
} from "@/components/koaches/shared/CoachApplicationFields";
import { submitCoachApplicationAction } from "@/lib/koaches/actions/applications";
import {
  displayFacebook,
  displayInstagram,
  facebookProfileUrl,
  instagramProfileUrl,
} from "@/lib/koaches/social-links";
import {
  draftToSubmitInput,
  validateBusinessStep,
  validateCoachingStep,
  validateIdentityStep,
} from "@/lib/koaches/application-form";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "welcome",
    title: "Apply to coach",
    subtitle: "Takes about 5 minutes",
    icon: Sparkles,
  },
  {
    id: "identity",
    title: "Your details",
    subtitle: "Name, email, and phone",
    icon: User,
  },
  {
    id: "coaching",
    title: "Your coaching story",
    subtitle: "What players see on your page",
    icon: Sparkles,
  },
  {
    id: "business",
    title: "Profile setup",
    subtitle: "Your link and player levels",
    icon: Link2,
  },
  {
    id: "review",
    title: "Review",
    subtitle: "Check everything, then submit",
    icon: ClipboardCheck,
  },
  {
    id: "success",
    title: "Submitted",
    subtitle: "We'll be in touch soon",
    icon: CheckCircle2,
  },
] as const;

const NEXT_STEPS = [
  {
    icon: ClipboardCheck,
    title: "We review your application",
    body: "Usually within 1 to 2 business days. We read every one.",
  },
  {
    icon: MessageCircle,
    title: "We reach out personally",
    body: "SMS and email with payment and onboarding details.",
  },
  {
    icon: CheckCircle2,
    title: "Your portal goes live",
    body: "Sign in and start coaching on PickleKoach. We're rooting for you.",
  },
] as const;

type CoachApplicationWizardProps = {
  backHref: string;
  backLabel: string;
  successHref: string;
  successCta: string;
  className?: string;
};

export function CoachApplicationWizard({
  backHref,
  backLabel,
  successHref,
  successCta,
  className,
}: CoachApplicationWizardProps) {
  const { draft, patch } = useCoachApplicationDraft();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const current = STEPS[step];
  const StepIcon = current.icon;
  const progress = Math.round(((step + 1) / STEPS.length) * 100);
  const isFirst = step === 0;
  const isReview = current.id === "review";
  const isSuccess = current.id === "success";
  const review = isReview || isSuccess ? formatApplicationReview(draft) : null;

  const goNext = () => {
    setError(null);

    if (current.id === "welcome") {
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "identity") {
      const err = validateIdentityStep(draft);
      if (err) {
        setError(err);
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "coaching") {
      const err = validateCoachingStep(draft);
      if (err) {
        setError(err);
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "business") {
      const err = validateBusinessStep(draft);
      if (err) {
        setError(err);
        return;
      }
      setStep((s) => s + 1);
      return;
    }

    if (current.id === "review") {
      setPending(true);
      void (async () => {
        try {
          await submitCoachApplicationAction(draftToSubmitInput(draft));
          setStep((s) => s + 1);
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
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className={cn("coach-portal relative flex h-dvh flex-col overflow-hidden bg-white", className)}>
      <PickleballBallBackdrop variant="landing" />

      <header className="relative z-[1] shrink-0 border-b border-[#E5E7EB] bg-white/95 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between gap-3">
            <KoachesWordmark size="sm" />
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
              Apply
            </span>
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
        </div>
      </header>

      <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-4 py-5">
          <div className="coach-card p-5 shadow-sm">
            {current.id === "welcome" && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[#6B7280]">
                  Fill this out and we&apos;ll review your application.
                </p>
                <ul className="space-y-3">
                  {[
                    "Contact details",
                    "Coaching bio",
                    "Profile link and levels",
                    "Review and submit",
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

            {(current.id === "identity" ||
              current.id === "coaching" ||
              current.id === "business") && (
              <CoachApplicationFields
                step={current.id as ApplicationFieldStep}
                draft={draft}
                onDraftChange={patch}
              />
            )}

            {current.id === "review" && review && (
              <div>
                <dl className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm">
                  <ReviewRow label="Name" value={review.fullName} />
                  <ReviewRow
                    label="Contact"
                    value={
                      <>
                        {review.mobile}
                        <br />
                        <span className="text-xs text-[#6B7280]">{review.email}</span>
                      </>
                    }
                  />
                  <ReviewRow label="Specialization" value={review.specialization} highlight />
                  <div>
                    <dt className="text-[#6B7280]">Bio</dt>
                    <dd className="mt-1 text-[#374151]">{review.bio}</dd>
                  </div>
                  {(review.instagram || review.facebook) && (
                    <div className="space-y-2">
                      <dt className="text-[#6B7280]">Social</dt>
                      <dd className="space-y-1.5">
                        {review.instagram ? (
                          <a
                            href={instagramProfileUrl(review.instagram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-all text-sm font-medium text-[#4F8FF7] hover:underline"
                          >
                            {displayInstagram(review.instagram)}
                          </a>
                        ) : null}
                        {review.facebook ? (
                          <a
                            href={facebookProfileUrl(review.facebook)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block break-all text-sm font-medium text-[#4F8FF7] hover:underline"
                          >
                            {displayFacebook(review.facebook)}
                          </a>
                        ) : null}
                      </dd>
                    </div>
                  )}
                  <ReviewRow label="Player levels" value={review.coachingLevelsLabel} />
                  {review.students > 0 && (
                    <ReviewRow label="Current students" value={String(review.students)} />
                  )}
                  {review.preferredSlug && (
                    <ReviewRow label="Profile URL" value={`/coach/${review.preferredSlug}`} />
                  )}
                </dl>
                <p className="mt-4 text-xs text-[#6B7280]">
                  When you submit, our team will reach out via SMS and email. We&apos;re grateful you
                  took the time to apply.
                </p>
              </div>
            )}

            {current.id === "success" && review && (
              <div className="space-y-5">
                <p className="text-sm text-[#6B7280]">
                  Thank you so much for applying
                  {review.email ? `. We'll be in touch at ${review.email}` : ""}. We&apos;re really
                  glad you&apos;re interested in coaching on PickleKoach.
                </p>
                <ol className="space-y-3">
                  {NEXT_STEPS.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#4F8FF7]">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                        <p className="text-xs text-[#6B7280]">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm">
                  <p className="font-semibold text-[#111827]">Watch for a message from us</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    SMS to {review.mobile} and email to {review.email}.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6B7280] ring-1 ring-[#E5E7EB]">
                      <MessageCircle className="h-3.5 w-3.5" /> SMS
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-[#6B7280] ring-1 ring-[#E5E7EB]">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                  </div>
                </div>
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
              <Link href={successHref} className="coach-btn-primary min-h-[48px] w-full justify-center">
                {successCta}
              </Link>
            ) : isFirst ? (
              <>
                <Link
                  href={backHref}
                  className="coach-btn-outline !w-auto shrink-0 whitespace-nowrap px-3"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  {backLabel}
                </Link>
                <CoachButton type="button" className="min-h-[48px] flex-1 whitespace-nowrap" onClick={goNext}>
                  Let&apos;s go
                </CoachButton>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="coach-btn-outline !w-auto shrink-0 whitespace-nowrap px-3"
                  disabled={pending}
                  onClick={goBack}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  Back
                </button>
                <CoachButton
                  type="button"
                  className="min-h-[48px] flex-1 whitespace-nowrap"
                  loading={pending}
                  loadingLabel="Sending…"
                  onClick={goNext}
                >
                  {isReview ? (
                    <>
                      <Send className="h-4 w-4 shrink-0" />
                      Submit application
                    </>
                  ) : (
                    "Continue"
                  )}
                </CoachButton>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-[#6B7280]">{label}</dt>
      <dd
        className={cn(
          "min-w-0 font-medium break-words sm:max-w-[65%] sm:text-right",
          highlight ? "text-[#4F8FF7]" : "text-[#111827]"
        )}
      >
        {value}
      </dd>
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
