import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

function isCoachPublicRoute(pathname: string) {
  if (pathname === "/coach/login" || pathname === "/coach/apply") {
    return true;
  }
  if (/^\/coach\/[^/]+$/.test(pathname) && !pathname.startsWith("/coach/dashboard")) {
    const reserved = [
      "dashboard",
      "students",
      "sessions",
      "programs",
      "progress",
      "profile",
      "social",
      "more",
      "calendar",
      "certificates",
      "promos",
      "free-trial",
      "billing",
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
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/coach") && !isCoachPublicRoute(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/coach/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, coach_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "coach" || !profile.coach_id) {
      const url = request.nextUrl.clone();
      url.pathname = "/coach/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
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

  return supabaseResponse;
}
