import { redirect } from "next/navigation";
import { RESERVED_SLUGS } from "@/lib/koaches/constants";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { getCachedPublicCoachBySlug } from "@/lib/koaches/public-coach";

export const revalidate = 60;

export default async function LegacyCoachSlugPage({
  params,
}: {
  params: Promise<{ coachSlug: string }>;
}) {
  const { coachSlug } = await params;
  if (RESERVED_SLUGS.has(coachSlug)) redirect("/");

  const coach = await getCachedPublicCoachBySlug(coachSlug);
  if (!coach) redirect("/");

  redirect(buildPublicCoachPath(coach.slug));
}
