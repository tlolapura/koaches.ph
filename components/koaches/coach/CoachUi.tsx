"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Plus, XCircle, type LucideIcon } from "lucide-react";
import { COACH_COLORS as C } from "@/lib/koaches/coach-colors";
import type { SessionPaymentStatus } from "@/lib/koaches/types";
import { getPaymentStatusLabel } from "@/lib/koaches/session-payment";
import { getSessionStatusLabel } from "@/lib/koaches/session-status";
import {
  getSessionDisplayStatusLabel,
  type SessionDisplayStatus,
} from "@/lib/koaches/session-lifecycle";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; type: "success" | "error" };

const ToastContext = createContext<{
  showToast: (message: string, type?: "success" | "error") => void;
} | null>(null);

export function CoachToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-md",
              t.type === "success" ? "bg-[#E07A5F]" : "bg-[#EF4444]"
            )}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useCoachToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useCoachToast must be used within CoachToastProvider");
  return ctx;
}

export function InitialsAvatar({
  name,
  size = "md",
  variant = "coral",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "coral" | "lime" | "navy" | "alt";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const sizes = { sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg", xl: "h-20 w-20 text-xl" };
  const variants = {
    coral: "bg-[#E07A5F] text-white",
    lime: "bg-[#E07A5F] text-white",
    navy: "bg-[#1E3A5F] text-white",
    alt: "bg-[#FDEEE9] text-[#8B4D3A]",
  };

  return (
    <div
      className={cn(
        "font-heading flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        variants[variant === "lime" ? "coral" : variant],
        className
      )}
    >
      {initials}
    </div>
  );
}

export function SessionTypeBadge({ type }: { type: "drop-in" | "program" | string }) {
  const isDropIn = type === "drop-in";
  return (
    <span
      className={cn(
        "font-heading rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isDropIn ? "bg-[#FDE047] text-[#1E3A5F]" : "bg-[#1E3A5F] text-white"
      )}
    >
      {isDropIn ? "Drop-in" : "Program"}
    </span>
  );
}

export function SessionPaymentBadge({ status }: { status: SessionPaymentStatus }) {
  const isPaid = status === "paid";
  return (
    <span
      className={cn(
        "font-heading rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isPaid ? "bg-[#6B9E78] text-white" : "bg-[#FEF3C7] text-[#92400E]"
      )}
    >
      {getPaymentStatusLabel(status)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    upcoming: "bg-[#FDEEE9] text-[#8B4D3A]",
    done: "bg-[#6B9E78] text-white",
    canceled: "bg-[#E5E7EB] text-[#6B7280]",
    active: "bg-[#E5EFE8] text-[#3D5C47]",
    archived: "bg-[#E5E7EB] text-[#6B7280]",
  };
  const sessionLabels: Record<string, string> = {
    upcoming: getSessionStatusLabel("upcoming"),
    done: getSessionStatusLabel("done"),
    canceled: getSessionStatusLabel("canceled"),
  };
  const label = sessionLabels[status] ?? status;
  return (
    <span className={cn("font-heading rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", styles[status] ?? "bg-gray-100 text-gray-600")}>
      {label}
    </span>
  );
}

const sessionDisplayStyles: Record<SessionDisplayStatus, string> = {
  upcoming: "bg-[#FDEEE9] text-[#8B4D3A]",
  done: "bg-[#6B9E78] text-white",
  canceled: "bg-[#E5E7EB] text-[#6B7280]",
  pending_progress_review: "bg-[#FEF3C7] text-[#92400E]",
  ready_to_share: "bg-[#FDEEE9] text-[#E07A5F] ring-1 ring-[#E07A5F]/30",
};

export function SessionDisplayStatusBadge({ status }: { status: SessionDisplayStatus }) {
  return (
    <span
      className={cn(
        "font-heading rounded-full px-2.5 py-0.5 text-xs font-semibold",
        sessionDisplayStyles[status]
      )}
    >
      {getSessionDisplayStatusLabel(status)}
    </span>
  );
}

export function DuprChip({ level }: { level: string }) {
  const labels: Record<string, string> = {
    "2.0": "Beginner",
    "2.5": "Advanced Beginner",
    "3.0": "Intermediate",
    "3.5": "Solid Intermediate",
    "4.0": "Advanced Intermediate",
    "4.5+": "Advanced / Expert",
  };
  return (
    <span className="inline-flex items-center rounded-full bg-[#E5EFE8] px-2.5 py-1 text-xs font-medium text-[#3D5C47]">
      {level} — {labels[level] ?? level}
    </span>
  );
}

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[#E5E7EB]", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: C.sage }}
      />
    </div>
  );
}

function getSessionMilestones(total: number): number[] {
  if (total <= 0) return [];
  if (total <= 4) return Array.from({ length: total }, (_, i) => i + 1);
  const marks = new Set<number>();
  for (const fraction of [0.25, 0.5, 0.75, 1]) {
    marks.add(Math.max(1, Math.round(total * fraction)));
  }
  return [...marks].sort((a, b) => a - b);
}

export function MilestoneBadges({ current, total }: { current: number; total: number }) {
  const milestones = getSessionMilestones(total);
  return (
    <div className="flex flex-wrap gap-2">
      {milestones.map((m) => (
        <span
          key={m}
          className={cn(
            "font-heading rounded-full px-2.5 py-1 text-xs font-semibold",
            current >= m ? "bg-[#E07A5F] text-white" : "bg-[#D1D5DB] text-[#6B7280]"
          )}
        >
          Session {m}
          <Award className="ml-1 inline h-3 w-3" />
        </span>
      ))}
    </div>
  );
}

const fabClassName =
  "fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#E07A5F] text-white shadow-lg transition-colors hover:bg-[#C96A52] md:bottom-8";

export function CoachFab({
  onClick,
  href,
  label = "Add",
}: {
  onClick?: () => void;
  href?: string;
  label?: string;
}) {
  if (href) {
    return (
      <Link href={href} aria-label={label} className={fabClassName}>
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={fabClassName}>
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDEEE9]">
        <Icon className="h-7 w-7 text-[#8B4D3A]" strokeWidth={1.75} />
      </div>
      <p className="font-heading mt-4 text-base font-semibold text-[#111827]">{title}</p>
      {description && <p className="mt-1 max-w-xs text-sm text-[#6B7280]">{description}</p>}
      {action && <div className="mt-4 w-full max-w-xs">{action}</div>}
    </div>
  );
}
