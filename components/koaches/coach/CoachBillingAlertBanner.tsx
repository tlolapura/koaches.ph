import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { CoachProfile } from "@/lib/koaches/types";
import {
  BILLING_STATUS_STYLES,
  getSubscriptionBillingInfo,
} from "@/lib/koaches/subscription-billing";
import { cn, formatCurrency } from "@/lib/utils";

type CoachBillingAlertBannerProps = {
  coach: CoachProfile;
  className?: string;
};

export function CoachBillingAlertBanner({ coach, className }: CoachBillingAlertBannerProps) {
  const billing = getSubscriptionBillingInfo(coach);
  if (!["send_invoice", "payment_due", "overdue"].includes(billing.status)) {
    return null;
  }

  const styles = BILLING_STATUS_STYLES[billing.status];
  const message =
    billing.status === "send_invoice"
      ? `Your subscription renews in ${billing.daysUntilRenewal} day${billing.daysUntilRenewal === 1 ? "" : "s"}. Upload your payment receipt on the billing page when ready.`
      : billing.status === "payment_due"
        ? "Payment is due today. Submit your receipt to keep full portal access."
        : "Your payment is overdue. Renew soon to avoid losing access to sessions and students.";

  return (
    <div className={cn("px-4", className)}>
      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm",
          styles.panel
        )}
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold">{billing.label}</p>
          <p className="mt-1 leading-relaxed">{message}</p>
          <p className="mt-1 text-xs opacity-80">
            {billing.planLabel} · {formatCurrency(billing.amount)}/mo
          </p>
          <Link
            href="/coach/billing"
            className="mt-2 inline-block text-sm font-semibold text-[#4F8FF7] hover:underline"
          >
            Go to billing →
          </Link>
        </div>
      </div>
    </div>
  );
}
