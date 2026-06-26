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

export function CoachAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CoachAuthState>({
    coachId: "",
    loading: isSupabaseConfigured(),
    email: null,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ coachId: "", loading: false, email: null });
      return;
    }

    void getProfileAction().then((profile) => {
      setState({
        coachId: profile?.coach_id ?? "",
        loading: false,
        email: profile?.email ?? null,
      });
    });
  }, []);

  return <CoachAuthContext.Provider value={state}>{children}</CoachAuthContext.Provider>;
}

export function usePortalCoachId() {
  return useContext(CoachAuthContext).coachId;
}

export function useCoachAuth() {
  return useContext(CoachAuthContext);
}
