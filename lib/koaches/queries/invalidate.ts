import { getQueryClient } from "@/lib/koaches/queries/client";
import { coachKeys } from "@/lib/koaches/queries/keys";
import type { CoachProfile } from "@/lib/koaches/types";

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

export function invalidateCoachProfile(coachId: string) {
  void getQueryClient().invalidateQueries({
    queryKey: [...coachKeys.all, "profile", coachId],
  });
}

export function setCoachProfileCache(coachId: string, coach: CoachProfile) {
  getQueryClient().setQueryData([...coachKeys.all, "profile", coachId], coach);
}

/** Drop all cached coach portal data — call on sign-out or before a new login. */
export function clearCoachPortalCache() {
  getQueryClient().removeQueries({ queryKey: coachKeys.all });
}
