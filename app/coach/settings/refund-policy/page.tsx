import Link from "next/link";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";

export default function SettingsRefundPolicyPage() {
  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Refund Policy"
        subtitle="What happens if you need a refund"
        actions={
          <Link
            href="/coach/settings"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E5E7EB] px-3 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Back to settings
          </Link>
        }
      />

      <div className="coach-card mt-6 p-5 sm:p-6">
        <p className="text-sm text-[#6B7280]">Last updated: July 2026</p>
        <div className="mt-5 space-y-5 text-sm leading-relaxed text-[#374151]">
          <section>
            <h2 className="font-semibold text-[#111827]">Subscription billing</h2>
            <p className="mt-1">
              Subscription access is billed monthly according to your current plan and renewal date.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Refund requests</h2>
            <p className="mt-1">
              If you were charged incorrectly or had a billing issue, contact us within 7 days so we can
              review and help quickly.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Approved refunds</h2>
            <p className="mt-1">
              If a refund is approved, processing time depends on your payment provider.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Contact</h2>
            <p className="mt-1">
              For billing support, email{" "}
              <a className="text-[#4F8FF7] hover:underline" href="mailto:tlolapura@gmail.com">
                tlolapura@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </CoachPageShell>
  );
}
