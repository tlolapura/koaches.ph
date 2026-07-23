"use client";

import dynamic from "next/dynamic";

export const CoachEarningsTrendChart = dynamic(
  () =>
    import("@/components/koaches/coach/CoachReportCharts").then(
      (m) => m.CoachEarningsTrendChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-44 animate-pulse rounded-xl bg-[#E5E7EB]/60 sm:h-52" />,
  }
);

export const CoachRevenueMixChart = dynamic(
  () =>
    import("@/components/koaches/coach/CoachReportCharts").then(
      (m) => m.CoachRevenueMixChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-44 animate-pulse rounded-xl bg-[#E5E7EB]/60" />,
  }
);

export const CoachStudentsByLevelChart = dynamic(
  () =>
    import("@/components/koaches/coach/CoachReportCharts").then(
      (m) => m.CoachStudentsByLevelChart
    ),
  {
    ssr: false,
    loading: () => <div className="h-44 animate-pulse rounded-xl bg-[#E5E7EB]/60" />,
  }
);
