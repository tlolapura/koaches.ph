"use server";

import { getCachedCoachId } from "@/lib/koaches/auth/cached";
import {
  loadCoachPortalBootstrap,
  type CoachPortalBootstrap,
} from "@/lib/koaches/coach-portal-bootstrap";

export type { CoachPortalBootstrap };

/** Client-callable bootstrap with auth check. */
export async function coachPortalBootstrapAction(
  coachId: string
): Promise<CoachPortalBootstrap> {
  const authCoachId = await getCachedCoachId();
  if (!authCoachId || authCoachId !== coachId) {
    throw new Error("Not authorized.");
  }
  return loadCoachPortalBootstrap(coachId);
}
