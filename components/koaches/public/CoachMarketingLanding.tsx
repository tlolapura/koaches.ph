"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME } from "@/lib/koaches/constants";

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
                src="/illustrations/coaches.png"
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
                <video
                  key={recordingView}
                  className={`w-full object-contain object-top ${
                    recordingView === "desktop"
                      ? "aspect-[16/10]"
                      : "h-[520px] sm:h-[560px]"
                  }`}
                  src={
                    recordingView === "desktop"
                      ? "/illustrations/record-desktop.mov"
                      : "/illustrations/record-mobile.mov"
                  }
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                />
              </div>
              <p className="mt-2 text-center text-xs text-white/75 sm:text-sm">
                Live desktop app walkthrough
              </p>
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
