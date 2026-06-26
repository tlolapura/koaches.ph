import type { Metadata } from "next";
import { CoachApplyShell } from "@/components/koaches/coach/CoachApplyPage";

export const metadata: Metadata = {
  title: "Apply as a Coach",
  description: "Join KoachesPH and manage your students, programs, and progress tracking in one place.",
};

export default function ApplyPage() {
  return (
    <CoachApplyShell
      backHref="/"
      backLabel="Back home"
      successHref="/"
      successCta="Back home"
    />
  );
}
