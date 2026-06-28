"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import {
  AuthLoginBackLink,
  AuthLoginCard,
  AuthLoginError,
  AuthLoginField,
  AuthLoginIntro,
  AuthLoginScreen,
} from "@/components/koaches/shared/AuthLoginLayout";
import { coachForgotPasswordAction } from "@/lib/koaches/actions/auth";
import { SITE_DOMAIN } from "@/lib/koaches/constants";

export function CoachForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <div className="coach-portal relative flex h-dvh max-h-dvh w-full overflow-hidden bg-[#FAFAF8]">
      <PickleballBallBackdrop variant="login" />

      <AuthLoginScreen>
        <AuthLoginCard>
          <AuthLoginIntro
            portalLabel="Coach portal"
            subtitle={sent ? "Check your email" : "Reset your password"}
          />

          {sent ? (
            <p className="mt-6 text-sm leading-relaxed text-[#6B7280]">
              If there&apos;s an account for that email, we sent a reset link. Check your inbox and
              spam folder.
            </p>
          ) : (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                setPending(true);
                void (async () => {
                  try {
                    const result = await coachForgotPasswordAction(email);
                    if (result.ok) {
                      setSent(true);
                      return;
                    }
                    setError(result.error ?? "Could not send reset email.");
                  } finally {
                    setPending(false);
                  }
                })();
              }}
            >
              <AuthLoginField label="Email" htmlFor="forgot-email">
                <input
                  id="forgot-email"
                  type="email"
                  className="coach-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`you@${SITE_DOMAIN}`}
                  autoComplete="email"
                  required
                />
              </AuthLoginField>

              {error ? (
                <div className="mt-4">
                  <AuthLoginError message={error} />
                </div>
              ) : null}

              <CoachButton type="submit" className="mt-6 w-full" loading={pending} loadingLabel="Sending…">
                <Mail className="h-4 w-4" strokeWidth={2.5} />
                Send reset link
              </CoachButton>
            </form>
          )}
        </AuthLoginCard>

        <p className="mt-6 text-center">
          <AuthLoginBackLink href="/coach/login">
            <span className="inline-flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </span>
          </AuthLoginBackLink>
        </p>
      </AuthLoginScreen>
    </div>
  );
}
