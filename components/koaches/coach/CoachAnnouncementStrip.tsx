"use client";

import Link from "next/link";
import { AlertTriangle, Megaphone } from "lucide-react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { getSubscriptionBillingInfo } from "@/lib/koaches/subscription-billing";
import { cn } from "@/lib/utils";

export function CoachAnnouncementStrip() {
  const coachId = usePortalCoachId();
  const { coach } = useCoachProfile(coachId);

  if (!coach) return null;

  const billing = getSubscriptionBillingInfo(coach);
  const isBillingAlert = ["send_invoice", "payment_due", "overdue"].includes(billing.status);
  if (!isBillingAlert) return null;

  const message =
    billing.status === "send_invoice"
      ? `Subscription renews in ${billing.daysUntilRenewal} day${billing.daysUntilRenewal === 1 ? "" : "s"}.`
      : billing.status === "payment_due"
        ? "Subscription payment is due today."
        : "Subscription payment is overdue. Update billing to avoid access limits.";

  return (
    <div className="relative z-[20] px-0 pt-0 md:px-4 md:pt-3">
      <div
        className={cn(
          "flex min-h-[36px] items-center justify-between gap-2 border-b px-3 py-2 text-xs font-medium md:rounded-xl md:border",
          isBillingAlert
            ? "border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B]"
            : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E3A8A]"
        )}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span className="shrink-0 rounded-full bg-[#B91C1C] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Action required
          </span>
          <span className="truncate">{message}</span>
        </span>
        <Link
          href="/coach/settings/billing"
          className="shrink-0 text-[11px] font-semibold underline underline-offset-2"
        >
          Open billing
        </Link>
      </div>
    </div>
  );
}

