export const coachKeys = {
  all: ["coach"] as const,
  sessions: (coachId: string) => [...coachKeys.all, "sessions", coachId] as const,
  students: (coachId: string, includeArchived?: boolean) =>
    [...coachKeys.all, "students", coachId, { includeArchived: !!includeArchived }] as const,
  student: (studentId: string) => [...coachKeys.all, "student", studentId] as const,
  programs: (coachId: string) => [...coachKeys.all, "programs", coachId] as const,
  program: (programId: string) => [...coachKeys.all, "program", programId] as const,
};
