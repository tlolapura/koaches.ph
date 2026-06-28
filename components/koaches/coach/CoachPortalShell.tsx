"use client";

import { usePathname } from "next/navigation";
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import { coachSlugFromPublicPath, isPublicCoachJoinPath } from "@/lib/koaches/coach-routes";
import { CoachBottomNav } from "@/components/koaches/coach/CoachBottomNav";
import { CoachMobileHeader } from "@/components/koaches/coach/CoachMobileHeader";
import { CoachSidebar, CoachSidebarCompact } from "@/components/koaches/coach/CoachSidebar";
import { CoachAuthProvider } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachToastProvider } from "@/components/koaches/coach/CoachUi";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CoachOnboardingGuard } from "@/components/koaches/coach/CoachOnboardingGuard";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";

type CoachPortalShellProps = {
  children: React.ReactNode;
  initialCoachId?: string;
  initialEmail?: string | null;
  dehydratedState?: DehydratedState;
};

export function CoachPortalShell({
  children,
  initialCoachId = "",
  initialEmail = null,
  dehydratedState,
}: CoachPortalShellProps) {
  return (
    <CoachAuthProvider initialCoachId={initialCoachId} initialEmail={initialEmail}>
      <QueryProvider>
        <HydrationBoundary state={dehydratedState}>
          <CoachPortalShellInner>{children}</CoachPortalShellInner>
        </HydrationBoundary>
      </QueryProvider>
    </CoachAuthProvider>
  );
}

function CoachPortalShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone =
    pathname.startsWith("/coach/login") ||
    pathname.startsWith("/coach/apply") ||
    pathname.startsWith("/coach/onboarding");
  const isPublicProfile = !!coachSlugFromPublicPath(pathname);
  const isPublicJoin = isPublicCoachJoinPath(pathname);

  if (isStandalone || isPublicProfile || isPublicJoin) {
    return <CoachToastProvider>{children}</CoachToastProvider>;
  }

  return (
    <CoachToastProvider>
      <CoachOnboardingGuard />
      <div className="coach-portal relative flex min-h-screen bg-[#FAFAF8]">
        <CoachSidebar />
        <CoachSidebarCompact />
        <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
          <PickleballBallBackdrop variant="portal" />
          <CoachMobileHeader />
          <main className="relative z-[1] flex-1 pb-20 md:pb-6">{children}</main>
          <CoachBottomNav />
        </div>
      </div>
    </CoachToastProvider>
  );
}
