"use client";

import { cn } from "@/lib/utils";
import { CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[#E5E7EB]/80", className)} aria-hidden />;
}

/** Matches CoachPageHeader — visible on mobile so loaders don’t look empty under the sticky header. */
export function CoachPageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("coach-page-header space-y-2", className)}>
      <Bone className="hidden h-8 w-44 md:block" />
      <Bone className="hidden h-4 w-72 max-w-full md:block" />
      {/* Mobile already has sticky title; reserve a short subtitle-sized spacer on small screens */}
      <Bone className="h-3 w-48 max-w-[70%] md:hidden" />
    </div>
  );
}

export function CoachCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("coach-card flex min-h-[88px] items-start gap-3 p-4", className)}>
      <Bone className="h-12 w-12 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2.5 pt-0.5">
        <Bone className="h-4 w-[55%]" />
        <Bone className="h-3.5 w-[75%]" />
        <Bone className="h-3 w-[40%]" />
      </div>
    </div>
  );
}

export function CoachCardListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }, (_, i) => (
        <CoachCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CoachDashboardSkeleton() {
  return (
    <CoachPageShell>
      <div className="space-y-2 md:hidden">
        <Bone className="h-7 w-40" />
        <Bone className="h-4 w-56" />
      </div>
      <CoachPageHeaderSkeleton className="max-md:hidden" />
      <Bone className="mt-6 h-32 w-full rounded-2xl" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Bone className="h-24 rounded-2xl" />
        <Bone className="h-24 rounded-2xl" />
        <Bone className="h-24 rounded-2xl" />
      </div>
      <Bone className="mt-8 h-5 w-36" />
      <CoachCardListSkeleton count={2} className="mt-3" />
      <Bone className="mt-8 h-5 w-28" />
      <CoachCardListSkeleton count={3} className="mt-3" />
    </CoachPageShell>
  );
}

export function CoachProgramListSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-5 h-[72px] w-full rounded-2xl" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Bone className="h-[88px] rounded-2xl" />
        <Bone className="h-[88px] rounded-2xl" />
      </div>
      <Bone className="mt-8 h-5 w-36" />
      <CoachCardListSkeleton count={3} className="mt-3" />
    </CoachPageShell>
  );
}

export function CoachClinicListSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="coach-card min-h-[108px] space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className="h-5 w-[55%]" />
                <Bone className="h-3.5 w-[40%]" />
                <Bone className="h-3 w-[70%]" />
              </div>
              <Bone className="h-6 w-14 shrink-0 rounded-full" />
            </div>
            <Bone className="h-4 w-28" />
          </div>
        ))}
      </div>
    </CoachPageShell>
  );
}

export function CoachStudentListSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-4 h-12 w-full rounded-xl" />
      <div className="mt-3 flex gap-2">
        <Bone className="h-9 w-16 rounded-full" />
        <Bone className="h-9 w-14 rounded-full" />
        <Bone className="h-9 w-20 rounded-full" />
      </div>
      <CoachCardListSkeleton count={5} className="mt-4" />
    </CoachPageShell>
  );
}

export function CoachReportsSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <div className="mt-4 flex gap-2">
        <Bone className="h-11 w-24 rounded-full" />
        <Bone className="h-11 w-28 rounded-full" />
        <Bone className="h-11 w-20 rounded-full" />
      </div>
      <Bone className="mt-4 h-36 w-full rounded-2xl" />
      <Bone className="mt-3 h-48 w-full rounded-2xl" />
      <Bone className="mt-3 h-44 w-full rounded-2xl" />
      <Bone className="mt-8 h-5 w-28" />
      <div className="coach-card mt-3 grid grid-cols-3 divide-x divide-[#E5E7EB] p-0">
        <Bone className="m-3 h-14 rounded-xl" />
        <Bone className="m-3 h-14 rounded-xl" />
        <Bone className="m-3 h-14 rounded-xl" />
      </div>
      <Bone className="mt-8 h-5 w-28" />
      <CoachCardListSkeleton count={3} className="mt-3" />
    </CoachPageShell>
  );
}

export function CoachScheduleSkeleton() {
  return (
    <CoachPageShell className="max-md:px-3">
      <CoachPageHeaderSkeleton />
      <Bone className="mt-3 h-11 w-full rounded-xl md:mt-6" />
      <div className="mt-4 space-y-2 md:hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="grid grid-cols-[44px_1fr] items-center gap-2">
            <Bone className="h-3 w-8 justify-self-end" />
            <Bone className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Bone className="mt-4 hidden h-80 w-full rounded-2xl md:block" />
    </CoachPageShell>
  );
}

export function CoachDetailSkeleton() {
  return (
    <CoachPageShell>
      <Bone className="h-5 w-28" />
      <Bone className="mt-4 h-8 w-48" />
      <Bone className="mt-2 h-4 w-36" />
      <div className="coach-card mt-4 space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Bone className="h-7 w-24 rounded-full" />
          <Bone className="h-7 w-20 rounded-full" />
          <Bone className="h-7 w-16 rounded-full" />
        </div>
        <Bone className="h-4 w-40" />
        <Bone className="h-6 w-32" />
        <Bone className="h-16 w-full" />
        <div className="flex gap-2 pt-1">
          <Bone className="h-10 w-28 rounded-xl" />
          <Bone className="h-10 w-28 rounded-xl" />
        </div>
      </div>
      <Bone className="mt-5 h-11 w-full rounded-xl" />
      <CoachCardListSkeleton count={3} className="mt-4" />
    </CoachPageShell>
  );
}

export function CoachProfileSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <div className="coach-card mt-6 overflow-hidden p-5 sm:p-6">
        <div className="flex gap-4 sm:gap-6">
          <Bone className="h-[7.5rem] w-[7.5rem] shrink-0 rounded-2xl sm:h-36 sm:w-36" />
          <div className="min-w-0 flex-1 space-y-3">
            <Bone className="h-3 w-20" />
            <Bone className="h-8 w-40" />
            <Bone className="h-16 w-full" />
            <Bone className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Bone key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </CoachPageShell>
  );
}

export function CoachBillingSkeleton() {
  return (
    <CoachPageShell className="pb-8">
      <CoachPageHeaderSkeleton />
      <Bone className="mt-6 h-28 w-full rounded-xl" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Bone className="h-24 rounded-2xl" />
        <Bone className="h-24 rounded-2xl" />
        <Bone className="h-24 rounded-2xl" />
      </div>
      <Bone className="mt-6 h-32 w-full rounded-2xl" />
      <Bone className="mt-6 h-5 w-28" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Bone className="h-48 rounded-2xl" />
        <Bone className="h-48 rounded-2xl" />
      </div>
      <Bone className="mt-6 h-56 w-full rounded-2xl" />
    </CoachPageShell>
  );
}

export function CoachSocialSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Bone className="h-32 rounded-2xl" />
        <Bone className="h-32 rounded-2xl" />
      </div>
      <Bone className="mt-4 h-12 w-full rounded-xl" />
      <Bone className="mt-4 aspect-[9/16] w-full max-w-sm rounded-2xl" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Bone className="h-12 rounded-xl" />
        <Bone className="h-12 rounded-xl" />
      </div>
    </CoachPageShell>
  );
}

export function CoachProgressSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <CoachCardListSkeleton count={4} className="mt-6" />
    </CoachPageShell>
  );
}

/** Generic shell pulse — avoids showing dashboard layout on every route change */
export function CoachRouteLoading() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-6 h-36 w-full rounded-2xl" />
      <CoachCardListSkeleton count={3} className="mt-6" />
    </CoachPageShell>
  );
}
