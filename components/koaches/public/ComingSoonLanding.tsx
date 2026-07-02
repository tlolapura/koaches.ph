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

        <p className="mt-8 text-base leading-relaxed text-[#6B7280]">Public marketplace is coming soon.</p>

        <p className="mt-4 text-sm text-[#9CA3AF]">
          We&apos;re getting things ready for players. Coaches can already explore and apply.
        </p>

        <div className="mx-auto mt-8 flex w-full max-w-xs flex-col gap-2.5">
          <Link href="/for-coaches" className="coach-btn-primary gap-2">
            New coach? See how it works
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/coach/login" className="coach-btn-outline">
            Coach login
          </Link>
        </div>

        <p className="sr-only">{BRAND_NAME}</p>
      </div>
    </div>
  );
}
