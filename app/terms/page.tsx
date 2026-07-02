import type { Metadata } from "next";
import Link from "next/link";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { BRAND_NAME } from "@/lib/koaches/constants";

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND_NAME}`,
  description: "Terms for using PickleKoach.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <KoachesWordmark size="sm" />
        <h1 className="font-heading mt-6 text-2xl font-bold text-[#111827]">Terms of Service</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Last updated: July 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#374151]">
          <section>
            <h2 className="font-semibold text-[#111827]">Use of the platform</h2>
            <p className="mt-1">
              PickleKoach helps coaches manage students, sessions, programs, and progress. By using the
              platform, you agree to use it responsibly and lawfully.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Accounts and access</h2>
            <p className="mt-1">
              You are responsible for your login and activity on your account. Keep your password secure
              and let us know right away if you suspect unauthorized access.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Subscriptions and billing</h2>
            <p className="mt-1">
              Paid features may require an active subscription. Pricing, billing dates, and payment
              instructions are shown in the app and may be updated with notice.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Acceptable use</h2>
            <p className="mt-1">
              Do not misuse the app, attempt unauthorized access, upload harmful content, or use the
              platform to violate the rights of others.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Changes and availability</h2>
            <p className="mt-1">
              We may improve, change, or pause parts of the service as we continue to build.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Contact</h2>
            <p className="mt-1">
              Questions about these terms? Email{" "}
              <a className="text-[#4F8FF7] hover:underline" href="mailto:tlolapura@gmail.com">
                tlolapura@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-[#E5E7EB] pt-4 text-xs text-[#9CA3AF]">
          Also see <Link href="/privacy" className="text-[#4F8FF7] hover:underline">Privacy Policy</Link>{" "}
          and <Link href="/refund-policy" className="text-[#4F8FF7] hover:underline">Refund Policy</Link>.
        </div>
      </div>
    </main>
  );
}
