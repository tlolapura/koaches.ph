"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/koaches/shared/SocialIcons";
import type { CoachAchievement, CoachProfile, Program } from "@/lib/koaches/types";
import type { Court } from "@/lib/koaches/types";
import { buildIntakePath } from "@/lib/koaches/coach-routes";
import { formatWorkingHoursSummary, type CoachWorkingHours } from "@/lib/koaches/coach-availability";
import { formatAchievementSubtitle } from "@/lib/koaches/coach-achievements";
import { formatPricingSummary, formatTierLabel, formatTierRate, getStartingRate } from "@/lib/koaches/pricing";
import { formatProgramBundleSummary } from "@/lib/koaches/program-pricing";
import { SKILL_RUBRICS } from "@/lib/koaches/program-templates";
import {
  displayFacebook,
  displayInstagram,
  facebookProfileUrl,
  instagramProfileUrl,
} from "@/lib/koaches/social-links";
import { KoachesMark } from "@/components/koaches/KoachesLogo";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { CoachAchievementKindBadge } from "@/components/koaches/coach/CoachAchievementKindBadge";
import { formatCurrency } from "@/lib/utils";

type CoachPublicPageProps = {
  coach: CoachProfile;
  programs: Program[];
  courts: Court[];
  achievements: CoachAchievement[];
  workingHours: CoachWorkingHours;
};

export function CoachPublicPage({
  coach,
  programs,
  courts,
  achievements,
  workingHours,
}: CoachPublicPageProps) {
  const router = useRouter();
  const pricing = coach.sessionPricing;
  const activePrograms = programs.filter((p) => p.isActive);
  const hasSocials = Boolean(coach.instagram || coach.facebook);
  const hasContact = Boolean(coach.mobile || hasSocials);
  const joinPath = buildIntakePath(coach.slug);
  const hoursSummary = formatWorkingHoursSummary(workingHours);
  const startingRate = getStartingRate(pricing);

  const rubric =
    coach.skillTemplateId !== "custom"
      ? SKILL_RUBRICS[coach.skillTemplateId as keyof typeof SKILL_RUBRICS]
      : null;

  useEffect(() => {
    if (window.location.hash === "#join") {
      router.replace(joinPath);
    }
  }, [joinPath, router]);

  return (
    <div className="coach-portal min-h-screen bg-[#FAFAF8]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#243f66] to-[#152a45] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 39px, #fff 39px, #fff 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #fff 39px, #fff 40px)",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#E07A5F]/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#FDE047]/10 blur-3xl" aria-hidden />

        <header className="relative mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-white/70 hover:text-white">
            Koaches
          </Link>
          <KoachesMark size="sm" light />
        </header>

        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-2">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
            <CoachProfilePhoto
              coachId={coach.id}
              name={coach.name}
              defaultPhoto={coach.photo}
              size="xl"
              className="shrink-0 ring-4 ring-white/25 shadow-2xl"
            />
            <div className="mt-5 min-w-0 sm:mt-0 sm:pb-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FDE047]">Pickleball coach</p>
              <h1 className="font-heading mt-2 text-3xl font-bold leading-tight sm:text-4xl">{coach.name}</h1>
              {coach.specialization ? (
                <p className="mt-2 text-base font-medium text-[#FDE047]/90">{coach.specialization}</p>
              ) : null}
              {coach.bio ? (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">{coach.bio}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            <StatCard label="Students" value={String(coach.totalStudents)} />
            <StatCard label="Sessions" value={String(coach.totalSessions)} />
            <StatCard label="Drop-in from" value={formatCurrency(startingRate)} />
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {formatPricingSummary(pricing)}
            </span>
            {coach.freeTrialEnabled ? (
              <span className="rounded-full bg-[#E5EFE8] px-3 py-1 text-xs font-semibold text-[#3D5C47]">
                Free trial available
              </span>
            ) : null}
            {hoursSummary ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
                <Clock className="h-3 w-3" />
                {hoursSummary}
              </span>
            ) : null}
          </div>

          {hasSocials ? (
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {coach.instagram ? (
                <a
                  href={instagramProfileUrl(coach.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <InstagramIcon className="h-3.5 w-3.5" />
                  {displayInstagram(coach.instagram)}
                </a>
              ) : null}
              {coach.facebook ? (
                <a
                  href={facebookProfileUrl(coach.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <FacebookIcon className="h-3.5 w-3.5" />
                  {displayFacebook(coach.facebook)}
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {coach.mobile ? (
              <a
                href={`tel:${coach.mobile}`}
                className="coach-btn-primary gap-2 py-3.5 shadow-lg shadow-[#E07A5F]/25"
              >
                <Phone className="h-4 w-4" />
                Contact coach
              </a>
            ) : null}
            <Link
              href={joinPath}
              className="coach-btn-outline gap-2 border-white/30 bg-white/10 py-3.5 text-white hover:bg-white/20"
            >
              <UserPlus className="h-4 w-4" />
              Already booked? Join roster
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-8 pb-28 md:pb-12">
        {rubric ? (
          <PublicSection
            icon={Target}
            title="Coaching focus"
            subtitle={`${rubric.name} players · ${rubric.duprRange} DUPR`}
          >
            <div className="coach-card border-l-4 border-l-[#E07A5F] p-5">
              <p className="font-heading text-base font-semibold text-[#111827]">{rubric.name} rubric</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{rubric.description}</p>
              <p className="mt-3 text-xs font-medium text-[#9CA3AF]">{rubric.subtitle}</p>
            </div>
          </PublicSection>
        ) : null}

        {activePrograms.length > 0 ? (
          <PublicSection icon={BookOpen} title="Programs" subtitle="Structured coaching bundles · price per person">
            <div className="space-y-3">
              {activePrograms.map((program) => (
                <article key={program.id} className="coach-card overflow-hidden">
                  <div className="border-l-4 border-l-[#1E3A5F] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-[#111827]">{program.name}</h3>
                        {program.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{program.description}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-right font-heading text-sm font-bold text-[#1E3A5F]">
                        {formatProgramBundleSummary(program)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                        <Calendar className="h-3 w-3" />
                        {program.sessionCount} sessions
                      </span>
                      {program.targetLevel ? (
                        <span className="rounded-full bg-[#FDEEE9] px-2.5 py-1 text-xs font-semibold text-[#8B4D3A]">
                          {program.targetLevel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </PublicSection>
        ) : null}

        <PublicSection
          icon={Sparkles}
          title="Drop-in rates"
          subtitle={`${pricing.defaultDurationMinutes} min sessions · ${pricing.minimumPlayers}–${pricing.maximumPlayers} players`}
        >
          <ul className="coach-card divide-y divide-[#E5E7EB] overflow-hidden">
            {pricing.tiers.map((tier) => (
              <li key={tier.id} className="flex items-center justify-between px-5 py-4 text-sm">
                <span className="font-medium text-[#374151]">{formatTierLabel(tier)}</span>
                <span className="font-heading font-bold text-[#1E3A5F]">{formatTierRate(tier)}</span>
              </li>
            ))}
          </ul>
        </PublicSection>

        <PublicSection icon={Clock} title="Typical hours" subtitle="When this coach is usually available">
          <div className="coach-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5EFE8]">
              <Clock className="h-6 w-6 text-[#3D5C47]" />
            </div>
            <div>
              <p className="font-heading font-semibold text-[#111827]">{hoursSummary}</p>
              <p className="mt-1 text-sm text-[#6B7280]">Message the coach to confirm a specific slot.</p>
            </div>
          </div>
        </PublicSection>

        {courts.length > 0 ? (
          <PublicSection icon={MapPin} title="Where I coach" subtitle="Courts and locations">
            <ul className="space-y-3">
              {courts.map((court) => (
                <li key={court.id} className="coach-card flex gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEEE9]">
                    <MapPin className="h-5 w-5 text-[#8B4D3A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-semibold text-[#111827]">{court.name}</p>
                    <p className="mt-0.5 text-sm text-[#6B7280]">
                      {[court.address, court.city, court.region].filter(Boolean).join(" · ")}
                    </p>
                    {court.mapsUrl ? (
                      <a
                        href={court.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs font-semibold text-[#E07A5F] hover:underline"
                      >
                        Open in Maps →
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </PublicSection>
        ) : null}

        {achievements.length > 0 ? (
          <PublicSection
            icon={Award}
            title="Achievements & credentials"
            subtitle="Certifications, tournaments, and competitive experience"
          >
            <ul className="space-y-2">
              {achievements.map((achievement) => (
                <li key={achievement.id} className="coach-card flex items-start gap-3 p-4">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#E07A5F]" strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading text-sm font-semibold text-[#111827]">{achievement.title}</p>
                      <CoachAchievementKindBadge kind={achievement.kind} />
                    </div>
                    {formatAchievementSubtitle(achievement) ? (
                      <p className="mt-0.5 text-xs text-[#6B7280]">{formatAchievementSubtitle(achievement)}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </PublicSection>
        ) : null}

        {hasContact ? (
          <PublicSection icon={Users} title="Get in touch" subtitle="Reach out to book or ask questions">
            <div className="coach-card p-5">
              <ul className="space-y-3 text-sm">
                {coach.mobile ? (
                  <li>
                    <a
                      href={`tel:${coach.mobile}`}
                      className="flex items-center gap-3 font-medium text-[#374151] hover:text-[#E07A5F]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEEE9]">
                        <Phone className="h-4 w-4 text-[#8B4D3A]" />
                      </span>
                      {coach.mobile}
                    </a>
                  </li>
                ) : null}
                {coach.instagram ? (
                  <li>
                    <a
                      href={instagramProfileUrl(coach.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 font-medium text-[#374151] hover:text-[#E07A5F]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEEE9]">
                        <InstagramIcon className="text-[#8B4D3A]" />
                      </span>
                      {displayInstagram(coach.instagram)}
                    </a>
                  </li>
                ) : null}
                {coach.facebook ? (
                  <li>
                    <a
                      href={facebookProfileUrl(coach.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 font-medium text-[#374151] hover:text-[#E07A5F]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEEE9]">
                        <FacebookIcon className="text-[#8B4D3A]" />
                      </span>
                      {displayFacebook(coach.facebook)}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </PublicSection>
        ) : null}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E5E7EB] bg-white/95 p-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link href={joinPath} className="coach-btn-primary flex-1 gap-2 py-3 text-sm">
            <UserPlus className="h-4 w-4" />
            Join roster
          </Link>
          {coach.mobile ? (
            <a href={`tel:${coach.mobile}`} className="coach-btn-outline shrink-0 px-4 py-3">
              <Phone className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{label}</p>
      <p className="font-heading mt-0.5 text-sm font-bold text-white sm:text-base">{value}</p>
    </div>
  );
}

function PublicSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5EFE8]">
          <Icon className="h-5 w-5 text-[#3D5C47]" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-[#111827]">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
