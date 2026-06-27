"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getProfileAction } from "@/lib/koaches/actions/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type CoachAuthState = {
  coachId: string;
  loading: boolean;
  email: string | null;
};

const CoachAuthContext = createContext<CoachAuthState>({
  coachId: "",
  loading: true,
  email: null,
});

type CoachAuthProviderProps = {
  children: React.ReactNode;
  initialCoachId?: string;
  initialEmail?: string | null;
};

export function CoachAuthProvider({
  children,
  initialCoachId = "",
  initialEmail = null,
}: CoachAuthProviderProps) {
  const hasServerAuth = initialCoachId.length > 0;
  const [state, setState] = useState<CoachAuthState>({
    coachId: initialCoachId,
    loading: !hasServerAuth && isSupabaseConfigured(),
    email: initialEmail,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ coachId: "", loading: false, email: null });
      return;
    }

    // Server layout already resolved coach auth for portal routes.
    if (hasServerAuth) return;

    let cancelled = false;

    void getProfileAction()
      .then((profile) => {
        if (cancelled) return;
        setState({
          coachId: profile?.coach_id ?? "",
          loading: false,
          email: profile?.email ?? null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ coachId: "", loading: false, email: null });
      });

    return () => {
      cancelled = true;
    };
  }, [hasServerAuth]);

  return <CoachAuthContext.Provider value={state}>{children}</CoachAuthContext.Provider>;
}

export function usePortalCoachId() {
  return useContext(CoachAuthContext).coachId;
}

export function useCoachAuth() {
  return useContext(CoachAuthContext);
}
