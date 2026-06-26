"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { CoachPublicProfileLinkCard } from "@/components/koaches/coach/CoachPublicProfileLinkCard";
import { CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachProfileSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { PricingTiersEditor } from "@/components/koaches/coach/PricingTiersEditor";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import {
  updateCoachBioAction,
  updateCoachContactAction,
  updateCoachPricingAction,
  updateCoachSkillTemplateAction,
} from "@/lib/koaches/actions/coach-profile";
import { markCoachOnboardingComplete } from "@/lib/koaches/coach-onboarding";
import { SKILL_RUBRICS } from "@/lib/koaches/program-templates";
import { DEFAULT_SESSION_PRICING } from "@/lib/koaches/pricing";
import type { CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "profile", title: "Photo & bio" },
  { id: "contact", title: "Contact" },
  { id: "rates", title: "Drop-in rates" },
  { id: "skills", title: "Skill template" },
  { id: "share", title: "Your link" },
] as const;

export function CoachOnboardingPage() {
  const router = useRouter();
  const coachId = usePortalCoachId();
  const { coach, loading, refresh } = useCoachProfile(coachId);
  const { showToast } = useCoachToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [mobile, setMobile] = useState("");
  const [pricing, setPricing] = useState<CoachSessionPricing>(DEFAULT_SESSION_PRICING);
  const [skillTemplateId, setSkillTemplateId] = useState<SkillRubricId>("intermediate");

  useEffect(() => {
    if (!coach) return;
    setBio(coach.bio);
    setSpecialization(coach.specialization ?? "");
    setMobile(coach.mobile ?? "");
    setPricing(coach.sessionPricing ?? DEFAULT_SESSION_PRICING);
    setSkillTemplateId(coach.skillTemplateId);
  }, [coach]);

  if (loading || !coach) {
    return <CoachProfileSkeleton />;
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

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
      } else if (current.id === "skills") {
        await updateCoachSkillTemplateAction(coachId, skillTemplateId);
      }
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
      markCoachOnboardingComplete();
      router.push("/coach/dashboard");
      return;
    }
    const ok = await saveStep();
    if (ok) setStep((s) => s + 1);
  };

  return (
    <CoachPageShell className="max-w-lg pb-10">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Setup · Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-[#111827]">{current.title}</h1>
        <div className="mt-3 flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= step ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
              )}
            />
          ))}
        </div>
      </div>

      <div className="coach-card p-5">
        {current.id === "welcome" && (
          <div className="space-y-3 text-sm text-[#6B7280]">
            <p>
              Let&apos;s set up your coach profile so students know who you are and how to reach you.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3D5C47]" />
                Photo, bio, and contact for your public page
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3D5C47]" />
                Drop-in session rates and skill rating template
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3D5C47]" />
                Your shareable profile link
              </li>
            </ul>
            <p className="text-xs text-[#9CA3AF]">Takes about 3 minutes. You can change everything later in Profile.</p>
          </div>
        )}

        {current.id === "profile" && (
          <div className="space-y-4">
            <CoachProfilePhoto
              coachId={coachId}
              name={coach.name}
              defaultPhoto={coach.photo}
              size="xl"
              editable
              className="mx-auto"
              onUpdated={refresh}
            />
            <CoachSheetField label="Bio *">
              <textarea
                className="coach-input min-h-[100px] resize-none"
                placeholder="Tell students about your coaching style..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </CoachSheetField>
            <CoachSheetField label="Specialization">
              <input
                className="coach-input"
                placeholder="e.g. Beginners, competitive doubles"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            </CoachSheetField>
          </div>
        )}

        {current.id === "contact" && (
          <CoachSheetField label="Mobile number *" hint="Shown on your public profile for bookings">
            <input
              className="coach-input"
              type="tel"
              placeholder="09XX XXX XXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </CoachSheetField>
        )}

        {current.id === "rates" && (
          <div>
            <p className="mb-3 text-sm text-[#6B7280]">Set rates for drop-in sessions. Programs have their own pricing.</p>
            <PricingTiersEditor pricing={pricing} onChange={setPricing} />
          </div>
        )}

        {current.id === "skills" && (
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280]">Default rubric when rating students after sessions.</p>
            {(Object.keys(SKILL_RUBRICS) as Array<keyof typeof SKILL_RUBRICS>).map((id) => {
              const rubric = SKILL_RUBRICS[id];
              return (
                <label key={id} className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3">
                  <input
                    type="radio"
                    name="onboard-rubric"
                    checked={skillTemplateId === id}
                    onChange={() => setSkillTemplateId(id)}
                  />
                  <div>
                    <span className="text-sm font-medium">{rubric.name}</span>
                    <p className="text-xs text-[#6B7280]">{rubric.subtitle}</p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {current.id === "share" && (
          <div>
            <p className="mb-4 text-sm text-[#6B7280]">
              You&apos;re all set. Share this link when you&apos;re ready for students to find you.
            </p>
            <CoachPublicProfileLinkCard coach={coach} />
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            className="coach-btn-outline flex-1"
            disabled={saving}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="coach-btn-primary flex-1"
          disabled={saving}
          onClick={() => void handleNext()}
        >
          {saving ? "Saving…" : isLast ? "Go to dashboard" : "Continue"}
        </button>
      </div>

      <button
        type="button"
        className="mt-4 w-full text-center text-sm font-medium text-[#9CA3AF] hover:text-[#6B7280]"
        onClick={() => {
          markCoachOnboardingComplete();
          router.push("/coach/dashboard");
        }}
      >
        Skip for now
      </button>
    </CoachPageShell>
  );
}
