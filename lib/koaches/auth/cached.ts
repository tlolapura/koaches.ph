import { cache } from "react";
import { getProfileAction } from "@/lib/koaches/actions/auth";
import { isCoachRole } from "@/lib/koaches/auth/profile";

/** Dedupe auth reads within a single server request. */
export const getCachedProfile = cache(getProfileAction);

export const getCachedCoachId = cache(async (): Promise<string | null> => {
  const profile = await getCachedProfile();
  if (!isCoachRole(profile?.role) || !profile?.coach_id) return null;
  return profile.coach_id;
});
