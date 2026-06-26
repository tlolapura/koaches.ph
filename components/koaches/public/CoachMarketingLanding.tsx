import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChartLine,
  ClipboardList,
  QrCode,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  PublicFeatureCard,
  PublicHero,
  PublicStatGrid,
} from "@/components/koaches/public/LandingHero";
import { BRAND_NAME } from "@/lib/koaches/constants";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Users,
    title: "Student roster & intake",
    description: "QR sign-up links, digital waivers, and approve new players before their first session.",
    tone: "coral" as const,
  },
  {
    icon: CalendarDays,
    title: "Sessions & calendar",
    description: "Schedule drop-ins and programs, track payments, and manage your week in one place.",
    tone: "navy" as const,
  },
  {
    icon: ClipboardList,
    title: "Programs & progress",
    description: "Bundle coaching packages and send shareable progress cards after every milestone.",
    tone: "sage" as const,
  },
  {
    icon: Share2,
    title: "Social-ready graphics",
    description: "Turn your open slots and programs into story images for Instagram and group chats.",
    tone: "coral" as const,
  },
  {
    icon: QrCode,
    title: "Shareable QR codes",
    description: "Save branded QR images with your photo — perfect to show at court or print.",
    tone: "navy" as const,
  },
  {
    icon: ChartLine,
    title: "Public coach profile",
    description: "A beautiful page with your rates, courts, achievements, and contact info.",
    tone: "sage" as const,
  },
];

const STEPS = [
  {
    step: "1",
    title: "Apply & get onboarded",
    body: "Tell us about your coaching. Once approved, we set up your profile and dashboard.",
  },
  {
    step: "2",
    title: "Share your join link or QR",
    body: "Students scan to sign up and sign the waiver. You approve them onto your roster.",
  },
  {
    step: "3",
    title: "Coach, track, and grow",
    body: "Run sessions, send progress cards, and post social graphics — all from your phone.",
  },
];

export function CoachMarketingLanding() {
  return (
    <div className="coach-portal flex min-h-dvh flex-col bg-[#FAFAF8]">
      <PublicHero
        back={{ href: "/", label: "← Home" }}
        eyebrow="For coaches"
        title="Your coaching business, one app"
        subtitle={`${BRAND_NAME} handles roster, scheduling, progress, and marketing — so you can focus on court time.`}
      >
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link href="/apply" className="coach-btn-primary gap-2 py-3.5 sm:w-auto sm:flex-1">
            Apply to join
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/coach/login"
            className="coach-btn-outline gap-2 border-white/25 bg-white/10 py-3.5 text-white hover:border-white/40 hover:bg-white/15 sm:w-auto sm:flex-1"
          >
            Coach login
          </Link>
        </div>

        <PublicStatGrid
          className="mt-5"
          stats={[
            { value: "₱299", label: "Early bird" },
            { value: "1 app", label: "Roster → social" },
            { value: "PH", label: "Built here" },
          ]}
        />
      </PublicHero>

      <section className="mx-auto w-full max-w-3xl px-4 py-8">
        <h2 className="font-heading text-lg font-semibold text-[#111827]">Everything on court</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          No more spreadsheets, Viber threads, or payment screenshot chaos.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <PublicFeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h2 className="font-heading text-lg font-semibold text-[#111827]">How it works</h2>
          <ol className="mt-5 space-y-5">
            {STEPS.map((item, i) => (
              <li key={item.step} className="flex gap-4">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white",
                    i % 2 === 0 ? "bg-[#16A34A]" : "bg-[#4F8FF7]"
                  )}
                >
                  {item.step}
                </span>
                <div>
                  <p className="font-heading font-semibold text-[#111827]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#6B7280]">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
        <div className="coach-card overflow-hidden border-[#C5D9CC] bg-gradient-to-br from-[#E5EFE8] via-white to-[#EFF6FF] p-6 text-center sm:p-8">
          <UserPlus className="mx-auto h-8 w-8 text-[#6B9E78]" strokeWidth={2} />
          <h2 className="font-heading mt-3 text-xl font-bold text-[#111827]">Ready to join the court?</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280]">
            Early bird coaches get full access for ₱299/month. Apply now — we&apos;ll reach out to get you set up.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link href="/apply" className="coach-btn-primary gap-2 sm:w-auto sm:px-8">
              Start application
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/coach/login" className="coach-btn-outline gap-2 sm:w-auto sm:px-8">
              I have an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
