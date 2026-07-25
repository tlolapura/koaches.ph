"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { ReceiptPreviewModal } from "@/components/koaches/admin/ReceiptPreviewModal";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachBillingSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import {
  fetchCoachBillingDashboardAction,
  getCoachReceiptSignedUrlAction,
  submitCoachPaymentReceiptAction,
} from "@/lib/koaches/actions/billing";
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
  const [loadFailed, setLoadFailed] = useState(false);
  const [method, setMethod] = useState<PaymentChannelId>("gcash");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!coachId) return;
    try {
      const next = await fetchCoachBillingDashboardAction(coachId);
      setData(next);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  const retry = useCallback(() => {
    setLoading(true);
    setLoadFailed(false);
    void load();
  }, [load]);

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

  if (loading || !data) {
    return (
      <CoachPageShell className="pb-8">
        <CoachPageHeader
          title="Billing"
          subtitle="Your plan and payment history"
        />
        {loadFailed && !loading ? (
          <div className="coach-card mt-6 p-6 text-center">
            <p className="font-heading font-semibold text-[#111827]">Couldn&apos;t load your billing info</p>
            <p className="mt-1 text-sm text-[#6B7280]">Check your connection and try again.</p>
            <CoachButton type="button" className="mt-4 px-6" onClick={retry}>
              Try again
            </CoachButton>
          </div>
        ) : (
          <div className="mt-6 animate-pulse space-y-4" aria-busy aria-label="Loading billing">
            <div className="h-24 rounded-2xl bg-[#E5E7EB]" />
            <div className="h-40 rounded-2xl bg-[#E5E7EB]/80" />
          </div>
        )}
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
      <CoachPageHeader title="Billing" />

      {(isRestricted || billing.status === "lapsed") && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3 text-sm text-[#991B1B]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Access is limited until we confirm your payment
            {` (locks ${SUBSCRIPTION_PAYMENT_GRACE_DAYS} days after due)`}.
          </p>
        </div>
      )}

      {showPayUi ? (
        <>
          {/* One hero: amount + status. Everything else is quiet meta. */}
          <section className={cn("mt-3 rounded-2xl px-4 py-4", styles.panel)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-heading text-3xl font-bold leading-none tracking-tight">
                  {formatCurrency(currentInvoice?.amount ?? billing.amount)}
                </p>
                <p className="mt-2 text-sm font-medium opacity-90">
                  {billing.label}
                  <span className="opacity-70"> · {billing.planLabel}</span>
                </p>
              </div>
              <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase", styles.badge)}>
                {currentInvoice ? invoiceStatusLabel(currentInvoice.status) : billing.label}
              </span>
            </div>
            <p className="mt-3 text-xs opacity-70">
              {billing.renewalDate ? `Due ${formatDisplayDate(billing.renewalDate)}` : null}
              {currentInvoice
                ? `${billing.renewalDate ? " · " : ""}${formatDisplayDate(currentInvoice.periodStart)} – ${formatDisplayDate(currentInvoice.periodEnd)}`
                : null}
            </p>
          </section>

          {pendingSubmission ? (
            <section className="mt-4 rounded-xl border border-[#E5EFE8] bg-[#F5FAF6] p-3.5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3D5C47]" />
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold text-[#3D5C47]">Receipt under review</p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {paymentMethodLabel(pendingSubmission.method)} · usually 1–2 days
                  </p>
                  <button
                    type="button"
                    className="mt-1 min-h-[44px] text-sm font-semibold text-[#4F8FF7] hover:underline"
                    onClick={() => setPreviewPath(pendingSubmission.receiptPath)}
                  >
                    View receipt
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="mt-5">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                  1 · Scan to pay
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {KOACHES_PAYMENT_CHANNELS.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setMethod(channel.id)}
                      aria-pressed={method === channel.id}
                      aria-label={channel.label}
                      className={cn(
                        "flex min-h-[52px] items-center justify-center rounded-xl bg-white px-2 py-2 transition-shadow",
                        method === channel.id
                          ? "ring-2 ring-[#16A34A] ring-offset-1"
                          : "ring-1 ring-[#E5E7EB]"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- static logo from /public */}
                      <img
                        src={channel.logoSrc}
                        alt=""
                        className="h-6 w-auto max-w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <p className="mb-3 text-xs font-semibold text-[#6B7280]">
                    {selectedChannel.label}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- static QR from /public */}
                  <img
                    src={selectedChannel.qrSrc}
                    alt={`${selectedChannel.label} payment QR`}
                    width={220}
                    height={220}
                    className="h-auto w-full max-w-[220px]"
                  />
                </div>
              </section>

              {canUpload && currentInvoice ? (
                <section className="mt-5">
                  <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#9CA3AF]">
                    2 · Upload receipt
                  </p>
                  <form
                    className="mt-2 space-y-3"
                    onSubmit={(e) => void handleSubmit(e)}
                  >
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
                      {fileName ?? "Choose screenshot or PDF"}
                    </button>

                    {error && (
                      <p className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]" role="alert">
                        {error}
                      </p>
                    )}

                    <CoachButton
                      type="submit"
                      className="w-full py-3"
                      loading={submitting}
                      loadingLabel="Uploading…"
                      disabled={!fileName}
                    >
                      Submit {selectedChannel.label} receipt
                    </CoachButton>
                  </form>
                </section>
              ) : null}
            </>
          )}
        </>
      ) : (
        <section className="mt-3 rounded-2xl border border-[#E5EFE8] bg-[#F5FAF6] px-4 py-4">
          <p className="font-heading text-lg font-bold text-[#14532D]">You&apos;re good</p>
          <p className="mt-1 text-sm text-[#3D5C47]">
            {billing.planLabel} · {formatCurrency(billing.amount)}/mo
            {billing.renewalDate
              ? ` · next due ${formatDisplayDate(billing.renewalDate)}`
              : ""}
          </p>
        </section>
      )}

      {data.submissionHistory.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-sm font-semibold text-[#111827]">History</h2>
          <ul className="mt-2 space-y-2">
            {data.submissionHistory.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3"
              >
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
                  className="min-h-[44px] text-sm font-semibold text-[#4F8FF7]"
                  onClick={() => setPreviewPath(s.receiptPath)}
                >
                  View
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
        <section className={cn(data.submissionHistory.length > 0 ? "mt-5" : "mt-8")}>
          {data.submissionHistory.length === 0 ? (
            <h2 className="font-heading text-sm font-semibold text-[#111827]">History</h2>
          ) : null}
          <ul className={cn("space-y-2", data.submissionHistory.length === 0 && "mt-2")}>
            {data.invoiceHistory.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-[#111827]">{inv.invoiceNumber}</p>
                  <p className="text-xs text-[#6B7280]">
                    {formatDisplayDate(inv.periodEnd)} · {invoiceStatusLabel(inv.status)}
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
