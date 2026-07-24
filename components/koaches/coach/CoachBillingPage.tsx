"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Upload,
} from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { ReceiptPreviewModal } from "@/components/koaches/admin/ReceiptPreviewModal";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { CoachBillingSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import {
  fetchCoachBillingDashboardAction,
  getCoachReceiptSignedUrlAction,
  submitCoachPaymentReceiptAction,
} from "@/lib/koaches/actions/billing";
import { getCoachBillingMessage } from "@/lib/koaches/billing-invoices";
import {
  KOACHES_PAYMENT_CHANNELS,
  paymentMethodLabel,
  type PaymentChannelId,
} from "@/lib/koaches/billing-constants";
import {
  billingNeedsPayment,
  BILLING_STATUS_STYLES,
  SUBSCRIPTION_PAYMENT_GRACE_DAYS,
} from "@/lib/koaches/subscription-billing";
import type { CoachBillingDashboard } from "@/lib/koaches/types";
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils";

function invoiceStatusLabel(status: string) {
  switch (status) {
    case "issued":
      return "Awaiting payment";
    case "payment_submitted":
      return "Receipt under review";
    case "paid":
      return "Paid";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
}

function submissionStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Under review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

export function CoachBillingPage() {
  const coachId = usePortalCoachId();
  const searchParams = useSearchParams();
  const isRestricted = searchParams.get("restricted") === "1";
  const { showToast } = useCoachToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<CoachBillingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentChannelId>("gcash");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!coachId) return;
    setLoading(true);
    try {
      const next = await fetchCoachBillingDashboardAction(coachId);
      setData(next);
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachId || !data?.currentInvoice || !fileRef.current?.files?.[0]) {
      setError("Please attach your payment receipt.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set("method", method);
    formData.set("receipt", fileRef.current.files[0]);
    const result = await submitCoachPaymentReceiptAction(
      coachId,
      data.currentInvoice.id,
      formData
    );
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Receipt submitted. We'll confirm once reviewed.");
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
    void load();
  };

  const fetchPreviewUrl = useCallback(async () => {
    if (!coachId || !previewPath) return null;
    return getCoachReceiptSignedUrlAction(coachId, previewPath);
  }, [coachId, previewPath]);

  if (!coachId) {
    return <CoachBillingSkeleton />;
  }

  const backToSettings = (
    <Link
      href="/coach/settings"
      className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E5E7EB] px-3 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
    >
      Back to settings
    </Link>
  );

  if (loading || !data) {
    return (
      <CoachPageShell className="pb-8">
        <CoachPageHeader
          title="Billing"
          subtitle="Your plan and payment history"
          actions={backToSettings}
        />
        <div className="mt-6 animate-pulse space-y-4" aria-busy aria-label="Loading billing">
          <div className="h-24 rounded-2xl bg-[#E5E7EB]" />
          <div className="h-40 rounded-2xl bg-[#E5E7EB]/80" />
        </div>
      </CoachPageShell>
    );
  }

  const { billing, currentInvoice, pendingSubmission } = data;
  const styles = BILLING_STATUS_STYLES[billing.status];
  const needsPayment = billingNeedsPayment(billing.status);
  const selectedChannel =
    KOACHES_PAYMENT_CHANNELS.find((c) => c.id === method) ?? KOACHES_PAYMENT_CHANNELS[0];
  const canUpload =
    Boolean(currentInvoice) &&
    currentInvoice?.status !== "paid" &&
    !pendingSubmission &&
    needsPayment;

  // Show QR whenever payment is needed OR coach opened billing while restricted.
  // Also show if there's an unpaid invoice (covers edge statuses).
  const showPayUi =
    needsPayment ||
    isRestricted ||
    (Boolean(currentInvoice) && currentInvoice?.status !== "paid");

  return (
    <CoachPageShell className="pb-8">
      <CoachPageHeader
        title="Billing"
        subtitle={showPayUi ? "Pay your invoice to keep coaching" : "Your plan and payment history"}
        actions={backToSettings}
      />

      {(isRestricted || billing.status === "lapsed") && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-heading font-semibold">Account access limited</p>
            <p className="mt-1 leading-relaxed">
              Pay the invoice below and upload your receipt. After we confirm, full access is restored.
              Unpaid accounts lock {SUBSCRIPTION_PAYMENT_GRACE_DAYS} days after the due date.
            </p>
          </div>
        </div>
      )}

      <div className={cn("mt-6 rounded-xl px-4 py-3 text-sm", styles.panel)}>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", styles.badge)}>
            {billing.label}
          </span>
          <span className="text-xs font-medium opacity-80">
            {billing.planLabel} · {formatCurrency(billing.amount)}/mo
          </span>
        </div>
        <p className="mt-2 leading-relaxed">{getCoachBillingMessage(billing)}</p>
      </div>

      {billing.renewalDate && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {billing.invoiceByDate && (
            <div className="coach-card p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                <FileText className="h-4 w-4" />
                Invoice opens
              </div>
              <p className="font-heading mt-2 font-semibold text-[#111827]">
                {formatDisplayDate(billing.invoiceByDate)}
              </p>
            </div>
          )}
          <div className="coach-card p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              <Calendar className="h-4 w-4" />
              Payment due
            </div>
            <p className="font-heading mt-2 font-semibold text-[#111827]">
              {formatDisplayDate(billing.renewalDate)}
            </p>
          </div>
          <div className="coach-card p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              <Clock className="h-4 w-4" />
              Plan
            </div>
            <p className="font-heading mt-2 font-semibold text-[#111827]">{billing.planLabel}</p>
          </div>
        </div>
      )}

      {showPayUi && currentInvoice && (
        <section className="coach-card mt-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Current invoice
              </p>
              <p className="font-heading mt-1 text-lg font-bold text-[#111827]">
                {currentInvoice.invoiceNumber}
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {formatDisplayDate(currentInvoice.periodStart)} –{" "}
                {formatDisplayDate(currentInvoice.periodEnd)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-bold text-[#14532D]">
                {formatCurrency(currentInvoice.amount)}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                {invoiceStatusLabel(currentInvoice.status)}
              </p>
            </div>
          </div>
        </section>
      )}

      {showPayUi && (
        <section className="mt-6">
          <h2 className="font-heading text-sm font-semibold text-[#111827]">Pay with QR</h2>
          <p className="mt-1 text-xs text-[#6B7280]">
            Pick a channel, scan, pay{" "}
            {currentInvoice ? (
              <span className="font-semibold text-[#111827]">
                {formatCurrency(currentInvoice.amount)}
              </span>
            ) : null}
            , then upload your receipt below.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {KOACHES_PAYMENT_CHANNELS.map((channel) => (
              <button
                key={channel.id}
                type="button"
                onClick={() => setMethod(channel.id)}
                aria-pressed={method === channel.id}
                className={cn(
                  "flex min-h-[64px] items-center justify-center rounded-2xl bg-white px-3 py-3 transition-shadow",
                  method === channel.id
                    ? "ring-2 ring-[#16A34A] ring-offset-2"
                    : "ring-1 ring-[#E5E7EB] hover:ring-[#9CA3AF]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static logo from /public */}
                <img
                  src={channel.logoSrc}
                  alt={channel.label}
                  className="h-8 w-auto max-w-full object-contain"
                />
              </button>
            ))}
          </div>

          <div className="coach-card mt-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 items-center justify-center rounded-xl bg-white px-3 ring-1 ring-[#E5E7EB]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static logo from /public */}
                <img
                  src={selectedChannel.logoSrc}
                  alt={selectedChannel.label}
                  className="h-6 w-auto object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold text-[#111827]">
                  {selectedChannel.label} QR
                </p>
                <p className="text-xs text-[#6B7280]">{selectedChannel.hint}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center rounded-2xl bg-white p-4 ring-1 ring-[#E5E7EB]">
              {/* eslint-disable-next-line @next/next/no-img-element -- static QR from /public */}
              <img
                src={selectedChannel.qrSrc}
                alt={`${selectedChannel.label} payment QR`}
                width={280}
                height={280}
                className="h-auto w-full max-w-[280px]"
              />
            </div>
          </div>
        </section>
      )}

      {pendingSubmission && (
        <section className="mt-6 rounded-xl border border-[#E5EFE8] bg-[#F5FAF6] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3D5C47]" />
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-[#3D5C47]">Receipt submitted</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {pendingSubmission.receiptFileName} · {paymentMethodLabel(pendingSubmission.method)} ·{" "}
                {submissionStatusLabel(pendingSubmission.status)}. We&apos;ll confirm within 1–2
                business days.
              </p>
              <button
                type="button"
                className="mt-2 text-sm font-semibold text-[#4F8FF7] hover:underline"
                onClick={() => void viewReceipt(pendingSubmission.receiptPath)}
              >
                View uploaded receipt
              </button>
            </div>
          </div>
        </section>
      )}

      {canUpload && currentInvoice && (
        <section className="coach-card mt-6 p-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#4F8FF7]" />
            <h2 className="font-heading font-semibold text-[#111827]">Upload receipt</h2>
          </div>
          <p className="mt-1 text-sm text-[#6B7280]">
            After paying, upload a screenshot or PDF. Admin confirms it in the portal.
          </p>

          <form className="coach-form mt-4" onSubmit={(e) => void handleSubmit(e)}>
            <CoachSheetField label="You paid with">
              <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5">
                <div className="flex h-9 items-center justify-center rounded-lg bg-white px-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static logo from /public */}
                  <img
                    src={selectedChannel.logoSrc}
                    alt={selectedChannel.label}
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <span className="text-sm font-semibold text-[#14532D]">{selectedChannel.label}</span>
              </div>
            </CoachSheetField>

            <CoachSheetField label="Receipt file" hint="JPEG, PNG, WebP, or PDF · max 5 MB">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="coach-btn-outline flex w-full items-center justify-center gap-2 py-3"
              >
                <Upload className="h-4 w-4" />
                {fileName ?? "Choose image or PDF"}
              </button>
            </CoachSheetField>

            {error && (
              <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
                {error}
              </p>
            )}

            <CoachButton type="submit" className="w-full py-3" loading={submitting} loadingLabel="Uploading…">
              Submit receipt
            </CoachButton>
          </form>
        </section>
      )}

      {!showPayUi && (
        <section className="mt-6 rounded-xl border border-[#E5EFE8] bg-[#F5FAF6] p-4 text-sm text-[#3D5C47]">
          <p className="font-heading font-semibold">You&apos;re all set</p>
          <p className="mt-1 text-[#6B7280]">
            No payment due right now
            {billing.renewalDate
              ? ` · next renewal ${formatDisplayDate(billing.renewalDate)}`
              : ""}
            . We&apos;ll show the pay QR here when your invoice opens.
          </p>
        </section>
      )}

      {data.submissionHistory.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-sm font-semibold text-[#111827]">Payment history</h2>
          <ul className="mt-3 space-y-2">
            {data.submissionHistory.map((s) => (
              <li key={s.id} className="coach-card flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {formatCurrency(s.amount)} · {paymentMethodLabel(s.method)}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatDisplayDate(s.submittedAt)} · {submissionStatusLabel(s.status)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#4F8FF7]"
                  onClick={() => setPreviewPath(s.receiptPath)}
                >
                  View receipt
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ReceiptPreviewModal
        open={previewPath !== null}
        onClose={() => setPreviewPath(null)}
        title="Receipt"
        fileName={previewPath}
        fetchUrl={fetchPreviewUrl}
      />

      {data.invoiceHistory.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-sm font-semibold text-[#111827]">Invoice history</h2>
          <ul className="mt-3 space-y-2">
            {data.invoiceHistory.map((inv) => (
              <li
                key={inv.id}
                className="coach-card flex flex-wrap items-center justify-between gap-2 p-4 text-sm"
              >
                <div>
                  <p className="font-medium text-[#111827]">{inv.invoiceNumber}</p>
                  <p className="text-xs text-[#6B7280]">
                    Due {formatDisplayDate(inv.periodEnd)} · {invoiceStatusLabel(inv.status)}
                  </p>
                </div>
                <p className="font-semibold text-[#14532D]">{formatCurrency(inv.amount)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </CoachPageShell>
  );
}
