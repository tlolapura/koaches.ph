import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_NAME, SITE_TAGLINE } from "@/lib/koaches/constants";

export function ComingSoonLanding() {
  return (
    <div className="coach-portal flex min-h-dvh flex-col bg-[#FAFAF8]">
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1E3A5F] via-[#264a73] to-[#1a3352]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#E07A5F]/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[#6B9E78]/25 blur-3xl"
          aria-hidden
        />

        <div className="relative max-w-sm">
          <p className="font-heading text-2xl font-bold tracking-tight sm:text-3xl" aria-label={BRAND_NAME}>
            <span className="text-[#E07A5F]">Koaches</span>
            <span className="text-white">PH</span>
          </p>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FDE047]">
            Coming soon
          </p>
          <h1 className="font-heading mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Pickleball coaching for the Philippines. We&apos;re getting the court ready.
          </p>

          <Link href="/coach/login" className="coach-btn-primary mx-auto mt-8 max-w-xs gap-2">
            Coach login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
