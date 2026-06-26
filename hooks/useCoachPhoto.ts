"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateCoachPhotoAction } from "@/lib/koaches/actions/coach-profile";
import { COACH_PHOTO_UPDATED_EVENT, useCoachProfile } from "@/hooks/useCoachProfile";
import { coachKeys } from "@/lib/koaches/queries/keys";

export function useCoachPhoto(coachId: string, defaultPhoto: string | null = null) {
  const queryClient = useQueryClient();
  const { coach, refresh } = useCoachProfile(coachId);
  const photo = coach?.photo ?? defaultPhoto;

  const savePhoto = useCallback(
    async (dataUrl: string | null) => {
      await updateCoachPhotoAction(coachId, dataUrl);
      await queryClient.invalidateQueries({
        queryKey: [...coachKeys.all, "profile", coachId],
      });
      await refresh();
      window.dispatchEvent(
        new CustomEvent(COACH_PHOTO_UPDATED_EVENT, { detail: { coachId } })
      );
    },
    [coachId, queryClient, refresh]
  );

  return { photo, savePhoto, refresh };
}
