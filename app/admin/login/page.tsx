"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { adminSignInAction } from "@/lib/koaches/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@koaches.ph");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-4">
      <form
        className="coach-card w-full max-w-sm p-6"
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
        <KoachesWordmark size="md" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Admin sign in</p>
        <p className="mt-1 text-sm text-[#6B7280]">
          {isSupabaseConfigured() ? "Platform admin account" : "Demo — any credentials work"}
        </p>
        <input
          className="coach-input mt-6 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
        />
        <input
          className="coach-input mt-3 w-full"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
        />
        {error && <p className="mt-2 text-xs text-[#EF4444]">{error}</p>}
        <button type="submit" className="coach-btn-primary mt-6 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
