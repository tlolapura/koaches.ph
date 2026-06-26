import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COACH_PORTAL_SEGMENTS } from "@/lib/koaches/coach-routes";
import { fetchCoachBySlugAction } from "@/lib/koaches/actions/coaches";
import { CoachJoinPage } from "@/components/koaches/public/CoachJoinPage";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ coachSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { coachSlug } = await params;
  const coach = await fetchCoachBySlugAction(coachSlug);
  if (!coach) return { title: "Join roster" };
  return {
    title: `Join ${coach.name}'s roster`,
    description: `Sign up for ${coach.name}'s coaching roster on KoachesPH.`,
  };
}

export default async function CoachJoinRoute({ params }: PageProps) {
  const { coachSlug } = await params;
  if (COACH_PORTAL_SEGMENTS.has(coachSlug)) notFound();

  const coach = await fetchCoachBySlugAction(coachSlug);
  if (!coach || !coach.isActive) notFound();

  return <CoachJoinPage coach={coach} />;
}
