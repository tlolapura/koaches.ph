import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCoachBySlugAction } from "@/lib/koaches/actions/coaches";
import { fetchCourtsForCoachAction } from "@/lib/koaches/actions/courts";
import { fetchProgramsAction } from "@/lib/koaches/actions/programs";
import { fetchCoachAchievementsAction } from "@/lib/koaches/actions/achievements";
import { fetchCoachAvailabilityAction } from "@/lib/koaches/actions/availability";
import { CoachPublicPage } from "@/components/koaches/public/CoachPublicPage";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ coachSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { coachSlug } = await params;
  const coach = await fetchCoachBySlugAction(coachSlug);
  if (!coach) return { title: "Coach not found" };
  return {
    title: coach.name,
    description: coach.bio,
  };
}

export default async function CoachPublicProfilePage({ params }: PageProps) {
  const { coachSlug } = await params;
  const coach = await fetchCoachBySlugAction(coachSlug);
  if (!coach || !coach.isActive) notFound();

  const [programs, courts, achievements, availability] = await Promise.all([
    fetchProgramsAction(coach.id),
    fetchCourtsForCoachAction(coach.id),
    fetchCoachAchievementsAction(coach.id),
    fetchCoachAvailabilityAction(coach.id),
  ]);

  return (
    <CoachPublicPage
      coach={coach}
      programs={programs}
      courts={courts}
      achievements={achievements}
      workingHours={availability.workingHours}
    />
  );
}
