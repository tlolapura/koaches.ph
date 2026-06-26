"use client";

import { useCallback } from "react";
import { updateCoachPhotoAction } from "@/lib/koaches/actions/coach-profile";
import { useCoachProfile } from "@/hooks/useCoachProfile";

export function useCoachPhoto(coachId: string, defaultPhoto: string | null = null) {
  const { coach, refresh } = useCoachProfile(coachId);
  const photo = coach?.photo ?? defaultPhoto;

  const savePhoto = useCallback(
    async (dataUrl: string | null) => {
      await updateCoachPhotoAction(coachId, dataUrl);
      await refresh();
      window.dispatchEvent(new Event("koaches-coach-photo-updated"));
    },
    [coachId, refresh]
  );

  return { photo, savePhoto, refresh };
}
