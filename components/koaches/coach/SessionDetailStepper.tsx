"use client";

import { CoachStepper } from "@/components/koaches/coach/CoachStepper";
import {
  SESSION_DETAIL_STEPS,
  type SessionDetailStep,
} from "@/lib/koaches/session-detail-steps";

type SessionDetailStepperProps = {
  step: SessionDetailStep;
  ratingsUnlocked: boolean;
};

export function SessionDetailStepper({ step, ratingsUnlocked }: SessionDetailStepperProps) {
  const steps = SESSION_DETAIL_STEPS.map((s) =>
    s.id !== "session" ? { ...s, disabled: !ratingsUnlocked } : s
  );

  return (
    <CoachStepper
      className="mt-4"
      steps={steps}
      currentStepId={step === "complete" ? "feedback" : step}
      hint={!ratingsUnlocked ? "Mark the session done first, then you can rate skills" : undefined}
    />
  );
}
