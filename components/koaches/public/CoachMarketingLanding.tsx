"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChartLine,
  ClipboardList,
  CreditCard,
  QrCode,
  UserPlus,
  Users,
} from "lucide-react";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME } from "@/lib/koaches/constants";

const FEATURE_PILLS = [
  {
    icon: Users,
    text: "Student roster and intake",
  },
  {
    icon: CalendarDays,
    text: "Schedule and program sessions",
  },
  {
    icon: CreditCard,
    text: "Payments and cash tips",
  },
  {
    icon: ChartLine,
    text: "Progress tracking and reports",
  },
] as const;

const APP_STEPS = [
  {
    id: "roster",
    step: "Step 1",
    label: "Roster",
    title: "Set up your roster",
    body: "Share your join link or QR. Players sign up, submit waivers, and land in your roster.",
    icon: Users,
    bullets: ["Approve new signups", "Store player details", "Waiver-first intake flow"],
  },
  {
    id: "schedule",
    step: "Step 2",
    label: "Schedule",
    title: "Book sessions fast",
    body: "Add sessions with conflict-safe time slots, set duration, payment status, and tips.",
    icon: CalendarDays,
    bullets: ["Conflict-safe time picker", "Duration and tip tracking", "Weekly and monthly overview"],
  },
  {
    id: "programs",
    step: "Step 3",
    label: "Programs",
    title: "Run programs like a pro",
    body: "Track package sessions, player progress, and what still needs to be scheduled.",
    icon: ClipboardList,
    bullets: ["Bundle by package", "Track session numbers", "See completion status quickly"],
  },
  {
    id: "grow",
    step: "Step 4",
    label: "Growth",
    title: "Grow and retain clients",
    body: "Send progress cards and keep your week organized with dashboard insights.",
    icon: ChartLine,
    bullets: ["Progress cards for players", "Reports that show momentum", "Keep clients coming back"],
  },
] as const;

export function CoachMarketingLanding() {
  return (
    <div className="coach-portal relative min-h-dvh overflow-hidden bg-[#FAFAF8] text-[#111827]">
      <PickleballBallBackdrop variant="landing" className="opacity-50" />
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-0 pt-6 sm:px-6 sm:pb-0">
          <Link href="/" className="w-fit text-xs font-semibold text-[#6B7280] hover:text-[#111827]">
            ← Home
          </Link>

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
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
            What coaches can do inside
          </p>
          <h2 className="font-heading mt-1 text-2xl font-bold">Interactive app walkthrough</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            A simple product tour, like modern SaaS pages: scroll and see what each part of the app does.
          </p>

          <div className="mt-5 space-y-4">
            {APP_STEPS.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] p-3 sm:p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
                  <div className="rounded-xl border border-dashed border-[#C7D2FE] bg-white p-3">
                    <div className="flex aspect-[9/17] w-full items-center justify-center rounded-lg bg-[#F8FAFC] text-center">
                      <div>
                        <p className="font-heading text-sm font-semibold text-[#111827]">Screenshot placeholder</p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                          Replace with actual app screen for
                          <br />
                          <span className="font-semibold">{step.title}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] text-white">
                        <step.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                          {step.step} · {step.label}
                        </p>
                        <p className="font-heading text-lg font-semibold text-[#111827]">{step.title}</p>
                        <p className="mt-1 text-sm text-[#6B7280]">{step.body}</p>
                      </div>
                    </div>
                    <ul className="mt-4 space-y-2.5">
                      {step.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#16A34A]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E5E7EB] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {FEATURE_PILLS.map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FAFAF8] px-3 py-1.5 text-xs font-semibold text-[#374151]"
              >
                <item.icon className="h-3.5 w-3.5 text-[#16A34A]" />
                {item.text}
              </span>
            ))}
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
    </div>
  );
}
