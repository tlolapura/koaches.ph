import { dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { CoachPortalShell } from "@/components/koaches/coach/CoachPortalShell";
import { mapCoach, type DbCoach } from "@/lib/koaches/db/mappers";
import { getCachedProfile } from "@/lib/koaches/auth/cached";
import { isCoachRole } from "@/lib/koaches/auth/profile";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { getQueryClient } from "@/lib/koaches/queries/client";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Coach portal layout — keep this fast.
 * Middleware already validated auth and passes coach id via request headers.
 * We only fetch the coach row here for React Query hydration.
 */
export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  let coachId = h.get("x-koach-coach-id") ?? "";
  let email = h.get("x-koach-profile-email") ?? null;

  if (!coachId) {
    const profile = await getCachedProfile();
    if (isCoachRole(profile?.role) && profile?.coach_id) {
      coachId = profile.coach_id;
      email = profile.email ?? null;
    }
  }

  const queryClient = getQueryClient();

  if (coachId) {
    const supabase = createServiceClient();
    const { data } = await supabase.from("coaches").select("*").eq("id", coachId).single();
    if (data) {
      queryClient.setQueryData(
        [...coachKeys.all, "profile", coachId] as const,
        mapCoach(data as DbCoach)
      );
    }
  }

  return (
    <CoachPortalShell
      initialCoachId={coachId}
      initialEmail={email}
      dehydratedState={dehydrate(queryClient)}
    >
      {children}
    </CoachPortalShell>
  );
}
