"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminBottomNav } from "@/components/koaches/admin/AdminBottomNav";
import { AdminHeader } from "@/components/koaches/admin/AdminHeader";
import { AdminSidebar, AdminSidebarCompact } from "@/components/koaches/admin/AdminSidebar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { QueryProvider } from "@/components/providers/QueryProvider";

export function AdminPortalShell({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AdminPortalShellInner>{children}</AdminPortalShellInner>
    </QueryProvider>
  );
}

function AdminPortalShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin || isSupabaseConfigured()) return;
    const authed = localStorage.getItem("koaches-admin-auth");
    if (!authed) router.replace("/admin/login");
  }, [isLogin, router]);

  // Login owns its own full-screen chrome (matches coach login).
  if (isLogin) {
    return <Suspense fallback={null}>{children}</Suspense>;
  }

  return (
    <div className="coach-portal admin-portal relative flex min-h-screen bg-[#FAFAF8]">
      <AdminSidebar />
      <AdminSidebarCompact />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <PickleballBallBackdrop variant="portal" />
        <AdminHeader pathname={pathname} />
        <main className="relative z-[1] flex-1 pb-[var(--portal-bottom-nav-offset)] md:pb-6">{children}</main>
        <AdminBottomNav />
      </div>
    </div>
  );
}
