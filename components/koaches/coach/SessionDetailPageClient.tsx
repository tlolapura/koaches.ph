"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import Link from "next/link";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { SessionDetailView } from "@/components/koaches/coach/SessionDetailView";
import { CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachDetailSkeleton } from "@/components/koaches/coach/CoachSkeletons";

type SessionDetailPageClientProps = {
  sessionId: string;
};

export function SessionDetailPageClient({ sessionId }: SessionDetailPageClientProps) {
  const coachId = usePortalCoachId();
  const { sessions, loading } = useCoachSessions(coachId);
  const session = sessions.find((s) => s.id === sessionId);

  if (loading) return <CoachDetailSkeleton />;

  if (!session) {
    return (
      <CoachPageShell className="py-12 text-center">
        <p className="font-heading text-5xl font-bold text-[#4F8FF7]">404</p>
        <p className="font-heading mt-3 text-lg font-semibold text-[#111827]">Session not found</p>
        <p className="mt-2 text-sm text-[#6B7280]">It may have been removed or the link is incorrect.</p>
        <Link href="/coach/sessions" className="coach-btn-secondary mt-6 inline-flex">
          Back to schedule
        </Link>
      </CoachPageShell>
    );
  }

  return <SessionDetailView session={session} />;
}
