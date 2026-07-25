"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type TitleStore = {
  title: string | null;
  setTitle: (title: string | null) => void;
};

const CoachPageTitleContext = createContext<TitleStore | null>(null);

export function CoachPageTitleProvider({ children }: { children: React.ReactNode }) {
  // Store the title together with the path it was set for; a title from a
  // previous page is ignored automatically instead of being reset in an effect.
  const [entry, setEntry] = useState<{ path: string; title: string } | null>(null);
  const pathname = usePathname();

  const setTitle = useCallback((title: string | null) => {
    setEntry(title == null ? null : { path: window.location.pathname, title });
  }, []);

  const title = entry && entry.path === pathname ? entry.title : null;
  const value = useMemo(() => ({ title, setTitle }), [title, setTitle]);

  return (
    <CoachPageTitleContext.Provider value={value}>
      {children}
    </CoachPageTitleContext.Provider>
  );
}

export function useCoachPageTitle() {
  return useContext(CoachPageTitleContext)?.title ?? null;
}

/** Detail pages call this so the mobile header shows who/what you're looking at. */
export function useSetCoachPageTitle(title: string | null | undefined) {
  const ctx = useContext(CoachPageTitleContext);
  const setTitle = ctx?.setTitle;

  useEffect(() => {
    if (!setTitle) return;
    setTitle(title ?? null);
    return () => setTitle(null);
  }, [setTitle, title]);
}
