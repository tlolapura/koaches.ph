import { redirect } from "next/navigation";
import { RESERVED_SLUGS } from "@/lib/koaches/constants";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { fetchCoachBySlugAction } from "@/lib/koaches/actions/coaches";

export const dynamic = "force-dynamic";

export default async function LegacyCoachSlugPage({
  params,
}: {
  params: Promise<{ coachSlug: string }>;
}) {
  const { coachSlug } = await params;
  if (RESERVED_SLUGS.has(coachSlug)) redirect("/");

  const coach = await fetchCoachBySlugAction(coachSlug);
  if (!coach) redirect("/");

  redirect(buildPublicCoachPath(coach.slug));
}
