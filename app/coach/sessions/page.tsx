import { Suspense } from "react";
import { CoachSchedulePage } from "@/components/koaches/coach/CoachSchedulePage";

import { CoachScheduleSkeleton } from "@/components/koaches/coach/CoachSkeletons";

export default function SchedulePage() {
  return (
    <Suspense fallback={<CoachScheduleSkeleton />}>
      <CoachSchedulePage />
    </Suspense>
  );
}
