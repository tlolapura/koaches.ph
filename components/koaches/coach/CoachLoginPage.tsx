"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { LogIn } from "lucide-react";
import { KoachesLogo } from "@/components/koaches/KoachesLogo";
import { PickleballBallBackdrop } from "@/components/koaches/shared/PickleballBallVector";
import { coachSignInAction } from "@/lib/koaches/actions/auth";
import { PasswordInput } from "@/components/koaches/shared/PasswordInput";

export function CoachLoginPage() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "unauthorized") {
      setError("This account isn't set up for the coach portal.");
    }
  }, [searchParams]);

  return (
    <div className="coach-portal relative flex h-dvh max-h-dvh w-full overflow-hidden bg-[#FAFAF8]">
      <PickleballBallBackdrop variant="login" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#F0FDF4] opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-[#EFF6FF] opacity-70 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <form
            className="coach-card w-full p-6 shadow-[0_8px_30px_rgba(30,58,95,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              setPending(true);
              void (async () => {
                try {
                  const next = searchParams.get("next") ?? "/coach/dashboard";
                  const result = await coachSignInAction(email.trim(), password, next);
                  if (result && !result.ok) setError(result.error ?? "Sign in failed");
                } finally {
                  setPending(false);
                }
              })();
            }}
          >
            <KoachesLogo size="md" />
            <p className="font-heading mt-4 text-xs font-semibold uppercase tracking-wide text-[#4F8FF7]">
              Coach portal
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">Sign in to your dashboard</p>

            <div className="mt-6 space-y-3">
              <div>
                <label htmlFor="coach-email" className="font-heading text-xs font-semibold text-[#374151]">
                  Email
                </label>
                <input
                  id="coach-email"
                  type="email"
                  className="coach-input mt-1.5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@koaches.ph"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label htmlFor="coach-password" className="font-heading text-xs font-semibold text-[#374151]">
                  Password
                </label>
                <PasswordInput
                  id="coach-password"
                  wrapperClassName="mt-1.5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-center text-xs font-medium text-[#B91C1C]"
              >
                {error}
              </p>
            )}

            <CoachButton type="submit" className="mt-6" loading={pending} loadingLabel="Signing in…">
              <LogIn className="h-4 w-4" strokeWidth={2.5} />
              Sign in
            </CoachButton>
          </form>

          <p className="mt-6 text-center text-xs text-[#9CA3AF]">
            New coach?{" "}
            <Link href="/coach/apply" className="font-semibold text-[#4F8FF7] hover:underline">
              Apply to join
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
