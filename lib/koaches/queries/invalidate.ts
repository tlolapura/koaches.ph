import { getQueryClient } from "@/lib/koaches/queries/client";
import { coachKeys } from "@/lib/koaches/queries/keys";
import type { CoachProfile, Session } from "@/lib/koaches/types";

function sessionDetailKey(sessionId: string) {
  return [...coachKeys.all, "session", sessionId] as const;
}

/** Patch a session in list + detail caches so UI updates immediately. */
export function patchCachedSession(
  coachId: string,
  sessionId: string,
  patch: Partial<Session>
) {
  const qc = getQueryClient();
  qc.setQueryData<Session | null>(sessionDetailKey(sessionId), (old) =>
    old ? { ...old, ...patch } : old
  );
  qc.setQueryData<Session[]>(coachKeys.sessions(coachId), (old) =>
    old?.map((s) => (s.id === sessionId ? { ...s, ...patch } : s))
  );
}

/** Insert or replace a session in caches (e.g. after create). */
export function upsertCachedSession(session: Session) {
  const qc = getQueryClient();
  qc.setQueryData(sessionDetailKey(session.id), session);
  qc.setQueryData<Session[]>(coachKeys.sessions(session.coachId), (old) => {
    if (!old) return [session];
    const idx = old.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      const next = old.slice();
      next[idx] = session;
      return next;
    }
    return [...old, session];
  });
}

export function invalidateCoachSessions(coachId: string) {
  const qc = getQueryClient();
  void qc.invalidateQueries({ queryKey: coachKeys.sessions(coachId) });
  // Detail pages use a separate key — keep them in sync too.
  void qc.invalidateQueries({ queryKey: [...coachKeys.all, "session"] });
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
