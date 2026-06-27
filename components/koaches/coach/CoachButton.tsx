"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CoachButtonVariant = "primary" | "secondary" | "outline" | "soft" | "danger";

const variantClass: Record<CoachButtonVariant, string> = {
  primary: "coach-btn-primary",
  secondary: "coach-btn-secondary",
  outline: "coach-btn-outline",
  soft: "coach-btn-soft",
  danger:
    "font-heading flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#EF4444] px-4 font-semibold text-white transition-opacity disabled:opacity-60",
};

type CoachButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: CoachButtonVariant;
  loading?: boolean;
  loadingLabel?: ReactNode;
};

export function CoachButton({
  variant = "primary",
  loading = false,
  loadingLabel,
  children,
  className,
  disabled,
  type = "button",
  ...props
}: CoachButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(variantClass[variant], "gap-2", className)}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
