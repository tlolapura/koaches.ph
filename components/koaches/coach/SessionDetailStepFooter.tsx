"use client";

import type { ReactNode } from "react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";

type SessionDetailStepFooterProps = {
  onBack?: () => void;
  backLabel?: string;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  nextLoadingLabel?: ReactNode;
  nextIcon?: ReactNode;
};

function FooterButtons({
  onBack,
  backLabel,
  onNext,
  nextLabel,
  nextDisabled,
  nextLoading,
  nextLoadingLabel,
  nextIcon,
}: SessionDetailStepFooterProps) {
  if (onBack) {
    return (
      <div className="flex gap-3">
        <CoachButton type="button" variant="outline" className="flex-1" onClick={onBack}>
          {backLabel}
        </CoachButton>
        <CoachButton
          type="button"
          className="flex-[2]"
          disabled={nextDisabled}
          loading={nextLoading}
          loadingLabel={nextLoadingLabel}
          onClick={onNext}
        >
          {nextIcon}
          {nextLabel}
        </CoachButton>
      </div>
    );
  }

  return (
    <CoachButton
      type="button"
      className="w-full"
      disabled={nextDisabled}
      loading={nextLoading}
      loadingLabel={nextLoadingLabel}
      onClick={onNext}
    >
      {nextIcon}
      {nextLabel}
    </CoachButton>
  );
}

export function SessionDetailStepFooter(props: SessionDetailStepFooterProps) {
  return (
    <div className="coach-session-step-footer">
      <FooterButtons {...props} backLabel={props.backLabel ?? "Back"} nextLabel={props.nextLabel ?? "Continue"} />
    </div>
  );
}
