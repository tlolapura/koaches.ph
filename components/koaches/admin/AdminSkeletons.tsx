"use client";

import {
  CoachCardListSkeleton,
  CoachPageHeaderSkeleton,
} from "@/components/koaches/coach/CoachSkeletons";
import { AdminPageShell } from "@/components/koaches/admin/AdminPageLayout";
import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#E5E7EB]/80", className)} aria-hidden />;
}

export function AdminDashboardSkeleton() {
  return (
    <AdminPageShell wide>
      <CoachPageHeaderSkeleton className="mb-6" />
      <Bone className="h-28 w-full rounded-2xl" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Bone className="h-28 rounded-2xl" />
        <Bone className="h-28 rounded-2xl" />
        <Bone className="h-28 rounded-2xl" />
        <Bone className="h-28 rounded-2xl" />
      </div>
      <Bone className="mt-6 h-64 w-full rounded-2xl" />
      <CoachCardListSkeleton count={3} className="mt-6" />
    </AdminPageShell>
  );
}

export function AdminApplicationListSkeleton() {
  return (
    <AdminPageShell>
      <CoachPageHeaderSkeleton className="mb-6" />
      <div className="flex gap-2">
        <Bone className="h-11 w-24 rounded-full" />
        <Bone className="h-11 w-28 rounded-full" />
        <Bone className="h-11 w-24 rounded-full" />
      </div>
      <CoachCardListSkeleton count={3} className="mt-6" />
    </AdminPageShell>
  );
}

export function AdminCoachesListSkeleton() {
  return (
    <AdminPageShell>
      <div className="mb-6 flex items-start justify-between gap-4">
        <CoachPageHeaderSkeleton />
        <Bone className="h-11 w-28 shrink-0 rounded-xl" />
      </div>
      <CoachCardListSkeleton count={4} />
    </AdminPageShell>
  );
}

export function AdminRouteLoading() {
  return <AdminDashboardSkeleton />;
}
