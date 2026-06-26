import { fetchAllCourtsAdminAction } from "@/lib/koaches/actions/courts";
import { AdminCourtsClient } from "@/components/koaches/admin/AdminCourtsClient";

export default async function AdminCourtsPage() {
  const courts = await fetchAllCourtsAdminAction();
  return <AdminCourtsClient initialCourts={courts} />;
}
