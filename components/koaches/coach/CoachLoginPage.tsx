"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { coachSignInAction } from "@/lib/koaches/actions/auth";
import { SITE_DOMAIN } from "@/lib/koaches/constants";
import { clearCoachPortalCache } from "@/lib/koaches/queries/invalidate";
import { PasswordInput } from "@/components/koaches/shared/PasswordInput";

export function CoachLoginPage() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    clearCoachPortalCache();
  }, []);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("This account isn't set up for the coach portal.");
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
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setPending(true);
            void (async () => {
              try {
                const next = searchParams.get("next") ?? "/coach/dashboard";
                clearCoachPortalCache();
                const result = await coachSignInAction(email.trim(), password, next);
                if (result && !result.ok) setError(result.error ?? "Sign in failed");
              } finally {
                setPending(false);
              }
            })();
          }}
        >
          <AuthLoginCard>
            <AuthLoginIntro portalLabel="Coach portal" subtitle="Sign in to your dashboard" />

            <div className="mt-6 space-y-3">
              <AuthLoginField label="Email" htmlFor="coach-email">
                <input
                  id="coach-email"
                  type="email"
                  className="coach-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`you@${SITE_DOMAIN}`}
                  autoComplete="email"
                  required
                />
              </AuthLoginField>

              <AuthLoginField
                label="Password"
                htmlFor="coach-password"
                hint={
                  <Link
                    href="/coach/forgot-password"
                    className="text-xs font-medium text-[#4F8FF7] hover:underline"
                  >
                    Forgot password?
                  </Link>
                }
              >
                <PasswordInput
                  id="coach-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </AuthLoginField>
            </div>

            {error ? (
              <div className="mt-4">
                <AuthLoginError message={error} />
              </div>
            ) : null}

            <CoachButton type="submit" className="mt-6 w-full" loading={pending} loadingLabel="Signing in…">
              <LogIn className="h-4 w-4" strokeWidth={2.5} />
              Sign in
            </CoachButton>
          </AuthLoginCard>
        </form>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          New coach?{" "}
          <Link href="/coach/apply" className="font-semibold text-[#4F8FF7] hover:underline">
            Apply to join
          </Link>
        </p>
      </AuthLoginScreen>
    </div>
  );
}
