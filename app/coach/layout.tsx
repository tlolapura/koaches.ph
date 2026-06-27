import { dehydrate } from "@tanstack/react-query";
import { CoachPortalShell } from "@/components/koaches/coach/CoachPortalShell";
import { coachPortalBootstrapAction } from "@/lib/koaches/actions/coach-bootstrap";
import { fetchProgramsAction } from "@/lib/koaches/actions/programs";
import { fetchStudentsAction } from "@/lib/koaches/actions/students";
import { getCachedProfile } from "@/lib/koaches/auth/cached";
import { isCoachRole } from "@/lib/koaches/auth/profile";
import { coachKeys } from "@/lib/koaches/queries/keys";
import { getQueryClient } from "@/lib/koaches/queries/client";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCachedProfile();
  const coachId = isCoachRole(profile?.role) ? profile?.coach_id ?? "" : "";
  const queryClient = getQueryClient();

  if (coachId) {
    try {
      const [bootstrap, programs, students] = await Promise.all([
        coachPortalBootstrapAction(coachId),
        fetchProgramsAction(coachId),
        fetchStudentsAction(coachId, true),
      ]);
      queryClient.setQueryData([...coachKeys.all, "profile", coachId] as const, bootstrap.coach);
      queryClient.setQueryData(coachKeys.sessions(coachId), bootstrap.sessions);
      queryClient.setQueryData(coachKeys.programs(coachId), programs);
      queryClient.setQueryData(coachKeys.students(coachId, true), students);
    } catch {
      // Client hooks refetch if bootstrap fails.
    }
  }

  return (
    <CoachPortalShell
      initialCoachId={coachId}
      initialEmail={profile?.email ?? null}
      dehydratedState={dehydrate(queryClient)}
    >
      {children}
    </CoachPortalShell>
  );
}
