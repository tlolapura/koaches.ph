import { Suspense } from "react";
import { CoachSchedulePage } from "@/components/koaches/coach/CoachSchedulePage";

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <CoachSchedulePage />
    </Suspense>
  );
}
