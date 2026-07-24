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
        subtitle="Confirm coach subscription receipts"
        className="mb-6"
      />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-white p-4 ring-1 ring-[#FED7AA]/80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9A3412]/70">
            Awaiting review
          </p>
          <p className="font-heading mt-1 text-2xl font-bold text-[#9A3412]">{pending}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-4 ring-1 ring-[#BBF7D0]/80">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#166534]/70">
            On approve
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-[#14532D]">
            Marks paid + extends 1 month
          </p>
        </div>
      </div>

      <AdminPendingPayments
        initialPayments={initialPayments}
        emptyMessage="No payment receipts waiting for review."
      />
    </AdminPageShell>
  );
}
