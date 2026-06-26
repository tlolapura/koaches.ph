"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/koaches/actions/auth";
import { cn } from "@/lib/utils";

type CoachSignOutButtonProps = {
  className?: string;
  showIcon?: boolean;
  label?: string;
  "aria-label"?: string;
};

export function CoachSignOutButton({
  className,
  showIcon = true,
  label = "Sign out",
  "aria-label": ariaLabel,
}: CoachSignOutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={ariaLabel ?? (label || "Sign out")}
      onClick={() =>
        startTransition(async () => {
          await signOutAction("/coach/login");
        })
      }
      className={cn(
        "font-heading inline-flex min-h-[40px] items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:opacity-60",
        className
      )}
    >
      {showIcon && <LogOut className="h-4 w-4" strokeWidth={2.25} />}
      {pending ? "Signing out…" : label}
    </button>
  );
}
