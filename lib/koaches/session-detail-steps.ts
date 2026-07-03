export type SessionDetailStep =
  | "session"
  | "coverage"
  | "ratings"
  | "feedback"
  | "complete";

export const SESSION_DETAIL_STEPS = [
  { id: "session" as const, label: "Session", description: "Wrap-up & payment" },
  { id: "coverage" as const, label: "Coverage", description: "Skills covered" },
  { id: "ratings" as const, label: "Ratings", description: "Before & after" },
  { id: "feedback" as const, label: "Feedback", description: "Notes for player" },
];

export type SessionRatingStep = Extract<
  SessionDetailStep,
  "coverage" | "ratings" | "feedback" | "complete"
>;

export function isSessionRatingStep(step: SessionDetailStep): step is SessionRatingStep {
  return step === "coverage" || step === "ratings" || step === "feedback" || step === "complete";
}

const FLOW_STEPS: SessionDetailStep[] = ["session", "coverage", "ratings", "feedback"];

export function previousSessionDetailStep(step: SessionDetailStep): SessionDetailStep | null {
  const index = FLOW_STEPS.indexOf(step);
  if (index <= 0) return null;
  return FLOW_STEPS[index - 1] ?? null;
}
