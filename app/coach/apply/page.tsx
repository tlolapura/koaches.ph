import { CoachApplyShell } from "@/components/koaches/coach/CoachApplyPage";

export default function CoachApplyRoute() {
  return (
    <CoachApplyShell
      backHref="/coach/login"
      backLabel="Back to sign in"
      successHref="/coach/login"
      successCta="Back to sign in"
    />
  );
}
