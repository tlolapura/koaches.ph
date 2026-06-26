import type { SupabaseClient } from "@supabase/supabase-js";
import { COACH_PORTAL_SEGMENTS } from "@/lib/koaches/coach-routes";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyCoachName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "coach";
}

export function isValidCoachSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !COACH_PORTAL_SEGMENTS.has(slug);
}

/** Pick a unique public profile slug from the application. */
export async function resolveCoachSlug(
  supabase: SupabaseClient,
  app: { preferredSlug?: string; fullName: string }
): Promise<string> {
  const candidates: string[] = [];
  const preferred = app.preferredSlug?.trim().toLowerCase();
  if (preferred && isValidCoachSlug(preferred)) {
    candidates.push(preferred);
  }
  candidates.push(slugifyCoachName(app.fullName));

  for (const base of candidates) {
    let slug = base;
    for (let i = 0; i < 20; i++) {
      const { data } = await supabase.from("coaches").select("slug").eq("slug", slug).maybeSingle();
      if (!data) return slug;
      slug = `${base}-${i + 2}`;
    }
  }

  return `coach-${crypto.randomUUID().slice(0, 8)}`;
}
