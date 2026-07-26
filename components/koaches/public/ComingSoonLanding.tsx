"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { FacebookIcon, InstagramIcon } from "@/components/koaches/shared/SocialIcons";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME, BRAND_SOCIAL } from "@/lib/koaches/constants";

function SocialLinks({
  stacked = false,
  className = "",
}: {
  stacked?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        stacked
          ? `flex flex-col items-center gap-2 ${className}`
          : `flex items-center gap-2.5 ${className}`
      }
    >
      <a
        href={BRAND_SOCIAL.facebook.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1D4ED8] shadow-sm ring-1 ring-[#E5E7EB] transition-colors hover:bg-[#EFF6FF]"
        aria-label={`${BRAND_NAME} on Facebook`}
      >
        <FacebookIcon className="h-4 w-4" />
      </a>
      <a
        href={BRAND_SOCIAL.instagram.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#166534] shadow-sm ring-1 ring-[#E5E7EB] transition-colors hover:bg-[#F0FDF4]"
        aria-label={`${BRAND_NAME} on Instagram`}
      >
        <InstagramIcon className="h-4 w-4" />
      </a>
    </div>
  );
}

export function ComingSoonLanding() {
  return (
    <div className="coach-portal relative flex min-h-dvh flex-col overflow-hidden bg-white text-[#111827]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ECFDF5] via-white to-[#EFF6FF]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-0 h-[55%] w-[55%] rounded-full bg-[#4F8FF7]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-[45%] w-[50%] rounded-full bg-[#16A34A]/12 blur-3xl"
        aria-hidden
      />
      <PickleballBallBackdrop variant="landing" className="opacity-80" />

      {/* Mobile: stacked icons, bottom-right */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[2] lg:hidden"
      >
        <SocialLinks stacked />
      </motion.div>

      <div className="relative z-[1] mx-auto flex w-full max-w-6xl flex-1 flex-col lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="flex flex-1 flex-col justify-center px-6 pb-2 pt-[max(2rem,env(safe-area-inset-top))] sm:px-10 lg:px-12 lg:pb-12 lg:pt-12">
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
            className="mt-8 max-w-md sm:mt-10"
          >
            <h1 className="font-heading text-[clamp(1.85rem,5.5vw,3rem)] font-bold leading-[1.12] tracking-tight text-[#111827]">
              Built for pickleball coaches.
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#4B5563] sm:text-lg">
              Run students, sessions, and progress in one place.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-2.5">
              <Link href="/for-coaches" className="coach-btn-primary min-h-[48px] gap-2">
                I&apos;m a coach. Show me how
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/coach/login" className="coach-btn-outline min-h-[48px]">
                Coach login
              </Link>
            </div>

            <p className="mt-5 text-sm text-[#9CA3AF]">Player marketplace coming soon</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-10 hidden items-center gap-3 lg:mt-14 lg:flex"
          >
            <SocialLinks />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
          className="relative mt-auto flex items-end justify-center lg:min-h-0 lg:items-end lg:justify-end"
        >
          <Image
            src="/illustrations/coaches.webp"
            alt="Pickleball coaches using PickleKoach"
            width={900}
            height={900}
            className="pointer-events-none h-auto max-h-[42vh] w-full max-w-none object-contain object-bottom sm:max-h-[46vh] lg:h-[min(88dvh,720px)] lg:max-h-none lg:w-auto lg:max-w-none lg:translate-x-4"
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
