import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME } from "@/lib/koaches/constants";

export function ComingSoonLanding() {
  return (
    <div className="coach-portal relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-white px-6 py-12 text-center">
      <PickleballBallBackdrop variant="landing" />
      <div className="relative z-[1] max-w-sm">
        <KoachesWordmark size="lg" className="mx-auto" />

        <p className="mt-8 text-base leading-relaxed text-[#6B7280]">
          Pickleball coaching for the Philippines.
        </p>

        <p className="mt-4 text-sm text-[#9CA3AF]">
          Public coach directory coming soon.
        </p>

        <Link href="/coach/login" className="coach-btn-primary mx-auto mt-8 max-w-xs gap-2">
          Coach login
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="sr-only">{BRAND_NAME}</p>
      </div>
    </div>
  );
}
