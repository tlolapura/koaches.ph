"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useCoachStudent } from "@/hooks/useCoachStudents";
import { StudentProfileView } from "@/components/koaches/coach/StudentProfileView";
import { CoachDetailSkeleton } from "@/components/koaches/coach/CoachSkeletons";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { student, loading } = useCoachStudent(id);

  if (loading) return <CoachDetailSkeleton />;

  if (!student) notFound();

  return <StudentProfileView student={student} />;
}
