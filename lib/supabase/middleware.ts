import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  coachPortalIsRestricted,
  isCoachRestrictedPathAllowed,
} from "@/lib/koaches/coach-portal-access";
import { COACH_PORTAL_SEGMENTS } from "@/lib/koaches/coach-routes";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

const COACH_CTX_COOKIE = "koach_portal_ctx";
/** Skip profiles+coaches join for this long when cookie is fresh. */
const COACH_CTX_MAX_AGE_SEC = 120;

type CoachPortalCookie = {
  uid: string;
  coachId: string;
  email: string;
  isActive: boolean;
  subscriptionExpiry: string;
  subscriptionPlan: string;
  checkedAt: number;
};

function isCoachPublicRoute(pathname: string) {
  if (pathname === "/coach/login" || pathname === "/coach/apply" || pathname === "/coach/forgot-password" || pathname === "/coach/reset-password") {
    return true;
  }
  if (/^\/coach\/[^/]+\/join$/.test(pathname)) {
    const segment = pathname.split("/")[2];
    if (segment && !COACH_PORTAL_SEGMENTS.has(segment)) return true;
  }
  if (/^\/coach\/[^/]+$/.test(pathname) && !pathname.startsWith("/coach/dashboard")) {
    const segment = pathname.split("/")[2];
    if (segment && !COACH_PORTAL_SEGMENTS.has(segment)) return true;
  }
  return false;
}

function readCoachCtx(request: NextRequest, userId: string): CoachPortalCookie | null {
  const raw = request.cookies.get(COACH_CTX_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CoachPortalCookie;
    if (parsed.uid !== userId || !parsed.coachId) return null;
    if (Date.now() - parsed.checkedAt > COACH_CTX_MAX_AGE_SEC * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCoachCtx(response: NextResponse, ctx: CoachPortalCookie) {
  response.cookies.set(COACH_CTX_COOKIE, JSON.stringify(ctx), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COACH_CTX_MAX_AGE_SEC,
  });
}

function clearCoachCtx(response: NextResponse) {
  response.cookies.set(COACH_CTX_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

type AuthCookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

function applyAuthCookies(response: NextResponse, cookiesToSet: AuthCookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  let authCookiesToSet: AuthCookieToSet[] = [];

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        authCookiesToSet = cookiesToSet;
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  let coachPortalContext: { coachId: string; email: string } | null = null;
  let coachCtxToStore: CoachPortalCookie | null = null;

  // Already signed in → skip the login form (common when reopening the site on phone).
  if (pathname === "/coach/login" && user) {
    const cached = readCoachCtx(request, user.id);
    let isCoach = Boolean(cached?.coachId);
    if (!cached) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, coach_id")
        .eq("id", user.id)
        .maybeSingle();
      isCoach = profile?.role === "coach" && Boolean(profile.coach_id);
    }
    if (isCoach) {
      const next = request.nextUrl.searchParams.get("next");
      const url = request.nextUrl.clone();
      url.pathname =
        next && next.startsWith("/coach") && !next.startsWith("/coach/login")
          ? next
          : "/coach/dashboard";
      url.search = "";
      const redirect = NextResponse.redirect(url);
      applyAuthCookies(redirect, authCookiesToSet);
      return redirect;
    }
  }

  if (pathname.startsWith("/coach") && !isCoachPublicRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/coach/login";
      url.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(url);
      applyAuthCookies(redirect, authCookiesToSet);
      clearCoachCtx(redirect);
      return redirect;
    }

    const cached = readCoachCtx(request, user.id);
    let coachId = cached?.coachId ?? "";
    let email = cached?.email ?? user.email ?? "";
    let isActive = cached?.isActive ?? true;
    let subscriptionExpiry = cached?.subscriptionExpiry ?? "";
    let subscriptionPlan = cached?.subscriptionPlan ?? "regular";

    if (!cached) {
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "role, coach_id, coaches(is_active, subscription_expiry, subscription_plan)"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "coach" || !profile.coach_id) {
        const url = request.nextUrl.clone();
        url.pathname = "/coach/login";
        url.searchParams.set("error", "unauthorized");
        const redirect = NextResponse.redirect(url);
        applyAuthCookies(redirect, authCookiesToSet);
        clearCoachCtx(redirect);
        return redirect;
      }

      const coachRow = profile.coaches as
        | {
            is_active: boolean;
            subscription_expiry: string | null;
            subscription_plan: string;
          }
        | {
            is_active: boolean;
            subscription_expiry: string | null;
            subscription_plan: string;
          }[]
        | null;
      const coach = Array.isArray(coachRow) ? coachRow[0] : coachRow;

      coachId = profile.coach_id;
      email = user.email ?? "";
      isActive = coach?.is_active ?? true;
      subscriptionExpiry = coach?.subscription_expiry ?? "";
      subscriptionPlan = coach?.subscription_plan ?? "regular";

      coachCtxToStore = {
        uid: user.id,
        coachId,
        email,
        isActive,
        subscriptionExpiry,
        subscriptionPlan,
        checkedAt: Date.now(),
      };
    }

    if (
      coachPortalIsRestricted({
        isActive,
        subscriptionExpiry,
        subscriptionPlan: subscriptionPlan as "early-bird" | "regular",
      }) &&
      !isCoachRestrictedPathAllowed(pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/coach/settings/billing";
      url.searchParams.set("restricted", "1");
      const redirect = NextResponse.redirect(url);
      applyAuthCookies(redirect, authCookiesToSet);
      if (coachCtxToStore) writeCoachCtx(redirect, coachCtxToStore);
      return redirect;
    }

    coachPortalContext = { coachId, email };
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      const redirect = NextResponse.redirect(url);
      applyAuthCookies(redirect, authCookiesToSet);
      return redirect;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      const redirect = NextResponse.redirect(url);
      applyAuthCookies(redirect, authCookiesToSet);
      return redirect;
    }
  }

  if (coachPortalContext) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-koach-coach-id", coachPortalContext.coachId);
    if (coachPortalContext.email) {
      requestHeaders.set("x-koach-profile-email", coachPortalContext.email);
    }
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    applyAuthCookies(response, authCookiesToSet);
    if (coachCtxToStore) writeCoachCtx(response, coachCtxToStore);
    return response;
  }

  return supabaseResponse;
}
