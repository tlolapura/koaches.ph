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
import type { CoachAchievement, CoachProfile, Program, Session } from "@/lib/koaches/types";
import type { Court, Clinic } from "@/lib/koaches/types";
import { buildIntakePath } from "@/lib/koaches/coach-routes";
import { formatWorkingHoursSummary, type CoachWorkingHours } from "@/lib/koaches/coach-availability";
import { formatAchievementSubtitle } from "@/lib/koaches/coach-achievements";
import { formatTierLabel, formatTierRate } from "@/lib/koaches/pricing";
import { formatPublicCoachingFocus } from "@/lib/koaches/application-form";
import { formatProgramBundleSummary } from "@/lib/koaches/program-pricing";
import {
  clinicDateRangeLabel,
  formatClinicPriceSummary,
} from "@/lib/koaches/clinic-pricing";
import {
  displayFacebook,
  displayInstagram,
  facebookProfileUrl,
  instagramProfileUrl,
} from "@/lib/koaches/social-links";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { CoachProfilePhoto } from "@/components/koaches/coach/CoachProfilePhoto";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { CoachAchievementKindBadge } from "@/components/koaches/coach/CoachAchievementKindBadge";

type UpcomingClinic = Clinic & { sessions: Session[] };

type CoachPublicPageProps = {
  coach: CoachProfile;
  programs: Program[];
  courts: Court[];
  achievements: CoachAchievement[];
  workingHours: CoachWorkingHours;
  upcomingClinics?: UpcomingClinic[];
};

export function CoachPublicPage({
  coach,
  programs,
  courts,
  achievements,
  workingHours,
  upcomingClinics = [],
}: CoachPublicPageProps) {
  const router = useRouter();
  const pricing = coach.sessionPricing;
  const activePrograms = programs.filter((p) => p.isActive);
  const hasSocials = Boolean(coach.instagram || coach.facebook);
  const hasContact = Boolean(coach.mobile || hasSocials);
  const joinPath = buildIntakePath(coach.slug);
  const hoursSummary = formatWorkingHoursSummary(workingHours);
  const coachingFocus = formatPublicCoachingFocus(coach);

  useEffect(() => {
    if (window.location.hash === "#join") {
      router.replace(joinPath);
    }
  }, [joinPath, router]);

  return (
    <div className="coach-portal relative min-h-screen bg-white">
      <PickleballBallBackdrop variant="landing" />

      <header className="relative z-[1] border-b border-[#E5E7EB] bg-white/95 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <KoachesWordmark size="sm" />
          <Link href="/" className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]">
            Home
          </Link>
        </div>
      </header>

      <main className="relative z-[1] mx-auto max-w-3xl px-4 py-6 pb-12">
        <div className="coach-card overflow-hidden shadow-sm">
          <div className="bg-gradient-to-br from-[#F0FDF4] via-white to-[#EFF6FF] px-4 py-5 sm:px-6 sm:py-7">
            <div className="flex items-start gap-4 sm:gap-5">
              <CoachProfilePhoto
                coachId={coach.id}
                name={coach.name}
                defaultPhoto={coach.photo}
                size="public"
                className="shrink-0 shadow-[0_8px_28px_rgba(22,163,74,0.15)]"
              />
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="font-heading text-xl font-bold leading-tight text-[#111827] sm:text-2xl md:text-3xl">
                  {coach.name}
                </h1>
                {coach.bio ? (
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{coach.bio}</p>
                ) : null}
                {coach.specialization ? (
                  <p className="mt-1.5 text-sm font-semibold text-[#4F8FF7] sm:text-base">{coach.specialization}</p>
                ) : null}
              </div>
            </div>
          </div>

          {hasSocials ? (
            <div className="flex flex-wrap gap-2 border-t border-[#E5E7EB] px-5 py-4">
              {coach.instagram ? (
                <a
                  href={instagramProfileUrl(coach.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-[#BFDBFE] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]"
                >
                  <FacebookIcon className="h-3.5 w-3.5" />
                  {displayFacebook(coach.facebook)}
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-[#E5E7EB] p-5 sm:flex-row">
            {coach.mobile ? (
              <a href={`tel:${coach.mobile}`} className="coach-btn-primary flex-1 gap-2 py-3.5">
                <Phone className="h-4 w-4" />
                Contact coach
              </a>
            ) : null}
            <Link href={joinPath} className="coach-btn-outline flex-1 gap-2 py-3.5">
              <UserPlus className="h-4 w-4" />
              Already booked? Join roster
            </Link>
          </div>
        </div>
        <PublicSection icon={Target} title="Coaching focus">
          <div className="coach-card p-5">
            <p className="font-heading text-base font-semibold text-[#111827]">{coachingFocus.levelsLabel}</p>
            <p className="mt-1 text-sm text-[#9CA3AF]">{coachingFocus.duprRange} DUPR</p>
          </div>
        </PublicSection>

        {upcomingClinics.length > 0 ? (
          <PublicSection
            icon={Users}
            title="Upcoming clinics"
            subtitle="Group clinics · message the coach to join"
          >
            <div className="space-y-3">
              {upcomingClinics.map((clinic) => (
                <article key={clinic.id} className="coach-card overflow-hidden">
                  <div className="border-l-4 border-l-[#7C3AED] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-[#111827]">
                          {clinic.name}
                        </h3>
                        {clinic.focus ? (
                          <p className="mt-1 text-sm font-medium text-[#7C3AED]">{clinic.focus}</p>
                        ) : null}
                        {clinic.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                            {clinic.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-right font-heading text-sm font-bold text-[#5B21B6]">
                        {formatClinicPriceSummary(clinic)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                        <Calendar className="h-3 w-3" />
                        {clinicDateRangeLabel(clinic.sessions)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EDE9FE] px-2.5 py-1 text-xs font-medium text-[#5B21B6]">
                        {clinic.enrolledStudentIds.length}/{clinic.capacity} spots
                      </span>
                    </div>
                    {coach.mobile ? (
                      <a
                        href={`tel:${coach.mobile}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#7C3AED] hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Message coach to join
                      </a>
                    ) : (
                      <p className="mt-4 text-sm font-medium text-[#6B7280]">
                        Message coach to join
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </PublicSection>
        ) : null}

        {activePrograms.length > 0 ? (
          <PublicSection icon={BookOpen} title="Programs" subtitle="Structured coaching bundles · price per person">
            <div className="space-y-3">
              {activePrograms.map((program) => (
                <article key={program.id} className="coach-card overflow-hidden">
                  <div className="border-l-4 border-l-[#4F8FF7] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-heading text-lg font-semibold text-[#111827]">{program.name}</h3>
                        {program.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{program.description}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-right font-heading text-sm font-bold text-[#1D4ED8]">
                        {formatProgramBundleSummary(program)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
                        <Calendar className="h-3 w-3" />
                        {program.sessionCount} sessions
                      </span>
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
                <span className="font-heading font-bold text-[#1D4ED8]">{formatTierRate(tier)}</span>
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
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
                    <MapPin className="h-5 w-5 text-[#1D4ED8]" />
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
                        className="mt-2 inline-block text-xs font-semibold text-[#4F8FF7] hover:underline"
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
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#4F8FF7]" strokeWidth={2} />
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
                      className="flex items-center gap-3 font-medium text-[#374151] hover:text-[#4F8FF7]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                        <Phone className="h-4 w-4 text-[#1D4ED8]" />
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
                      className="flex items-center gap-3 font-medium text-[#374151] hover:text-[#4F8FF7]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                        <InstagramIcon className="text-[#1D4ED8]" />
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
                      className="flex items-center gap-3 font-medium text-[#374151] hover:text-[#4F8FF7]"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                        <FacebookIcon className="text-[#1D4ED8]" />
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
    <section className="mt-8 first:mt-8">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5EFE8]">
          <Icon className="h-5 w-5 text-[#3D5C47]" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-[#111827]">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 hidden text-sm text-[#6B7280] md:block">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
