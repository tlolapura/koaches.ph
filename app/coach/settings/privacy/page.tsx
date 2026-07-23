import Link from "next/link";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";

export default function SettingsPrivacyPage() {
  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Privacy Policy"
        subtitle="How we use your data, in plain words"
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
      </div>
    </CoachPageShell>
  );
}
