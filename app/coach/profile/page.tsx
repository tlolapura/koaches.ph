"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Zap } from "lucide-react";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { CoachingLevelsPicker } from "@/components/koaches/shared/CoachingLevelsPicker";
import {
  formatCoachingLevelsLabel,
  resolveCoachCoachingLevels,
  type CoachingLevelId,
} from "@/lib/koaches/application-form";
import { formatTierRate, formatTierLabel, DEFAULT_SESSION_PRICING } from "@/lib/koaches/pricing";
import { resolveSkills } from "@/lib/koaches/constants";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { PricingTiersEditor } from "@/components/koaches/coach/PricingTiersEditor";
import { WorkingHoursCard } from "@/components/koaches/coach/WorkingHoursCard";
import { CoachAchievementsCard } from "@/components/koaches/coach/CoachAchievementsCard";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachProfileSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import {
  coachHasCustomizedSessionSkills,
  DropInSkillsSheet,
} from "@/components/koaches/coach/DropInSkillsSheet";
import {
  updateCoachBioAction,
  updateCoachPricingAction,
  updateCoachCoachingLevelsAction,
} from "@/lib/koaches/actions/coach-profile";
import { CoachContactSocialsCard } from "@/components/koaches/coach/CoachContactSocialsCard";
import { CoachCourtsCard } from "@/components/koaches/coach/CoachCourtsCard";
import { CoachPublicProfileLinkCard } from "@/components/koaches/coach/CoachPublicProfileLinkCard";
import { invalidateCoachProfile } from "@/lib/koaches/queries/invalidate";
import { coachGreetingLabel } from "@/lib/koaches/person-name";
import { formatDisplayDate } from "@/lib/utils";

const EDIT_BIO_FORM_ID = "edit-bio-form";

export default function ProfilePage() {
  return (
    <Suspense fallback={<CoachProfileSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const coachId = usePortalCoachId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { coach, error: profileError, refresh } = useCoachProfile(coachId);
  const [editOpen, setEditOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(() => searchParams.get("skills") === "1");
  const [courtsOpen, setCourtsOpen] = useState(() => searchParams.get("courts") === "1");
  const [bio, setBio] = useState("");
  const [pricing, setPricing] = useState<import("@/lib/koaches/types").CoachSessionPricing>(DEFAULT_SESSION_PRICING);
  const [coachingLevels, setCoachingLevels] = useState<CoachingLevelId[]>(["intermediate"]);
  const [savingBio, setSavingBio] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const { showToast } = useCoachToast();

  useEffect(() => {
    if (searchParams.get("skills") === "1" || searchParams.get("courts") === "1") {
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (!coach) return;
    setBio(coach.bio);
    setPricing(coach.sessionPricing ?? DEFAULT_SESSION_PRICING);
    setCoachingLevels(resolveCoachCoachingLevels(coach));
  }, [coach]);

  if (!coachId) {
    return <CoachProfileSkeleton />;
  }

  if (!coach) {
    return (
      <CoachPageShell>
        <CoachPageHeader
          title="Profile"
          subtitle="How you look online, what you charge, and when you're free"
        />
        {profileError ? (
          <div className="coach-card mt-6 p-6 text-center">
            <p className="font-heading font-semibold text-[#111827]">Couldn&apos;t load your profile</p>
            <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
            <CoachButton type="button" className="mt-4 px-6" onClick={() => void refresh()}>
              Try again
            </CoachButton>
          </div>
        ) : (
          <div className="mt-6 animate-pulse space-y-4" aria-busy aria-label="Loading profile">
            <div className="h-64 rounded-2xl bg-[#E5E7EB]" />
            <div className="h-32 rounded-2xl bg-[#E5E7EB]/80" />
          </div>
        )}
      </CoachPageShell>
    );
  }

  const displayName = coachGreetingLabel(coach);
  const joinedLabel = coach.createdAt
    ? formatDisplayDate(coach.createdAt)
    : null;

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Profile"
        subtitle="How you look online, what you charge, and when you're free"
      />

      <div className="coach-card mt-6 p-5 sm:p-6">
        <div className="flex gap-4 sm:gap-6">
          <div className="shrink-0">
            <CoachProfilePhoto
              coachId={coachId}
              name={coach.name}
              defaultPhoto={coach.photo}
              size="hero"
              editable
            />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Public profile
            </p>
            <h2 className="font-heading mt-1 text-xl font-bold leading-tight text-[#111827] sm:text-2xl">
              {displayName}
            </h2>

            <div className="mt-3">
              {bio.trim() ? (
                <p className="text-sm leading-relaxed text-[#6B7280]">{bio.trim()}</p>
              ) : (
                <p className="text-sm leading-relaxed text-[#9CA3AF]">
                  Add a short bio for your public profile.
                </p>
              )}
              <button
                type="button"
                className="mt-2 inline-flex items-center text-sm font-semibold text-[#4F8FF7] hover:underline"
                onClick={() => setEditOpen(true)}
              >
                {bio.trim() ? "Edit bio" : "Add bio"}
              </button>
            </div>

            {joinedLabel ? (
              <p className="mt-4 text-xs text-[#9CA3AF]">Joined {joinedLabel}</p>
            ) : null}
          </div>
        </div>
      </div>

      <CoachPublicProfileLinkCard coach={coach} className="mt-4" />

      <CoachContactSocialsCard coachId={coachId} coach={coach} onSaved={refresh} />

      <CoachCourtsCard
        coachId={coachId}
        coach={coach}
        initialOpen={courtsOpen}
        onSaved={() => {
          invalidateCoachProfile(coachId);
          void refresh();
        }}
      />

      <button
        type="button"
        onClick={() => setSkillsOpen(true)}
        className="coach-card mt-4 flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
          <Zap className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold">Skills you score</p>
          <p className="text-sm text-[#6B7280]">
            {(() => {
              const count = resolveSkills({
                rubricId: coach.customSkillIds?.length ? "custom" : coach.skillTemplateId,
                customSkillIds: coach.customSkillIds,
                customSkills: coach.customSkills,
                skillLabelOverrides: coach.skillLabelOverrides,
              }).length;
              return coachHasCustomizedSessionSkills(coach)
                ? `${count} skills selected`
                : "Choose the skills you rate after sessions";
            })()}
          </p>
        </div>
        <span className="text-sm font-semibold text-[#4F8FF7]">
          {coachHasCustomizedSessionSkills(coach) ? "Edit" : "Set up"}
        </span>
      </button>

      <div className="coach-card mt-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold">Drop-in rates</p>
            <p className="text-sm text-[#6B7280]">
              Per person, by group size · {pricing.defaultDurationMinutes} min · {pricing.minimumPlayers}–{pricing.maximumPlayers} pax
            </p>
          </div>
          <button type="button" className="text-sm font-semibold text-[#4F8FF7]" onClick={() => setPricingOpen(true)}>
            Edit
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {pricing.tiers.map((tier) => (
            <li
              key={tier.id}
              className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2 text-sm"
            >
              <span className="text-[#374151]">{formatTierLabel(tier)}</span>
              <span className="font-semibold text-[#14532D]">{formatTierRate(tier)}</span>
            </li>
          ))}
        </ul>
      </div>

      <WorkingHoursCard />

      <CoachAchievementsCard />

      <div className="coach-card mt-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold">Player levels</p>
            <p className="text-sm text-[#6B7280]">
              {formatCoachingLevelsLabel(coachingLevels)}
            </p>
          </div>
          <button type="button" className="text-sm font-semibold text-[#4F8FF7]" onClick={() => setTemplateOpen(true)}>
            Change
          </button>
        </div>
      </div>

      <CoachBottomSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit bio"
        footer={
          <CoachSheetFooter>
            <CoachButton type="submit" form={EDIT_BIO_FORM_ID} loading={savingBio} loadingLabel="Saving…">
              Save bio
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <form
          id={EDIT_BIO_FORM_ID}
          className="coach-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setSavingBio(true);
            try {
              await updateCoachBioAction(coachId, bio);
              invalidateCoachProfile(coachId);
              await refresh();
              showToast("Bio updated!");
              setEditOpen(false);
            } catch (err) {
              showToast(err instanceof Error ? err.message : "Could not save bio", "error");
            } finally {
              setSavingBio(false);
            }
          }}
        >
          <CoachSheetField label="Bio" htmlFor="coach-bio">
            <textarea
              id="coach-bio"
              className="coach-input min-h-[120px] resize-none"
              placeholder="Tell students about your coaching style and experience"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </CoachSheetField>
          <button type="submit" form={EDIT_BIO_FORM_ID} className="hidden" />
        </form>
      </CoachBottomSheet>

      <CoachBottomSheet
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        title="Drop-in rates"
        subtitle="Per person. Programs use their own package price."
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="button"
              loading={savingPricing}
              loadingLabel="Saving…"
              onClick={async () => {
                setSavingPricing(true);
                try {
                  await updateCoachPricingAction(coachId, pricing);
                  invalidateCoachProfile(coachId);
                  await refresh();
                  showToast("Pricing saved!");
                  setPricingOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Could not save pricing", "error");
                } finally {
                  setSavingPricing(false);
                }
              }}
            >
              Save Pricing
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <PricingTiersEditor pricing={pricing} onChange={setPricing} />
      </CoachBottomSheet>

      <CoachBottomSheet
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title="Player levels"
        subtitle="Who you love coaching most"
        footer={
          <CoachSheetFooter>
            <CoachButton
              type="button"
              loading={savingTemplate}
              loadingLabel="Saving…"
              onClick={async () => {
                setSavingTemplate(true);
                try {
                  await updateCoachCoachingLevelsAction(coachId, coachingLevels);
                  invalidateCoachProfile(coachId);
                  await refresh();
                  showToast("Player levels saved!");
                  setTemplateOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Could not save player levels", "error");
                } finally {
                  setSavingTemplate(false);
                }
              }}
            >
              Save
            </CoachButton>
          </CoachSheetFooter>
        }
      >
        <CoachingLevelsPicker value={coachingLevels} onChange={setCoachingLevels} hint="" />
      </CoachBottomSheet>

      <DropInSkillsSheet
        open={skillsOpen}
        onClose={() => setSkillsOpen(false)}
        coach={coach}
        onSaved={() => {
          invalidateCoachProfile(coachId);
          void refresh();
        }}
      />
    </CoachPageShell>
  );
}
