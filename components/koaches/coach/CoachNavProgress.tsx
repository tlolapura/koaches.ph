"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar while App Router navigations are in flight.
 * Shows immediately on in-app link clicks so mobile never looks "dead".
 */
export function CoachNavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActive(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (!url.pathname.startsWith("/coach") && !url.pathname.startsWith("/admin")) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }

      setActive(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      // Safety: clear if navigation never completes (e.g. cancelled)
      timerRef.current = setTimeout(() => setActive(false), 12_000);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-[#DCFCE7]"
      role="progressbar"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="coach-nav-progress h-full w-1/3 rounded-r-full bg-[#16A34A]" />
    </div>
  );
}
