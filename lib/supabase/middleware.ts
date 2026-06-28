import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  coachPortalIsRestricted,
  isCoachRestrictedPathAllowed,
} from "@/lib/koaches/coach-portal-access";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

function isCoachPublicRoute(pathname: string) {
  if (pathname === "/coach/login" || pathname === "/coach/apply" || pathname === "/coach/forgot-password" || pathname === "/coach/reset-password") {
    return true;
  }
  if (/^\/coach\/[^/]+\/join$/.test(pathname)) {
    const segment = pathname.split("/")[2];
    const reserved = [
      "dashboard",
      "students",
      "sessions",
      "programs",
      "reports",
      "progress",
      "profile",
      "social",
      "more",
      "calendar",
      "certificates",
      "promos",
      "free-trial",
      "billing",
      "onboarding",
      "login",
      "apply",
    ];
    if (segment && !reserved.includes(segment)) return true;
  }
  if (/^\/coach\/[^/]+$/.test(pathname) && !pathname.startsWith("/coach/dashboard")) {
    const reserved = [
      "dashboard",
      "students",
      "sessions",
      "programs",
      "reports",
      "progress",
      "profile",
      "social",
      "more",
      "calendar",
      "certificates",
      "promos",
      "free-trial",
      "billing",
      "onboarding",
      "login",
      "apply",
    ];
    const segment = pathname.split("/")[2];
    if (segment && !reserved.includes(segment)) return true;
  }
  return false;
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { pathname } = request.nextUrl;
  let coachPortalContext: { coachId: string; email: string } | null = null;

  if (pathname.startsWith("/coach") && !isCoachPublicRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/coach/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

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
      return NextResponse.redirect(url);
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

    if (
      coach &&
      coachPortalIsRestricted({
        isActive: coach.is_active,
        subscriptionExpiry: coach.subscription_expiry ?? "",
        subscriptionPlan: coach.subscription_plan as "early-bird" | "regular",
      }) &&
      !isCoachRestrictedPathAllowed(pathname)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/coach/billing";
      url.searchParams.set("restricted", "1");
      return NextResponse.redirect(url);
    }

    coachPortalContext = {
      coachId: profile.coach_id,
      email: user.email ?? "",
    };
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin" && profile?.role !== "super_admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
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
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  }

  return supabaseResponse;
}
