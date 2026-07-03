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

export function SessionDetailStepFooter({
  onBack,
  backLabel = "Back",
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  nextLoading,
  nextLoadingLabel,
  nextIcon,
}: SessionDetailStepFooterProps) {
  if (onBack) {
    return (
      <div className="coach-session-step-footer">
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
      </div>
    );
  }

  return (
    <div className="coach-session-step-footer">
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
    </div>
  );
}
