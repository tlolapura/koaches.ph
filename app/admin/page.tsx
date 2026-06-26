import { fetchAdminDashboardAction } from "@/lib/koaches/actions/admin";
import { AdminDashboard } from "@/components/koaches/admin/AdminDashboard";

export default async function AdminPage() {
  const data = await fetchAdminDashboardAction();
  return <AdminDashboard data={data} />;
}
