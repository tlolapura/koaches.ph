"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import {
  AuthLoginCard,
  AuthLoginError,
  AuthLoginField,
  AuthLoginIntro,
  AuthLoginScreen,
} from "@/components/koaches/shared/AuthLoginLayout";
import { PasswordInput } from "@/components/koaches/shared/PasswordInput";
import { adminSignInAction } from "@/lib/koaches/actions/auth";
import { SITE_DOMAIN } from "@/lib/koaches/constants";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@koaches.ph");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <AuthLoginScreen>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            if (isSupabaseConfigured()) {
              const result = await adminSignInAction(email, password);
              if (result && !result.ok) setError(result.error ?? "Sign in failed");
              return;
            }
            localStorage.setItem("koaches-admin-auth", "1");
            router.push("/admin");
          });
        }}
      >
        <AuthLoginCard>
          <AuthLoginIntro
            portalLabel="Admin"
            subtitle={
              isSupabaseConfigured() ? "Sign in to your dashboard" : "Demo — any credentials work"
            }
          />

          <div className="coach-form mt-6 space-y-3">
            <AuthLoginField label="Email" htmlFor="admin-email">
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                className="coach-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={`admin@${SITE_DOMAIN}`}
                required
              />
            </AuthLoginField>

            <AuthLoginField label="Password" htmlFor="admin-password">
              <PasswordInput
                id="admin-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            Sign in
          </CoachButton>
        </AuthLoginCard>
      </form>
    </AuthLoginScreen>
  );
}
