"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileText,
  Smartphone,
  Upload,
} from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
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
import { KOACHES_PAYMENT_DETAILS } from "@/lib/koaches/billing-constants";
import { BILLING_STATUS_STYLES } from "@/lib/koaches/subscription-billing";
import type { CoachBillingDashboard, CoachPaymentMethod } from "@/lib/koaches/types";
import { cn, formatCurrency, formatDisplayDate } from "@/lib/utils";

function CopyButton({ value, label }: { value: string; label: string }) {
  const { showToast } = useCoachToast();
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
      onClick={() => {
        void navigator.clipboard.writeText(value);
        showToast(`${label} copied`);
      }}
    >
      <Copy className="h-3.5 w-3.5" />
      Copy
    </button>
  );
}

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
  const [method, setMethod] = useState<CoachPaymentMethod>("gcash");
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    formData.set("notes", notes);
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
    setNotes("");
    setFileName(null);
    if (fileRef.current) fileRef.current.value = "";
    void load();
  };

  const viewReceipt = async (path: string) => {
    if (!coachId) return;
    const url = await getCoachReceiptSignedUrlAction(coachId, path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else showToast("Could not open receipt", "error");
  };

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
  const canUpload =
    currentInvoice &&
    currentInvoice.status !== "paid" &&
    !pendingSubmission &&
    ["send_invoice", "payment_due", "overdue", "lapsed"].includes(billing.status);

  return (
    <CoachPageShell className="pb-8">
      <CoachPageHeader
        title="Billing"
        subtitle="Your plan and payment history"
        actions={backToSettings}
      />

      {isRestricted && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-heading font-semibold">Account access limited</p>
            <p className="mt-1 leading-relaxed">
              Your subscription is inactive or lapsed. Renew below to restore full access to sessions,
              students, and other coach tools.
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
                Invoice date
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

      {currentInvoice && (
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

      <section className="mt-6">
        <h2 className="font-heading text-sm font-semibold text-[#111827]">How to pay</h2>
        <p className="mt-1 text-xs text-[#6B7280]">
          Use your invoice number as the payment reference.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="coach-card p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14532D] text-white">
                <Smartphone className="h-4 w-4" />
              </div>
              <p className="font-heading font-semibold">{KOACHES_PAYMENT_DETAILS.gcash.label}</p>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Name</dt>
                <dd className="font-medium">{KOACHES_PAYMENT_DETAILS.gcash.accountName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Number</dt>
                <dd className="flex items-center gap-2 font-medium">
                  {KOACHES_PAYMENT_DETAILS.gcash.number}
                  <CopyButton value={KOACHES_PAYMENT_DETAILS.gcash.number} label="Number" />
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-[#9CA3AF]">{KOACHES_PAYMENT_DETAILS.gcash.note}</p>
          </div>

          <div className="coach-card p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#14532D] text-white">
                <Building2 className="h-4 w-4" />
              </div>
              <p className="font-heading font-semibold">{KOACHES_PAYMENT_DETAILS.bank.label}</p>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Account name</dt>
                <dd className="text-right font-medium">{KOACHES_PAYMENT_DETAILS.bank.accountName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Account no.</dt>
                <dd className="flex items-center gap-2 font-medium">
                  {KOACHES_PAYMENT_DETAILS.bank.accountNumber}
                  <CopyButton
                    value={KOACHES_PAYMENT_DETAILS.bank.accountNumber.replace(/\s/g, "")}
                    label="Account number"
                  />
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Branch</dt>
                <dd className="font-medium">{KOACHES_PAYMENT_DETAILS.bank.branch}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-[#9CA3AF]">{KOACHES_PAYMENT_DETAILS.bank.note}</p>
          </div>
        </div>
      </section>

      {pendingSubmission && (
        <section className="mt-6 rounded-xl border border-[#E5EFE8] bg-[#F5FAF6] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3D5C47]" />
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-[#3D5C47]">Receipt submitted</p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {pendingSubmission.receiptFileName} · {submissionStatusLabel(pendingSubmission.status)}.
                We'll confirm your payment within 1–2 business days.
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
            After paying, upload a screenshot or PDF of your GCash / bank transfer receipt.
          </p>

          <form className="coach-form mt-4" onSubmit={(e) => void handleSubmit(e)}>
            <CoachSheetField label="Payment method">
              <div className="flex gap-2">
                {(
                  [
                    { id: "gcash" as const, label: "GCash" },
                    { id: "bank_transfer" as const, label: "Bank transfer" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMethod(opt.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      method === opt.id
                        ? "bg-[#14532D] text-white"
                        : "border border-[#E5E7EB] bg-white text-[#6B7280]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CoachSheetField>

            <CoachSheetField
              label="Reference / notes (optional)"
              htmlFor="receipt-notes"
            >
              <input
                id="receipt-notes"
                className="coach-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. GCash ref no. 123456"
              />
            </CoachSheetField>

            <CoachSheetField label="Receipt file" hint="JPEG, PNG, WebP, or PDF">
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

      {data.submissionHistory.length > 0 && (
        <section className="mt-8">
          <h2 className="font-heading text-sm font-semibold text-[#111827]">Payment history</h2>
          <ul className="mt-3 space-y-2">
            {data.submissionHistory.map((s) => (
              <li key={s.id} className="coach-card flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-medium text-[#111827]">
                    {formatCurrency(s.amount)} · {s.method === "gcash" ? "GCash" : "Bank"}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {formatDisplayDate(s.submittedAt)} · {submissionStatusLabel(s.status)}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#4F8FF7]"
                  onClick={() => void viewReceipt(s.receiptPath)}
                >
                  View receipt
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.invoiceHistory.length > 1 && (
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
