import { redirect } from "next/navigation";
import { buildJoinPath } from "@/lib/koaches/coach-routes";
import { fetchCoachBySlugAction } from "@/lib/koaches/actions/coaches";

export const dynamic = "force-dynamic";

type JoinPageProps = {
  params: Promise<{ coachSlug: string }>;
};

/** Legacy `/join/[slug]` → dedicated join page */
export default async function JoinPage({ params }: JoinPageProps) {
  const { coachSlug } = await params;
  const coach = await fetchCoachBySlugAction(coachSlug);
  if (!coach) redirect("/coaches");
  redirect(buildJoinPath(coach.slug));
}
