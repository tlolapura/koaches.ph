import { AdminPortalShell } from "@/components/koaches/admin/AdminPortalShell";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}
