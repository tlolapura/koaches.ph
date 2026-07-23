import { dehydrate } from "@tanstack/react-query";
import { headers } from "next/headers";
import { CoachPortalShell } from "@/components/koaches/coach/CoachPortalShell";
import { getCachedProfile } from "@/lib/koaches/auth/cached";
import { isCoachRole } from "@/lib/koaches/auth/profile";
import { loadCoachPortalBootstrap } from "@/lib/koaches/coach-portal-bootstrap";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { getQueryClient } from "@/lib/koaches/queries/client";

/**
 * Coach portal layout — keep this fast.
 * Middleware already validated auth and passes coach id via request headers.
 * Bootstrap hydrates coach + lean sessions + progress cards in one round trip.
 */
export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const middlewareCoachId = h.get("x-koach-coach-id") ?? "";
  let coachId = middlewareCoachId;
  let email = h.get("x-koach-profile-email") ?? null;

  if (!coachId) {
    const profile = await getCachedProfile();
    if (isCoachRole(profile?.role) && profile?.coach_id) {
      coachId = profile.coach_id;
      email = profile.email ?? null;
    }
  }

  const queryClient = getQueryClient();

  // Only bootstrap on authenticated portal navigations (middleware set the header).
  // Skip for public /coach/[slug] so listings stay fast.
  if (middlewareCoachId) {
    try {
      const bootstrap = await loadCoachPortalBootstrap(middlewareCoachId);
      queryClient.setQueryData(
        [...coachKeys.all, "profile", middlewareCoachId] as const,
        bootstrap.coach
      );
      queryClient.setQueryData(coachKeys.sessions(middlewareCoachId), bootstrap.sessions);
      queryClient.setQueryData(
        [...coachKeys.all, "progress-cards", middlewareCoachId] as const,
        bootstrap.progressCards
      );
    } catch {
      /* ignore bootstrap failures — client hooks will fetch */
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
