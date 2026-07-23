"use client";

import { useEffect, useMemo, useState } from "react";
import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useStudentSessionsWithProgress } from "@/hooks/useCoachSessions";
import { buildStudentProgressHistory } from "@/lib/koaches/student-progress";

export function useStudentProgressHistory(studentId: string) {
  const coachId = usePortalCoachId();
  const { sessions } = useStudentSessionsWithProgress(coachId, studentId);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener("koaches-session-progress-updated", refresh);
    return () => window.removeEventListener("koaches-session-progress-updated", refresh);
  }, []);

  return useMemo(
    () => buildStudentProgressHistory(sessions, studentId),
    [sessions, studentId, tick]
  );
}
