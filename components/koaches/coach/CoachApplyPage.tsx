"use client";

import { KoachesLogo } from "@/components/koaches/KoachesLogo";
import { CoachApplicationWizard } from "@/components/koaches/shared/CoachApplicationWizard";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";

type CoachApplyShellProps = {
  backHref: string;
  backLabel: string;
  successHref: string;
  successCta: string;
};

export function CoachApplyShell({
  backHref,
  backLabel,
  successHref,
  successCta,
}: CoachApplyShellProps) {
  return (
    <div className="coach-portal relative flex min-h-dvh w-full flex-col bg-[#FAFAF8]">
      <PickleballBallBackdrop variant="login" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F0FDF4] opacity-80 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#EFF6FF] opacity-90 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg min-w-0 flex-1 flex-col px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mb-4 shrink-0">
          <KoachesLogo size="sm" />
        </div>

        <CoachApplicationWizard
          className="min-h-0 flex-1"
          backHref={backHref}
          backLabel={backLabel}
          successHref={successHref}
          successCta={successCta}
        />
      </div>
    </div>
  );
}
