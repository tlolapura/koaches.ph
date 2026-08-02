"use client";

import { useEffect, useState } from "react";
import type { Session, SessionParticipant } from "@/lib/koaches/types";
import { updateSessionPlayersAction } from "@/lib/koaches/actions/sessions";
import { invalidateCoachSessions, patchCachedSession } from "@/lib/koaches/queries/invalidate";
import { resizeParticipants } from "@/lib/koaches/session-participants";
import { DEFAULT_SESSION_PRICING, formatSuggestedDropInHint, normalizeSessionPricing } from "@/lib/koaches/pricing";
import { suggestSessionPrice } from "@/lib/koaches/session-pricing";
import { parseTimeToMinutes } from "@/lib/koaches/session-time";
import { HOURLY_SESSION_MINUTES } from "@/lib/koaches/session-slots";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachStudents } from "@/hooks/useCoachStudents";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetField, CoachSheetFooter } from "@/components/koaches/coach/CoachSheet";
import { DropInPlayerCountField } from "@/components/koaches/coach/DropInPlayerCountField";
import { SessionParticipantsFields } from "@/components/koaches/coach/SessionParticipantsFields";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";

type EditSessionPlayersSheetProps = {
  open: boolean;
  onClose: () => void;
  session: Session;
  onSaved?: () => void;
};

export function EditSessionPlayersSheet({
  open,
  onClose,
  session,
  onSaved,
}: EditSessionPlayersSheetProps) {
  const { showToast } = useCoachToast();
  const { coach } = useCoachProfile(session.coachId);
  const { students: roster } = useCoachStudents(session.coachId);
  const pricing = normalizeSessionPricing(coach?.sessionPricing ?? DEFAULT_SESSION_PRICING);
  const minPlayers = pricing.minimumPlayers ?? 1;
  const maxPlayers = pricing.maximumPlayers ?? 4;
  const sessionDurationMinutes = (() => {
    let diff = parseTimeToMinutes(session.endTime) - parseTimeToMinutes(session.time);
    if (diff <= 0) diff += 24 * 60;
    return Math.max(HOURLY_SESSION_MINUTES, diff || pricing.defaultDurationMinutes);
  })();

  const [playerCount, setPlayerCount] = useState(session.playerCount || 1);
  const [participants, setParticipants] = useState<SessionParticipant[]>(() =>
    resizeParticipants(session.participants ?? [], session.playerCount || 1)
  );
  const [price, setPrice] = useState(session.price);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const count = Math.max(1, session.playerCount || 1);
    setPlayerCount(count);
    setParticipants(resizeParticipants(session.participants ?? [], count));
    setPrice(session.price);
  }, [open, session.id, session.playerCount, session.participants, session.price]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setParticipants((prev) => resizeParticipants(prev, count));
    if (session.type === "drop-in") {
      setPrice(
        suggestSessionPrice({
          type: "drop-in",
          playerCount: count,
          durationMinutes: sessionDurationMinutes,
          pricing,
        })
      );
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const nextParticipants = resizeParticipants(participants, playerCount);
      const studentId = nextParticipants.find((p) => p.studentId)?.studentId ?? "";
      await updateSessionPlayersAction(session.id, {
        playerCount,
        participants: nextParticipants,
        studentId,
        price,
      });
      patchCachedSession(session.coachId, session.id, {
        playerCount,
        participants: nextParticipants,
        studentId,
        price,
      });
      invalidateCoachSessions(session.coachId);
      showToast("Players updated");
      onSaved?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not update players", "error");
    } finally {
      setSaving(false);
    }
  };

  const isDropIn = session.type === "drop-in";

  return (
    <CoachBottomSheet
      open={open}
      onClose={onClose}
      title="Edit players"
      subtitle="Add or change who is in this session"
      footer={
        <CoachSheetFooter>
          <CoachButton
            type="button"
            className="w-full"
            loading={saving}
            loadingLabel="Saving…"
            onClick={() => void handleSave()}
          >
            Save players
          </CoachButton>
        </CoachSheetFooter>
      }
    >
      <div className="space-y-4">
        {isDropIn ? (
          <DropInPlayerCountField
            value={playerCount}
            min={minPlayers}
            max={maxPlayers}
            onChange={handlePlayerCountChange}
          />
        ) : null}

        <SessionParticipantsFields
          playerCount={playerCount}
          participants={participants}
          roster={roster}
          onChange={setParticipants}
          optional={isDropIn}
          hint={
            isDropIn
              ? "Optional. Leave blank if they'll join your roster later."
              : "Pick from your roster."
          }
        />

        {isDropIn ? (
          <CoachSheetField
            label="Session total (₱)"
            htmlFor="edit-session-price"
            hint={formatSuggestedDropInHint(
              pricing,
              playerCount,
              sessionDurationMinutes,
              suggestSessionPrice({
                type: "drop-in",
                playerCount,
                durationMinutes: sessionDurationMinutes,
                pricing,
              })
            )}
          >
            <input
              id="edit-session-price"
              type="number"
              min={0}
              step={50}
              inputMode="numeric"
              className="coach-input"
              value={price}
              onChange={(e) => setPrice(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            />
          </CoachSheetField>
        ) : null}
      </div>
    </CoachBottomSheet>
  );
}
