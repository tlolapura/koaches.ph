"use client";

import { CoachPageHeaderSkeleton } from "@/components/koaches/coach/CoachSkeletons";
import {
  AdminPageShell,
  adminListClass,
} from "@/components/koaches/admin/AdminPageLayout";
import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#E5E7EB]/80", className)} aria-hidden />;
}

function AdminListSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn(adminListClass, className)}>
      <ul className="divide-y divide-[#F3F4F6]">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="flex items-center gap-3 px-3.5 py-3 sm:px-4">
            <Bone className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-3.5 w-36 max-w-full" />
              <Bone className="h-3 w-48 max-w-full" />
            </div>
            <Bone className="h-3.5 w-12 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <AdminPageShell>
      <CoachPageHeaderSkeleton className="mb-6" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
      </div>
      <Bone className="mt-4 h-56 w-full rounded-2xl" />
      <AdminListSkeleton count={4} className="mt-4" />
    </AdminPageShell>
  );
}

export function AdminApplicationListSkeleton() {
  return (
    <AdminPageShell>
      <CoachPageHeaderSkeleton className="mb-6" />
      <div className="flex gap-2">
        <Bone className="h-9 w-20 rounded-full" />
        <Bone className="h-9 w-24 rounded-full" />
        <Bone className="h-9 w-20 rounded-full" />
      </div>
      <AdminListSkeleton count={5} className="mt-5" />
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
      <Bone className="mb-5 h-11 w-full rounded-xl" />
      <AdminListSkeleton count={8} />
    </AdminPageShell>
  );
}

export function AdminRouteLoading() {
  return <AdminDashboardSkeleton />;
}
