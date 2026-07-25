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
  /** Optional secondary action rendered above the main buttons (e.g. "Add a message"). */
  secondary?: { label: string; onClick: () => void; disabled?: boolean };
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
      {props.secondary ? (
        <CoachButton
          type="button"
          variant="outline"
          className="mb-2 w-full"
          disabled={props.secondary.disabled}
          onClick={props.secondary.onClick}
        >
          {props.secondary.label}
        </CoachButton>
      ) : null}
      <FooterButtons {...props} backLabel={props.backLabel ?? "Back"} nextLabel={props.nextLabel ?? "Continue"} />
    </div>
  );
}
