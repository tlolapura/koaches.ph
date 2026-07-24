"use client";

import { useEffect, useState } from "react";
import type { Session } from "@/lib/koaches/types";
import { updateSessionNotesAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions, patchCachedSession } from "@/lib/koaches/queries/invalidate";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachButton } from "@/components/koaches/coach/CoachButton";

type SessionNotesCardProps = {
  session: Session;
};

export function SessionNotesCard({ session }: SessionNotesCardProps) {
  const { showToast } = useCoachToast();
  const [notes, setNotes] = useState(session.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(session.notes ?? "");
  }, [session.id, session.notes]);

  const trimmed = notes.trim();
  const saved = (session.notes ?? "").trim();
  const dirty = trimmed !== saved;

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const next = trimmed || undefined;
      await updateSessionNotesAction(session.id, trimmed);
      patchCachedSession(session.coachId, session.id, { notes: next });
      invalidateCoachSessions(session.coachId);
      showToast(next ? "Notes saved" : "Notes cleared");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not save notes", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="coach-card p-4">
      <label className="coach-label" htmlFor={`session-notes-${session.id}`}>
        Notes
      </label>
      <p className="mt-0.5 text-xs text-[#6B7280]">
        Court number, gate code, reminders — anything for this session.
      </p>
      <textarea
        id={`session-notes-${session.id}`}
        className="coach-input mt-3 min-h-[88px] resize-none"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Court 3 · near the café"
      />
      <CoachButton
        type="button"
        className="mt-3"
        disabled={!dirty}
        loading={saving}
        loadingLabel="Saving…"
        onClick={() => void save()}
      >
        Save notes
      </CoachButton>
    </div>
  );
}
