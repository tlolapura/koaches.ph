import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME, SITE_TAGLINE } from "@/lib/koaches/constants";

export function ComingSoonLanding() {
  return (
    <div className="coach-portal relative flex min-h-dvh flex-col bg-white">
      <PickleballBallBackdrop variant="landing" />
      <section className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-sm">
          <div className="flex justify-center">
            <KoachesWordmark size="lg" />
          </div>

          <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[#16A34A]">
            Coming soon
          </p>
          <h1 className="font-heading mt-3 text-3xl font-bold leading-tight text-[#111827] sm:text-4xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
            Pickleball coaching for the Philippines. We&apos;re getting the court ready.
          </p>

          <Link href="/coach/login" className="coach-btn-primary mx-auto mt-8 max-w-xs gap-2">
            Coach login
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="sr-only">{BRAND_NAME}</p>
        </div>
      </section>
    </div>
  );
}
