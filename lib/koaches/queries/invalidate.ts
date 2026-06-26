import { getQueryClient } from "@/lib/koaches/queries/client";
import { coachKeys } from "@/lib/koaches/queries/keys";

export function invalidateCoachSessions(coachId: string) {
  void getQueryClient().invalidateQueries({ queryKey: coachKeys.sessions(coachId) });
  window.dispatchEvent(new Event("koaches-sessions-updated"));
}

export function invalidateCoachStudents(coachId: string) {
  void getQueryClient().invalidateQueries({ queryKey: coachKeys.students(coachId) });
  void getQueryClient().invalidateQueries({ queryKey: coachKeys.students(coachId, true) });
  window.dispatchEvent(new Event("koaches-roster-updated"));
}

export function invalidateCoachPrograms(coachId: string) {
  void getQueryClient().invalidateQueries({ queryKey: coachKeys.programs(coachId) });
}

export function invalidateCoachProgram(programId: string) {
  void getQueryClient().invalidateQueries({ queryKey: coachKeys.program(programId) });
}
