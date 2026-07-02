import type { Metadata } from "next";
import Link from "next/link";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { BRAND_NAME } from "@/lib/koaches/constants";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
  description: "Privacy details for PickleKoach.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <KoachesWordmark size="sm" />
        <h1 className="font-heading mt-6 text-2xl font-bold text-[#111827]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Last updated: July 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-[#374151]">
          <section>
            <h2 className="font-semibold text-[#111827]">What we collect</h2>
            <p className="mt-1">
              We collect the information you provide in the app, such as profile details, student/session
              records, and account contact information.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Why we use it</h2>
            <p className="mt-1">
              We use your data to operate the coach portal, improve product features, provide support,
              and communicate important account or billing updates.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Data sharing</h2>
            <p className="mt-1">
              We do not sell your personal information. Data may be shared with trusted service providers
              only when needed to run the platform (for example, hosting and authentication).
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Security</h2>
            <p className="mt-1">
              We use standard security practices to protect data, but no system is 100% risk-free.
              Always use a strong password and protect your device.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Your choices</h2>
            <p className="mt-1">
              You can update your profile details in the app. If you need account or data support, contact
              us and we will do our best to help.
            </p>
          </section>
          <section>
            <h2 className="font-semibold text-[#111827]">Contact</h2>
            <p className="mt-1">
              Privacy questions? Email{" "}
              <a className="text-[#4F8FF7] hover:underline" href="mailto:tlolapura@gmail.com">
                tlolapura@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-[#E5E7EB] pt-4 text-xs text-[#9CA3AF]">
          Also see <Link href="/terms" className="text-[#4F8FF7] hover:underline">Terms of Service</Link>{" "}
          and <Link href="/refund-policy" className="text-[#4F8FF7] hover:underline">Refund Policy</Link>.
        </div>
      </div>
    </main>
  );
}
