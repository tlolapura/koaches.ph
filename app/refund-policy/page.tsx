import type { Metadata } from "next";
import Link from "next/link";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { BRAND_NAME } from "@/lib/koaches/constants";

export const metadata: Metadata = {
  title: `Refund Policy | ${BRAND_NAME}`,
  description: "Refund and billing policy for PickleKoach subscriptions.",
};

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <KoachesWordmark size="sm" />
        <h1 className="font-heading mt-6 text-2xl font-bold text-[#111827]">Refund Policy</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Last updated: July 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#374151]">
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

        <div className="mt-8 border-t border-[#E5E7EB] pt-4 text-xs text-[#9CA3AF]">
          Also see <Link href="/terms" className="text-[#4F8FF7] hover:underline">Terms of Service</Link>{" "}
          and <Link href="/privacy" className="text-[#4F8FF7] hover:underline">Privacy Policy</Link>.
        </div>
      </div>
    </main>
  );
}
