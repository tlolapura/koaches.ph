"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  MessageCircle,
  UserPlus,
} from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { FacebookIcon, InstagramIcon } from "@/components/koaches/shared/SocialIcons";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { MarketingDemoVideo } from "@/components/koaches/public/MarketingDemoVideo";
import { KOACHES_PAYMENT_CHANNELS } from "@/lib/koaches/billing-constants";
import { BRAND_NAME, BRAND_SOCIAL } from "@/lib/koaches/constants";
import { SUBSCRIPTION_PRICES } from "@/lib/koaches/admin-data";
import { EARLY_BIRD_SLOTS_TOTAL } from "@/lib/koaches/early-bird";
import { formatCurrency } from "@/lib/utils";

const PLANS = [
  {
    id: "early-bird",
    name: "Early bird",
    price: SUBSCRIPTION_PRICES["early-bird"],
    badge: `First ${EARLY_BIRD_SLOTS_TOTAL} coaches`,
    description: "Founding coach pricing while early bird slots last.",
    featured: true,
    perks: [
      "Save ₱200 every month",
      "Founding coach rate while your plan stays active",
      "Personal onboarding and setup help",
    ],
  },
  {
    id: "regular",
    name: "Regular",
    price: SUBSCRIPTION_PRICES.regular,
    badge: "Standard plan",
    description: "Same full platform once early bird slots fill up.",
    featured: false,
    perks: [
      "Simple month-to-month subscription",
      "Cancel anytime",
      "No feature limits or reduced access",
    ],
  },
] as const;

const SHARED_PLAN_FEATURES = [
  "Full coaching OS access",
  "Students, sessions, and programs",
  "Progress cards and reports",
  "Public coach profile page",
] as const;

const VIBER_SUPPORT_NUMBER = "+639688546190";

export function CoachMarketingLanding() {
  const [recordingView, setRecordingView] = useState<"mobile" | "desktop">("desktop");

  return (
    <div className="coach-portal relative min-h-dvh overflow-hidden bg-[#FAFAF8] text-[#111827]">
      <PickleballBallBackdrop variant="landing" className="opacity-50" />
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-0 pt-6 sm:px-6 sm:pb-0">
          <div className="flex items-center justify-between gap-3">
            <KoachesWordmark size="sm" />
            <Link href="/" className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]">
              ← Home
            </Link>
          </div>

          <div className="mt-5 grid items-center gap-4 lg:grid-cols-[1fr_.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="order-1 -mx-4 w-auto sm:-mx-6 lg:order-2 lg:mx-0 lg:w-full"
            >
              <Image
                src="/illustrations/coaches.webp"
                alt="Pickleball coaches using PickleKoach"
                width={900}
                height={900}
                className="block h-[360px] w-full object-contain object-bottom sm:h-[440px] lg:h-[520px]"
                priority
              />
            </motion.div>

            <div className="order-2 lg:order-1 lg:self-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16A34A]">For coaches</p>
              <h1 className="font-heading mt-2 text-4xl font-bold leading-tight text-[#111827] sm:text-5xl">
                {BRAND_NAME} is your coaching OS.
              </h1>
              <p className="mt-3 max-w-lg text-sm text-[#4B5563] sm:text-base">
                Run your coaching business from one app. No scattered sheets. No messy chat threads. Just a
                clear system built for pickleball coaches.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link href="/apply" className="coach-btn-primary gap-2 py-3 sm:w-auto">
                  Apply as coach
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/coach/login"
                  className="coach-btn-outline py-3 sm:w-auto"
                >
                  Coach login
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#F0FDF4] via-[#EFF6FF] to-[#F8FAFC] px-4 py-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              What coaches can do inside
            </p>
            <h2 className="font-heading mt-1 text-2xl font-bold">See how coaches use the app</h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              Watch a quick walkthrough of scheduling, student management, reports, and daily workflow.
            </p>
          </div>

          <div className="p-3 sm:p-4">
            <div className="mb-2 flex justify-center">
              <div className="inline-flex rounded-full border border-[#E5E7EB] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setRecordingView("desktop")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    recordingView === "desktop"
                      ? "bg-[#111827] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Desktop view
                </button>
                <button
                  type="button"
                  onClick={() => setRecordingView("mobile")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    recordingView === "mobile"
                      ? "bg-[#111827] text-white"
                      : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  Mobile view
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#0F172A] p-2.5 sm:p-3">
              <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-white/20 bg-black shadow-[0_16px_38px_rgba(0,0,0,0.35)]">
                <MarketingDemoVideo
                  key={recordingView}
                  className={
                    recordingView === "desktop"
                      ? "aspect-[16/10] w-full"
                      : "h-[520px] w-full sm:h-[560px]"
                  }
                  src={
                    recordingView === "desktop"
                      ? "/illustrations/record-desktop.mov"
                      : "/illustrations/record-mobile.mov"
                  }
                />
              </div>
              <p className="mt-2 text-center text-xs text-white/75 sm:text-sm">
                Live desktop app walkthrough
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-2 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">
          <div className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#F0FDF4] via-[#EFF6FF] to-[#F8FAFC] px-4 py-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Pricing
            </p>
            <h2 className="font-heading mt-1 text-2xl font-bold">Simple monthly plans</h2>
            <p className="mt-1 max-w-xl text-sm text-[#4B5563]">
              One subscription for the full coaching OS. Pay monthly via GCash, Maya, BPI, or UnionBank.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-[#E5E7EB]">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative px-5 py-6 sm:px-7 sm:py-8 ${
                  plan.featured ? "bg-gradient-to-br from-[#F0FDF4]/80 to-white" : "bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-[#111827]">{plan.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      plan.featured
                        ? "bg-[#16A34A] text-white"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#6B7280]">{plan.description}</p>
                <p className="font-heading mt-5 text-4xl font-bold tracking-tight text-[#14532D]">
                  {formatCurrency(plan.price)}
                  <span className="text-base font-semibold text-[#6B7280]">/mo</span>
                </p>
                <ul className="mt-5 space-y-2.5">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid border-t border-[#E5E7EB] lg:grid-cols-[1fr_0.75fr]">
            <div className="px-5 py-6 sm:px-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">
                Included in both plans
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {SHARED_PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[#374151]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-[#E5E7EB] bg-[#F0FDF4] px-5 py-6 sm:px-7 lg:border-l lg:border-t-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16A34A] text-white">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="font-heading mt-3 text-lg font-bold text-[#14532D]">
                24/7 Viber support
              </h3>
              <p className="mt-1 text-sm text-[#4B5563]">
                Get help with setup, billing, or using PickleKoach whenever you need it.
              </p>
              <a
                href={`viber://chat?number=${encodeURIComponent(VIBER_SUPPORT_NUMBER)}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7360F2] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#6553DC]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Chat on Viber
              </a>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] px-4 py-5 sm:px-6">
            <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
              Modes of payment
            </p>
            <p className="mt-1 text-center text-sm text-[#4B5563]">
              Scan QR in your billing page, then upload your receipt for confirmation.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {KOACHES_PAYMENT_CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className="flex h-14 w-[7.5rem] items-center justify-center rounded-2xl bg-white px-3 ring-1 ring-[#E5E7EB] sm:h-16 sm:w-36"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static brand logos */}
                  <img
                    src={channel.logoSrc}
                    alt={channel.label}
                    className="h-8 w-auto max-w-full object-contain sm:h-9"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 text-center sm:p-8">
          <UserPlus className="mx-auto h-8 w-8 text-[#16A34A]" />
          <h2 className="font-heading mt-3 text-2xl font-bold text-[#111827]">
            Want to see your coaching business level up?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#6B7280]">
            Join early and we&apos;ll help you set up your profile, workflow, and app screens.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link href="/apply" className="coach-btn-primary gap-2 sm:w-auto sm:px-8">
              Start application
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/coach/login" className="coach-btn-outline sm:w-auto sm:px-8">
              I already have access
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <KoachesWordmark size="sm" className="opacity-90" />
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-[#4B5563]">
              <Link href="/for-coaches" className="hover:text-[#111827]">
                For coaches
              </Link>
              <Link href="/apply" className="hover:text-[#111827]">
                Apply
              </Link>
              <Link href="/coach/login" className="hover:text-[#111827]">
                Coach login
              </Link>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-[#F3F4F6] pt-3 sm:flex-row">
            <p className="text-xs text-[#9CA3AF]">© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
              <a
                href={BRAND_SOCIAL.facebook.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#6B7280]"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                Facebook
              </a>
              <a
                href={BRAND_SOCIAL.instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#6B7280]"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
                @{BRAND_SOCIAL.instagram.handle}
              </a>
              <Link href="/terms" className="hover:text-[#6B7280]">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-[#6B7280]">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
