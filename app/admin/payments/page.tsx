import { AdminPaymentsClient } from "@/components/koaches/admin/AdminPaymentsClient";
import { fetchPendingPaymentSubmissionsAction } from "@/lib/koaches/actions/admin-billing";

export default async function AdminPaymentsPage() {
  const pendingPayments = await fetchPendingPaymentSubmissionsAction();
  return <AdminPaymentsClient initialPayments={pendingPayments} />;
}
