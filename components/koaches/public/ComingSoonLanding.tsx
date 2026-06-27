import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME } from "@/lib/koaches/constants";

export function ComingSoonLanding() {
  return (
    <div className="coach-portal relative flex min-h-dvh flex-col bg-white">
      <PickleballBallBackdrop variant="landing" />
      <section className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-sm">
          <div className="flex justify-center">
            <KoachesWordmark size="lg" />
          </div>

          <p className="mt-8 text-base leading-relaxed text-[#6B7280] sm:text-lg">
            Pickleball coaching for the Philippines. We&apos;re getting the court ready.
          </p>

          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#FAFAF8] px-4 py-4 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Coming soon
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
              A public coach directory where players can browse coaches, view programs, and book
              sessions — all in one place.
            </p>
          </div>

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
