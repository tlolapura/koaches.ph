"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LogIn } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import {
  AuthLoginCard,
  AuthLoginError,
  AuthLoginField,
  AuthLoginIntro,
  AuthLoginScreen,
} from "@/components/koaches/shared/AuthLoginLayout";
import { isAdminRole } from "@/lib/koaches/auth/profile";
import { SITE_DOMAIN } from "@/lib/koaches/constants";
import { PasswordInput } from "@/components/koaches/shared/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const REMEMBERED_EMAIL_KEY = "koach_admin_email";

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  /** Stays true after successful auth until this page unmounts (redirect in flight). */
  const [redirecting, setRedirecting] = useState(false);

  const busy = pending || redirecting;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("This account isn't set up for the admin portal.");
    }
    if (searchParams.get("error") === "auth") {
      setError("That link expired. Please try signing in again.");
    }
  }, [searchParams]);

  return (
    <div className="coach-portal relative flex h-dvh max-h-dvh w-full overflow-hidden bg-[#FAFAF8]">
      <PickleballBallBackdrop variant="login" />

      <AuthLoginScreen>
        <form
          method="post"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            startTransition(() => {
              void (async () => {
                try {
                  const next = searchParams.get("next") ?? "/admin";

                  if (!isSupabaseConfigured()) {
                    try {
                      window.localStorage.setItem("koaches-admin-auth", "1");
                      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
                    } catch {
                      /* ignore */
                    }
                    setRedirecting(true);
                    window.location.assign("/admin");
                    return;
                  }

                  const supabase = createClient();
                  const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                  });
                  if (signInError) {
                    setError(signInError.message || "Sign in failed");
                    return;
                  }

                  const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .maybeSingle();

                  if (!isAdminRole(profile?.role)) {
                    await supabase.auth.signOut();
                    setError("This account is not authorized for the admin portal.");
                    return;
                  }

                  const dest =
                    next.startsWith("/admin") && !next.startsWith("/admin/login")
                      ? next
                      : "/admin";

                  try {
                    window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
                  } catch {
                    /* ignore */
                  }

                  setRedirecting(true);
                  // Full navigation so middleware sees the new session cookies.
                  window.location.assign(dest);
                } catch {
                  setError("Sign in failed. Please try again.");
                  setRedirecting(false);
                }
              })();
            });
          }}
        >
          <AuthLoginCard>
            <AuthLoginIntro portalLabel="Admin portal" subtitle="Sign in to your dashboard" />

            <div className="mt-6 space-y-3">
              <AuthLoginField label="Email" htmlFor="admin-email">
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  className="coach-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`admin@${SITE_DOMAIN}`}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                  disabled={busy}
                />
              </AuthLoginField>

              <AuthLoginField label="Password" htmlFor="admin-password">
                <PasswordInput
                  id="admin-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={busy}
                />
              </AuthLoginField>
            </div>

            {error ? (
              <div className="mt-4">
                <AuthLoginError message={error} />
              </div>
            ) : null}

            <CoachButton type="submit" className="mt-6 w-full" loading={busy} loadingLabel="Signing in…">
              <LogIn className="h-4 w-4" strokeWidth={2.5} />
              Sign in
            </CoachButton>
          </AuthLoginCard>
        </form>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          Coach?{" "}
          <Link href="/coach/login" className="font-semibold text-[#4F8FF7] hover:underline">
            Sign in to coach portal
          </Link>
        </p>
      </AuthLoginScreen>
    </div>
  );
}
