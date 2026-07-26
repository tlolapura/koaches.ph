import { fetchAllCourtsAdminAction, fetchPendingCourtRequestsAdminAction } from "@/lib/koaches/actions/courts";
import { AdminCourtsClient } from "@/components/koaches/admin/AdminCourtsClient";

export default async function AdminCourtsPage() {
  const [courts, pendingRequests] = await Promise.all([
    fetchAllCourtsAdminAction(),
    fetchPendingCourtRequestsAdminAction(),
  ]);
  return <AdminCourtsClient initialCourts={courts} initialRequests={pendingRequests} />;
}
