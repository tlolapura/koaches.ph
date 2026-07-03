"use client";

import { CoachStepper } from "@/components/koaches/coach/CoachStepper";

const STEPS = [
  { id: "1", label: "Template", description: "Pick a story layout" },
  { id: "2", label: "Date", description: "Choose the day or week" },
];

type SocialStoryStepperProps = {
  step: 1 | 2;
  onStep: (step: 1 | 2) => void;
  canAccessStep2: boolean;
};

export function SocialStoryStepper({ step, onStep, canAccessStep2 }: SocialStoryStepperProps) {
  const steps = STEPS.map((s) =>
    s.id === "2" ? { ...s, disabled: !canAccessStep2 } : s
  );

  return (
    <CoachStepper
      steps={steps}
      currentStepId={String(step)}
      onStepChange={(id) => onStep(Number(id) as 1 | 2)}
    />
  );
}
