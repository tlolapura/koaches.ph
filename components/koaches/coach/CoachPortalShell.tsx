"use client";

import { usePathname } from "next/navigation";
import { coachSlugFromPublicPath, isPublicCoachJoinPath } from "@/lib/koaches/coach-routes";
import { CoachBottomNav } from "@/components/koaches/coach/CoachBottomNav";
import { CoachMobileHeader } from "@/components/koaches/coach/CoachMobileHeader";
import { CoachSidebar, CoachSidebarCompact } from "@/components/koaches/coach/CoachSidebar";
import { CoachAuthProvider } from "@/components/koaches/coach/CoachAuthProvider";
import { CoachToastProvider } from "@/components/koaches/coach/CoachUi";
import { QueryProvider } from "@/components/providers/QueryProvider";

export function CoachPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <CoachAuthProvider>
      <QueryProvider>
        <CoachPortalShellInner>{children}</CoachPortalShellInner>
      </QueryProvider>
    </CoachAuthProvider>
  );
}

function CoachPortalShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone =
    pathname.startsWith("/coach/login") || pathname.startsWith("/coach/apply");
  // Path shape only — the page itself fetches the coach and calls notFound() if missing.
  const isPublicProfile = !!coachSlugFromPublicPath(pathname);
  const isPublicJoin = isPublicCoachJoinPath(pathname);

  if (isStandalone || isPublicProfile || isPublicJoin) {
    return <CoachToastProvider>{children}</CoachToastProvider>;
  }

  return (
    <CoachToastProvider>
      <div className="coach-portal flex min-h-screen bg-[#FAFAF8]">
        <CoachSidebar />
        <CoachSidebarCompact />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <CoachMobileHeader />
          <main className="flex-1 pb-20 md:pb-6">{children}</main>
          <CoachBottomNav />
        </div>
      </div>
    </CoachToastProvider>
  );
}
