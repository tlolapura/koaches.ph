import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { FacebookIcon, InstagramIcon } from "@/components/koaches/shared/SocialIcons";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { BRAND_NAME, BRAND_SOCIAL } from "@/lib/koaches/constants";

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

        <div className="mt-10 flex items-center justify-center gap-3">
          <a
            href={BRAND_SOCIAL.facebook.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1D4ED8] transition-colors hover:bg-[#DBEAFE]"
            aria-label={`${BRAND_NAME} on Facebook`}
          >
            <FacebookIcon className="h-4 w-4" />
          </a>
          <a
            href={BRAND_SOCIAL.instagram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F0FDF4] text-[#166534] transition-colors hover:bg-[#DCFCE7]"
            aria-label={`${BRAND_NAME} on Instagram`}
          >
            <InstagramIcon className="h-4 w-4" />
          </a>
        </div>
        <p className="mt-2 text-xs text-[#9CA3AF]">@{BRAND_SOCIAL.instagram.handle}</p>

        <p className="sr-only">{BRAND_NAME}</p>
      </div>
    </div>
  );
}
