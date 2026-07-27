"use client";

import { AdminPendingPayments } from "@/components/koaches/admin/AdminPendingPayments";
import { AdminPageHeader, AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import type { AdminPendingPayment } from "@/lib/koaches/actions/admin-billing";

type AdminPaymentsClientProps = {
  initialPayments: AdminPendingPayment[];
};

export function AdminPaymentsClient({ initialPayments }: AdminPaymentsClientProps) {
  const pending = initialPayments.length;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Payments"
        subtitle={pending > 0 ? `${pending} pending` : "No pending receipts"}
        className="mb-6"
      />

      <AdminPendingPayments
        initialPayments={initialPayments}
        emptyMessage="No pending receipts."
      />
    </AdminPageShell>
  );
}
