import type { MetadataRoute } from "next";
import { fetchPublicCoachListingsAction } from "@/lib/koaches/actions/coaches";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";

const BASE_URL = "https://koaches.ph";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ["", "/coaches", "/for-coaches", "/apply", "/coach/login", "/admin/login"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    })
  );

  let coachPages: MetadataRoute.Sitemap = [];
  try {
    const coaches = await fetchPublicCoachListingsAction();
    coachPages = coaches.map((coach) => ({
      url: `${BASE_URL}${buildPublicCoachPath(coach.slug)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    coachPages = [];
  }

  return [...staticPages, ...coachPages];
}
