"use client";

import { CoachStepper } from "@/components/koaches/coach/CoachStepper";
import {
  SESSION_DETAIL_STEPS,
  type SessionDetailStep,
} from "@/lib/koaches/session-detail-steps";

type SessionDetailStepperProps = {
  step: SessionDetailStep;
  onStep: (step: SessionDetailStep) => void;
  ratingsUnlocked: boolean;
};

export function SessionDetailStepper({ step, onStep, ratingsUnlocked }: SessionDetailStepperProps) {
  const steps = SESSION_DETAIL_STEPS.map((s) =>
    s.id !== "session" ? { ...s, disabled: !ratingsUnlocked } : s
  );

  return (
    <CoachStepper
      className="mt-4"
      variant="compact"
      steps={steps}
      currentStepId={step === "complete" ? "feedback" : step}
      onStepChange={(id) => onStep(id as SessionDetailStep)}
      hint={!ratingsUnlocked ? "Mark the session done to unlock skill ratings" : undefined}
    />
  );
}
