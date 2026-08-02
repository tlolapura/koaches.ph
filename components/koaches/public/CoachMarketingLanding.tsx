"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Mail,
  MessageCircle,
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
    name: "Founding",
    price: SUBSCRIPTION_PRICES["early-bird"],
    badge: `First ${EARLY_BIRD_SLOTS_TOTAL} coaches`,
    description: "Free for life while founding slots last.",
    featured: true,
    perks: [
      "No monthly fee, ever",
      "Full access to everything in PickleKoach",
      "Personal onboarding and setup help",
    ],
  },
  {
    id: "regular",
    name: "Monthly",
    price: SUBSCRIPTION_PRICES.regular,
    badge: "After founding slots",
    description: "For coaches who join after the first 30.",
    featured: false,
    perks: [
      "Month-to-month. Cancel anytime",
      "Same features as founding coaches",
      "No locks or reduced access",
    ],
  },
] as const;

const SHARED_PLAN_FEATURES = [
  "Full access to PickleKoach",
  "Students, sessions, and programs",
  "Progress cards and reports",
  "Public coach profile page",
] as const;

const VIBER_SUPPORT_NUMBER = "+639688546190";
const DEMO_EMAIL = "picklekoach@gmail.com";
const DEMO_MAILTO = `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent("PickleKoach demo request")}`;

export function CoachMarketingLanding() {
  const [recordingView, setRecordingView] = useState<"mobile" | "desktop">("desktop");

  return (
    <div className="coach-portal relative min-h-dvh overflow-hidden bg-white text-[#111827]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ECFDF5] via-white to-[#EFF6FF]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[55%] w-[55%] rounded-full bg-[#4F8FF7]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-[20%] h-[45%] w-[50%] rounded-full bg-[#16A34A]/12 blur-3xl"
        aria-hidden
      />
      <PickleballBallBackdrop variant="landing" className="opacity-80" />

      <div className="relative z-[1]">
        <section className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-end px-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10 lg:px-12">
            <Link
              href="/"
              className="text-sm font-semibold text-[#6B7280] transition-colors hover:text-[#111827]"
            >
              ← Home
            </Link>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="flex flex-col justify-center px-6 pb-4 pt-4 sm:px-10 lg:px-12 lg:pb-10 lg:pt-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <KoachesWordmark size="lg" className="origin-left scale-110 sm:scale-125" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
                className="mt-8 max-w-lg sm:mt-10"
              >
                <h1 className="font-heading text-[clamp(1.85rem,5.5vw,3rem)] font-bold leading-[1.12] tracking-tight text-[#111827]">
                  Your coaching, organized.
                </h1>
                <p className="mt-3 text-base leading-relaxed text-[#4B5563] sm:text-lg">
                  Run students, sessions, programs, and progress from one place. Built for pickleball
                  coaches.
                </p>

                <div className="mt-8 flex w-full max-w-md flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                  <Link href="/apply" className="coach-btn-primary min-h-[48px] gap-2 sm:w-auto">
                    Apply as coach
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href={DEMO_MAILTO} className="coach-btn-outline min-h-[48px] gap-2 sm:w-auto">
                    <Mail className="h-4 w-4" />
                    Request a demo
                  </a>
                  <Link href="/coach/login" className="coach-btn-outline min-h-[48px] sm:w-auto">
                    Coach login
                  </Link>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
              className="relative mt-auto flex min-h-[38vh] items-end justify-center sm:min-h-[42vh] lg:min-h-[520px] lg:items-end lg:justify-end"
            >
              <Image
                src="/illustrations/coaches.webp"
                alt="Pickleball coaches using PickleKoach"
                width={900}
                height={900}
                className="pointer-events-none h-[min(48vh,400px)] w-full object-contain object-bottom sm:h-[min(52vh,480px)] lg:h-[min(560px,70vh)] lg:w-auto lg:translate-x-4"
                priority
              />
            </motion.div>
          </div>
        </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB]/80 bg-white/90 shadow-[0_8px_30px_rgba(22,163,74,0.06)] backdrop-blur-sm">
          <div className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#ECFDF5] via-white to-[#EFF6FF] px-4 py-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#16A34A]">
              Walkthrough
            </p>
            <h2 className="font-heading mt-1 text-2xl font-bold">See how coaches use the app</h2>
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
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-2 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB]/80 bg-white/90 shadow-[0_8px_30px_rgba(79,143,247,0.06)] backdrop-blur-sm">
          <div className="border-b border-[#E5E7EB] bg-gradient-to-r from-[#ECFDF5] via-white to-[#EFF6FF] px-4 py-4 sm:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#16A34A]">
              Pricing
            </p>
            <h2 className="font-heading mt-1 text-2xl font-bold">Simple pricing</h2>
            <p className="mt-1 max-w-xl text-sm text-[#4B5563]">
              First {EARLY_BIRD_SLOTS_TOTAL} coaches are free for life. After that, ₱
              {SUBSCRIPTION_PRICES.regular}/month.
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
                  {plan.price === 0 ? (
                    <>
                      Free
                      <span className="text-base font-semibold text-[#6B7280]"> forever</span>
                    </>
                  ) : (
                    <>
                      {formatCurrency(plan.price)}
                      <span className="text-base font-semibold text-[#6B7280]">/mo</span>
                    </>
                  )}
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
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {KOACHES_PAYMENT_CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className="flex h-9 w-[4.75rem] items-center justify-center rounded-lg bg-white px-2 ring-1 ring-[#E5E7EB] sm:h-10 sm:w-24"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static brand logos */}
                  <img
                    src={channel.logoSrc}
                    alt={channel.label}
                    className="h-4 w-auto max-w-full object-contain sm:h-5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-8 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-[#E5E7EB]/80 bg-gradient-to-br from-[#ECFDF5] via-white to-[#EFF6FF] p-5 text-center shadow-[0_8px_30px_rgba(22,163,74,0.06)] sm:p-8">
          <KoachesWordmark size="md" className="mx-auto justify-center" />
          <h2 className="font-heading mt-5 text-2xl font-bold text-[#111827] sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-base text-[#4B5563]">
            Apply now, or email us for a live demo.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <Link href="/apply" className="coach-btn-primary min-h-[48px] gap-2 sm:w-auto sm:px-8">
              Start application
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={DEMO_MAILTO} className="coach-btn-outline min-h-[48px] gap-2 sm:w-auto sm:px-8">
              <Mail className="h-4 w-4" />
              Request a demo
            </a>
            <Link href="/coach/login" className="coach-btn-outline min-h-[48px] sm:w-auto sm:px-8">
              I already have access
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#6B7280]">
            <a
              href={DEMO_MAILTO}
              className="font-semibold text-[#16A34A] underline-offset-2 hover:underline"
            >
              {DEMO_EMAIL}
            </a>
          </p>
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB]/80 bg-white/80 backdrop-blur">
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
              <a href={DEMO_MAILTO} className="hover:text-[#111827]">
                Request a demo
              </a>
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
    </div>
  );
}
