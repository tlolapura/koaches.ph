"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import {
  AuthLoginCard,
  AuthLoginError,
  AuthLoginField,
  AuthLoginIntro,
  AuthLoginScreen,
} from "@/components/koaches/shared/AuthLoginLayout";
import { PasswordInput } from "@/components/koaches/shared/PasswordInput";
import { coachResetPasswordAction } from "@/lib/koaches/actions/auth";

export function CoachResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="coach-portal relative flex h-dvh max-h-dvh w-full overflow-hidden bg-[#FAFAF8]">
      <PickleballBallBackdrop variant="login" />

      <AuthLoginScreen>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);

            if (password !== confirmPassword) {
              setError("Passwords do not match.");
              return;
            }

            setPending(true);
            void (async () => {
              try {
                const result = await coachResetPasswordAction(password);
                if (result && !result.ok) setError(result.error ?? "Could not reset password.");
              } finally {
                setPending(false);
              }
            })();
          }}
        >
          <AuthLoginCard>
            <AuthLoginIntro portalLabel="Coach portal" subtitle="Choose a new password" />

            <div className="mt-6 space-y-3">
              <AuthLoginField label="New password" htmlFor="reset-password">
                <PasswordInput
                  id="reset-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
              </AuthLoginField>

              <AuthLoginField label="Confirm password" htmlFor="reset-confirm">
                <PasswordInput
                  id="reset-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </AuthLoginField>
            </div>

            {error ? (
              <div className="mt-4">
                <AuthLoginError message={error} />
              </div>
            ) : null}

            <CoachButton type="submit" className="mt-6 w-full" loading={pending} loadingLabel="Saving…">
              <KeyRound className="h-4 w-4" strokeWidth={2.5} />
              Save password
            </CoachButton>
          </AuthLoginCard>
        </form>

        <p className="mt-6 text-center text-xs text-[#9CA3AF]">
          Link expired?{" "}
          <Link href="/coach/forgot-password" className="font-semibold text-[#4F8FF7] hover:underline">
            Request a new one
          </Link>
        </p>
      </AuthLoginScreen>
    </div>
  );
}
