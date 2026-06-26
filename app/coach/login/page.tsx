import { Suspense } from "react";
import { CoachLoginPage } from "@/components/koaches/coach/CoachLoginPage";

export default function CoachLoginRoute() {
  return (
    <Suspense fallback={null}>
      <CoachLoginPage />
    </Suspense>
  );
}
