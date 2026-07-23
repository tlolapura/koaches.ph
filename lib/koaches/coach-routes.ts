/** Coach portal path segments — not public coach profile slugs */
export const COACH_PORTAL_SEGMENTS = new Set([
  "dashboard",
  "students",
  "sessions",
  "calendar",
  "programs",
  "clinics",
  "reports",
  "progress",
  "profile",
  "social",
  "more",
  "login",
  "apply",
  "forgot-password",
  "reset-password",
  "free-trial",
  "promos",
  "certificates",
  "courts",
  "billing",
  "settings",
  "onboarding",
]);

export function buildPublicCoachPath(slug: string) {
  return `/coach/${slug.trim().toLowerCase()}`;
}

export function buildJoinPath(coachSlug: string) {
  return `${buildPublicCoachPath(coachSlug)}/join`;
}

export function buildIntakePath(coachSlug: string) {
  return buildJoinPath(coachSlug);
}

/** True for `/coach/coach-marco` style public profiles (not portal routes). */
export function isPublicCoachProfilePath(pathname: string): boolean {
  const match = pathname.match(/^\/coach\/([^/]+)$/);
  if (!match) return false;
  const segment = match[1];
  if (COACH_PORTAL_SEGMENTS.has(segment)) return false;
  return true;
}

export function coachSlugFromPublicPath(pathname: string): string | null {
  if (!isPublicCoachProfilePath(pathname)) return null;
  return pathname.replace(/^\/coach\//, "");
}

export function isPublicCoachJoinPath(pathname: string): boolean {
  const match = pathname.match(/^\/coach\/([^/]+)\/join$/);
  if (!match) return false;
  return !COACH_PORTAL_SEGMENTS.has(match[1]);
}
