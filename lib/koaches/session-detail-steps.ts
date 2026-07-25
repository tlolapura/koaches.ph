export type SessionDetailStep =
  | "session"
  | "coverage"
  | "ratings"
  | "feedback"
  | "complete";

export const SESSION_DETAIL_STEPS = [
  { id: "session" as const, label: "Session", description: "Payment & notes" },
  { id: "coverage" as const, label: "Worked on", description: "Pick the skills" },
  { id: "ratings" as const, label: "How they did", description: "Start vs. end" },
  { id: "feedback" as const, label: "Message", description: "Optional note" },
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
