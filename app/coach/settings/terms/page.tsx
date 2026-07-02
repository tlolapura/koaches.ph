import Link from "next/link";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";

export default function SettingsTermsPage() {
  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Terms of Service"
        subtitle="How PickleKoach can be used"
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
      </div>
    </CoachPageShell>
  );
}
