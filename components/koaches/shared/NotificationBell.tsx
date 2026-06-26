"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Bell, ChevronRight, X } from "lucide-react";
import type { PortalNotification, PortalNotificationTone } from "@/lib/koaches/notifications";
import { NavCountBadge } from "@/components/koaches/coach/NavCountBadge";
import { cn } from "@/lib/utils";

const toneDot: Record<PortalNotificationTone, string> = {
  green: "bg-[#16A34A]",
  blue: "bg-[#4F8FF7]",
  amber: "bg-[#FACC15]",
  red: "bg-[#EF4444]",
};

type NotificationBellProps = {
  items: PortalNotification[];
  totalCount: number;
  loading?: boolean;
  /** Align dropdown to the left on narrow sidebars */
  align?: "left" | "right";
  className?: string;
};

export function NotificationBell({
  items,
  totalCount,
  loading,
  align = "right",
  className,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors",
          open
            ? "bg-[#EFF6FF] text-[#4F8FF7]"
            : "text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#4F8FF7]"
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          totalCount > 0
            ? `${totalCount} notification${totalCount === 1 ? "" : "s"}`
            : "Notifications"
        }
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        <NavCountBadge count={totalCount} pinned />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-[#14532D]/20 backdrop-blur-[1px] md:bg-transparent md:backdrop-blur-none"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />

          <div
            id={panelId}
            role="dialog"
            aria-label="Notifications"
            className={cn(
              "coach-card fixed z-[70] flex max-h-[min(70vh,28rem)] flex-col overflow-hidden shadow-xl",
              "inset-x-3 top-[3.75rem] md:absolute md:inset-x-auto md:top-full md:mt-2 md:w-[min(100vw-2rem,22rem)]",
              align === "left" ? "md:left-0" : "md:right-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
              <h2 className="font-heading text-sm font-semibold text-[#111827]">Notifications</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] md:hidden"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">Loading…</p>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="font-heading text-sm font-semibold text-[#111827]">All caught up</p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    New sign-ups, sessions, and billing alerts will show up here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[#FAFAF8] active:bg-[#F3F4F6]"
                      >
                        <span
                          className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", toneDot[item.tone])}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-sm font-semibold text-[#111827]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                            {item.message}
                          </p>
                        </div>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#D1D5DB]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
