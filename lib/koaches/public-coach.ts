import { cache } from "react";
import { fetchCoachBySlugAction } from "@/lib/koaches/actions/coaches";

/** Dedupe coach-by-slug within a single request (metadata + page). */
export const getCachedPublicCoachBySlug = cache(async (slug: string) => {
  return fetchCoachBySlugAction(slug);
});
