import { fetchAdminActivityAction } from "@/lib/koaches/actions/admin-activity";
import { AdminActivityPage } from "@/components/koaches/admin/AdminActivityPage";

export default async function AdminSessionsRoute() {
  const data = await fetchAdminActivityAction();
  return <AdminActivityPage data={data} />;
}
