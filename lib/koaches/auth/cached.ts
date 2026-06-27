import { cache } from "react";
import {
  getAuthenticatedCoachIdAction,
  getProfileAction,
} from "@/lib/koaches/actions/auth";

/** Dedupe auth reads within a single server request. */
export const getCachedProfile = cache(getProfileAction);
export const getCachedCoachId = cache(getAuthenticatedCoachIdAction);
