import { CoachApplyShell } from "@/components/koaches/coach/CoachApplyPage";

export default function CoachApplyRoute() {
  return (
    <CoachApplyShell
      backHref="/coach/login"
      backLabel="Sign in"
      successHref="/coach/login"
      successCta="Sign in"
    />
  );
}
