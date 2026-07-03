"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Check,
  Link2,
  PartyPopper,
  Phone,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { CoachPublicProfileLinkCard } from "@/components/koaches/coach/CoachPublicProfileLinkCard";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachStepper } from "@/components/koaches/coach/CoachStepper";
import { PricingTiersEditor } from "@/components/koaches/coach/PricingTiersEditor";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { CoachingLevelsPicker } from "@/components/koaches/shared/CoachingLevelsPicker";
import { SpecializationPicker } from "@/components/koaches/shared/SpecializationPicker";
import {
  completeCoachOnboardingAction,
  updateCoachBioAction,
  updateCoachContactAction,
  updateCoachPricingAction,
  updateCoachCoachingLevelsAction,
} from "@/lib/koaches/actions/coach-profile";
import type { CoachingLevelId } from "@/lib/koaches/application-form";
import { resolveCoachCoachingLevels } from "@/lib/koaches/application-form";
import { DEFAULT_SESSION_PRICING } from "@/lib/koaches/pricing";
import { coachGreetingLabel } from "@/lib/koaches/person-name";
import { BRAND_NAME } from "@/lib/koaches/constants";
import { needsCoachOnboarding } from "@/lib/koaches/coach-onboarding";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { invalidateCoachProfile, setCoachProfileCache } from "@/lib/koaches/queries/invalidate";
import type { CoachSessionPricing } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { LegalLinks } from "@/components/koaches/shared/LegalLinks";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";

const STEPS = [
  {
    id: "welcome",
    title: `Welcome to ${BRAND_NAME}`,
    subtitle: "We're so glad you're here",
    icon: Sparkles,
  },
  {
    id: "profile",
    title: "Photo & bio",
    subtitle: "Help players get to know the coach behind the court",
    icon: Camera,
  },
  {
    id: "contact",
    title: "Contact",
    subtitle: "How students can reach you when they're ready",
    icon: Phone,
  },
  {
    id: "rates",
    title: "Drop-in rates",
    subtitle: "Set your session pricing. You can change this anytime.",
    icon: Wallet,
  },
  {
    id: "levels",
    title: "Player levels",
    subtitle: "Who you love coaching most",
    icon: Target,
  },
  {
    id: "share",
    title: "You're all set!",
    subtitle: "Thank you for setting up with us",
    icon: PartyPopper,
  },
] as const;

export function CoachOnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const coachId = usePortalCoachId();
  const { coach, loading, refresh } = useCoachProfile(coachId);
  const { showToast } = useCoachToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mobile, setMobile] = useState("");
  const [pricing, setPricing] = useState<CoachSessionPricing>(DEFAULT_SESSION_PRICING);
  const [coachingLevels, setCoachingLevels] = useState<CoachingLevelId[]>(["intermediate"]);

  useEffect(() => {
    if (!coach) return;
    setBio(coach.bio);
    setSpecialization(coach.specialization ?? "");
    setMobile(coach.mobile ?? "");
    setPricing(coach.sessionPricing ?? DEFAULT_SESSION_PRICING);
    setCoachingLevels(resolveCoachCoachingLevels(coach));
  }, [coach]);

  useEffect(() => {
    if (loading || !coach) return;
    if (!needsCoachOnboarding(coach)) {
      router.replace("/coach/dashboard");
    }
  }, [coach, loading, router]);

  if (loading || !coach || !coachId) {
    return (
      <div className="coach-portal relative flex h-dvh flex-col overflow-hidden bg-white">
        <PickleballBallBackdrop variant="landing" />
        <div className="relative z-[1] animate-pulse p-6 pt-10">
          <div className="mx-auto h-8 w-40 rounded-lg bg-[#E5E7EB]" />
          <div className="mx-auto mt-8 h-64 max-w-md rounded-2xl bg-[#E5E7EB]/80" />
        </div>
      </div>
    );
  }

  const current = STEPS[step];
  const StepIcon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const greeting = coachGreetingLabel(coach);

  const saveStep = async (): Promise<boolean> => {
    setSaving(true);
    try {
      if (current.id === "profile") {
        if (!bio.trim()) {
          showToast("Please add a short bio", "error");
          return false;
        }
        await updateCoachBioAction(coachId, bio, specialization);
      } else if (current.id === "contact") {
        if (!mobile.trim()) {
          showToast("Mobile number is required for your public profile", "error");
          return false;
        }
        await updateCoachContactAction(coachId, {
          mobile,
          instagram: coach.instagram ?? "",
          facebook: coach.facebook ?? "",
        });
      } else if (current.id === "rates") {
        await updateCoachPricingAction(coachId, pricing);
      } else if (current.id === "levels") {
        if (coachingLevels.length === 0) {
          showToast("Select at least one player level", "error");
          return false;
        }
        await updateCoachCoachingLevelsAction(coachId, coachingLevels);
      }
      invalidateCoachProfile(coachId);
      await refresh();
      return true;
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save", "error");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (current.id === "welcome") {
      setStep((s) => s + 1);
      return;
    }
    if (current.id === "share") {
      setSaving(true);
      try {
        const updatedCoach = await completeCoachOnboardingAction(coachId);
        setCoachProfileCache(coachId, updatedCoach);
        await queryClient.refetchQueries({
          queryKey: [...coachKeys.all, "profile", coachId],
        });
        showToast("Welcome! We're so glad you're here.");
        router.replace("/coach/dashboard");
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Could not finish setup", "error");
      } finally {
        setSaving(false);
      }
      return;
    }
    const ok = await saveStep();
    if (ok) setStep((s) => s + 1);
  };

  return (
    <div className="coach-portal relative flex h-dvh flex-col overflow-hidden bg-white">
      <PickleballBallBackdrop variant="landing" />

      <header className="relative z-[1] shrink-0 border-b border-[#E5E7EB] bg-white/95 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-sm">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between gap-3">
            <KoachesWordmark size="sm" />
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
              Setup
            </span>
          </div>

          <div className="mt-5">
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

          <CoachStepper
            card={false}
            variant="header"
            className="mt-4"
            steps={STEPS.map((s) => ({ id: s.id, label: s.title, icon: s.icon }))}
            currentStepId={current.id}
          />
        </div>
      </header>

      <main className="relative z-[1] min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-4 py-5">
          <div className="coach-card p-5 shadow-sm">
            {current.id === "welcome" && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-[#6B7280]">
                  Hey {greeting}! Thank you for trying {BRAND_NAME}. We built this for coaches, and
                  it means a lot that you signed in. This quick setup takes about 3 minutes, then
                  you&apos;re ready to coach.
                </p>
                <ul className="space-y-3">
                  {[
                    "A photo and bio for your public page",
                    "Contact info so players can reach you",
                    "Drop-in rates and player levels",
                    "Your shareable profile link",
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

            {current.id === "profile" && (
              <div className="space-y-4">
                <div className="flex justify-center rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#EFF6FF] p-5">
                  <CoachProfilePhoto
                    coachId={coachId}
                    name={coach.name}
                    defaultPhoto={coach.photo}
                    size="hero"
                    editable
                    onUpdated={refresh}
                  />
                </div>
                <CoachSheetField label="Bio *">
                  <textarea
                    className="coach-input min-h-[100px] resize-none"
                    placeholder="Tell students about your coaching style, experience, and what makes your sessions fun..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </CoachSheetField>
                <CoachSheetField label="What do you coach?">
                  <SpecializationPicker
                    id="onboarding-specialization"
                    value={specialization}
                    onChange={setSpecialization}
                  />
                </CoachSheetField>
              </div>
            )}

            {current.id === "contact" && (
              <div className="space-y-3">
                <p className="text-sm text-[#6B7280]">
                  Students will see this on your public profile when they want to book.
                </p>
                <CoachSheetField label="Mobile number *">
                  <input
                    className="coach-input"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </CoachSheetField>
              </div>
            )}

            {current.id === "rates" && (
              <div>
                <p className="mb-3 text-sm text-[#6B7280]">
                  Set your drop-in session rates. Programs have their own bundle pricing.
                </p>
                <PricingTiersEditor pricing={pricing} onChange={setPricing} />
              </div>
            )}

            {current.id === "levels" && (
              <CoachingLevelsPicker value={coachingLevels} onChange={setCoachingLevels} />
            )}

            {current.id === "share" && (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A]">
                  <PartyPopper className="h-7 w-7" strokeWidth={1.75} />
                </div>
                <p className="font-heading mt-4 text-lg font-bold text-[#111827]">
                  Thank you, {greeting}!
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  Your profile is live. We&apos;re grateful you took the time to set this up. Share
                  your link whenever you&apos;re ready for students to find you.
                </p>
                <div className="mt-5 text-left">
                  <CoachPublicProfileLinkCard coach={coach} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-[1] shrink-0 border-t border-[#E5E7EB] bg-white/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto w-full max-w-lg">
          <div className="flex gap-3">
            {!isFirst && (
              <button
                type="button"
                className="coach-btn-outline flex min-h-[48px] flex-1 items-center justify-center gap-1"
                disabled={saving}
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
            <CoachButton
              type="button"
              className={cn("min-h-[48px]", isFirst ? "w-full" : "flex-[2]")}
              loading={saving}
              loadingLabel={isLast ? "Finishing…" : "Saving…"}
              onClick={() => void handleNext()}
            >
              {current.id === "welcome" ? (
                "Let's go"
              ) : isLast ? (
                <>
                  <Link2 className="h-4 w-4" />
                  Enter dashboard
                </>
              ) : (
                "Continue"
              )}
            </CoachButton>
          </div>
          <p className="mt-2 text-center text-xs text-[#9CA3AF]">
            One-time setup · Thank you for being an early coach · Edit anytime in Profile
          </p>
          <LegalLinks className="mt-2 justify-center" />
        </div>
      </footer>
    </div>
  );
}
