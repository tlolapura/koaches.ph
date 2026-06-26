import { Suspense } from "react";
import { CoachBillingPage } from "@/components/koaches/coach/CoachBillingPage";
import { CoachBillingSkeleton } from "@/components/koaches/coach/CoachSkeletons";

export default function BillingRoute() {
  return (
    <Suspense fallback={<CoachBillingSkeleton />}>
      <CoachBillingPage />
    </Suspense>
  );
}
