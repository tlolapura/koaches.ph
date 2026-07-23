import { redirect } from "next/navigation";
import { buildJoinPath } from "@/lib/koaches/coach-routes";
import { getCachedPublicCoachBySlug } from "@/lib/koaches/public-coach";

export const revalidate = 60;

type JoinPageProps = {
  params: Promise<{ coachSlug: string }>;
};

/** Legacy `/join/[slug]` → dedicated join page */
export default async function JoinPage({ params }: JoinPageProps) {
  const { coachSlug } = await params;
  const coach = await getCachedPublicCoachBySlug(coachSlug);
  if (!coach) redirect("/coaches");
  redirect(buildJoinPath(coach.slug));
}
