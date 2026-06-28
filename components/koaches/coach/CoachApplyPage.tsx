"use client";

import { CoachApplicationWizard } from "@/components/koaches/shared/CoachApplicationWizard";

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
    <CoachApplicationWizard
      backHref={backHref}
      backLabel={backLabel}
      successHref={successHref}
      successCta={successCta}
    />
  );
}
