"use client";

import { usePathname } from "next/navigation";
import { AdminBottomNav } from "@/components/koaches/admin/AdminBottomNav";
import { AdminHeader } from "@/components/koaches/admin/AdminHeader";
import { AdminSidebar, AdminSidebarCompact } from "@/components/koaches/admin/AdminSidebar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  if (isLogin) {
    return (
      <div className="coach-portal relative flex h-dvh max-h-dvh w-full overflow-hidden bg-[#FAFAF8]">
        <PickleballBallBackdrop variant="login" />
        <div className="relative z-[1] h-full w-full">{children}</div>
      </div>
    );
  }

  return (
    <div className="coach-portal admin-portal relative flex min-h-screen bg-[#FAFAF8]">
      <AdminSidebar />
      <AdminSidebarCompact />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        <PickleballBallBackdrop variant="portal" />
        <AdminHeader pathname={pathname} />
        <main className="relative z-[1] flex-1 pb-20 md:pb-6">{children}</main>
        <AdminBottomNav />
      </div>
    </div>
  );
}
