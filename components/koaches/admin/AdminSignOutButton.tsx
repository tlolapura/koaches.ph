"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/koaches/actions/auth";
import { cn } from "@/lib/utils";

type AdminSignOutButtonProps = {
  className?: string;
  showIcon?: boolean;
  label?: string;
};

export function AdminSignOutButton({
  className,
  showIcon = true,
  label = "Sign out",
}: AdminSignOutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction("/admin/login");
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
