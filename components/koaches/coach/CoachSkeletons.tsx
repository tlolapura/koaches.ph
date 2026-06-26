"use client";

import { cn } from "@/lib/utils";
import { CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#E5E7EB]/80", className)} aria-hidden />;
}

export function CoachPageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Bone className="h-7 w-40" />
      <Bone className="h-4 w-64 max-w-full" />
    </div>
  );
}

export function CoachCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("coach-card flex items-start gap-3 p-4", className)}>
      <Bone className="h-11 w-11 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bone className="h-4 w-2/5" />
        <Bone className="h-3 w-3/5" />
        <Bone className="h-3 w-1/3" />
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
      <CoachPageHeaderSkeleton />
      <Bone className="mt-6 h-28 w-full rounded-2xl" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
      </div>
      <Bone className="mt-8 h-5 w-32" />
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
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Bone className="h-[72px] rounded-2xl" />
        <Bone className="h-[72px] rounded-2xl" />
      </div>
      <Bone className="mt-8 h-5 w-28" />
      <CoachCardListSkeleton count={3} className="mt-3" />
    </CoachPageShell>
  );
}

export function CoachStudentListSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-4 h-11 w-full rounded-xl" />
      <div className="mt-3 flex gap-2">
        <Bone className="h-9 w-16 rounded-full" />
        <Bone className="h-9 w-20 rounded-full" />
        <Bone className="h-9 w-24 rounded-full" />
      </div>
      <CoachCardListSkeleton count={4} className="mt-4" />
    </CoachPageShell>
  );
}

export function CoachScheduleSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-4 h-10 w-full rounded-xl" />
      <Bone className="mt-4 h-64 w-full rounded-2xl" />
      <CoachCardListSkeleton count={2} className="mt-6" />
    </CoachPageShell>
  );
}

export function CoachDetailSkeleton() {
  return (
    <CoachPageShell>
      <Bone className="h-4 w-24" />
      <Bone className="mt-4 h-36 w-full rounded-2xl" />
      <Bone className="mt-6 h-5 w-28" />
      <Bone className="mt-3 h-24 w-full rounded-2xl" />
      <CoachCardListSkeleton count={2} className="mt-6" />
    </CoachPageShell>
  );
}

export function CoachProfileSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-6 h-64 w-full rounded-2xl" />
      <CoachCardListSkeleton count={4} className="mt-4" />
    </CoachPageShell>
  );
}

export function CoachBillingSkeleton() {
  return (
    <CoachPageShell className="pb-8">
      <CoachPageHeaderSkeleton />
      <Bone className="mt-6 h-24 w-full rounded-xl" />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
      </div>
      <Bone className="mt-6 h-28 w-full rounded-2xl" />
      <Bone className="mt-6 h-5 w-24" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Bone className="h-44 rounded-2xl" />
        <Bone className="h-44 rounded-2xl" />
      </div>
      <Bone className="mt-6 h-56 w-full rounded-2xl" />
    </CoachPageShell>
  );
}

export function CoachSocialSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-5 h-20 w-full rounded-2xl" />
      <div className="mt-4 flex gap-2">
        <Bone className="h-10 w-28 rounded-full" />
        <Bone className="h-10 w-32 rounded-full" />
        <Bone className="h-10 w-24 rounded-full" />
      </div>
      <Bone className="mt-4 h-10 w-full rounded-xl" />
      <Bone className="mt-4 aspect-[9/16] w-full max-w-sm rounded-2xl" />
      <div className="mt-4 flex gap-2">
        <Bone className="h-11 flex-1 rounded-xl" />
        <Bone className="h-11 flex-1 rounded-xl" />
        <Bone className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
    </CoachPageShell>
  );
}

export function CoachProgressSkeleton() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <CoachCardListSkeleton count={3} className="mt-6" />
    </CoachPageShell>
  );
}

/** Generic shell pulse — avoids showing dashboard layout on every route change */
export function CoachRouteLoading() {
  return (
    <CoachPageShell>
      <CoachPageHeaderSkeleton />
      <Bone className="mt-6 h-32 w-full rounded-2xl" />
      <CoachCardListSkeleton count={2} className="mt-6" />
    </CoachPageShell>
  );
}
