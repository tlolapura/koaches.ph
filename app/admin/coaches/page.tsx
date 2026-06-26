import { AdminCoachesClient } from "@/components/koaches/admin/AdminCoachesClient";
import { fetchPendingPaymentSubmissionsAction } from "@/lib/koaches/actions/admin-billing";
import { fetchCoachesAction } from "@/lib/koaches/actions/coaches";
import { fetchCourtsAction } from "@/lib/koaches/actions/courts";

export default async function AdminCoachesPage() {
  const [coaches, courts, pendingPayments] = await Promise.all([
    fetchCoachesAction(),
    fetchCourtsAction(),
    fetchPendingPaymentSubmissionsAction(),
  ]);

  return (
    <AdminCoachesClient coaches={coaches} courts={courts} pendingPayments={pendingPayments} />
  );
}
