"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminBottomNav } from "@/components/koaches/admin/AdminBottomNav";
import { AdminHeader } from "@/components/koaches/admin/AdminHeader";
import { AdminSidebar, AdminSidebarCompact } from "@/components/koaches/admin/AdminSidebar";

export function AdminPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    const authed = localStorage.getItem("koaches-admin-auth");
    if (!authed) router.replace("/admin/login");
  }, [isLogin, router]);

  if (isLogin) {
    return (
      <div className="coach-portal flex h-dvh max-h-dvh w-full overflow-hidden bg-[#FAFAF8]">
        {children}
      </div>
    );
  }

  return (
    <div className="coach-portal flex min-h-screen bg-[#FAFAF8]">
      <AdminSidebar />
      <AdminSidebarCompact />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader pathname={pathname} />
        <main className="flex-1 pb-20 md:pb-6">{children}</main>
        <AdminBottomNav />
      </div>
    </div>
  );
}
