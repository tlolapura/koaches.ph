import {
  CoachPageHeader,
  CoachPageShell,
} from "@/components/koaches/coach/CoachPageLayout";
import { cn } from "@/lib/utils";

export { CoachPageHeader as AdminPageHeader };

type AdminPageShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** Shared content width for every admin page (sidebar layout). */
export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return (
    <CoachPageShell className={cn("max-w-6xl", className)}>{children}</CoachPageShell>
  );
}

/** Compact list shell — use across coaches, courts, payments, applications. */
export const adminListClass =
  "overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white";

export const adminListEmptyClass =
  "rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-12 text-center text-sm font-medium text-[#374151]";

export function adminListRowClass(opts?: { muted?: boolean; alert?: boolean }) {
  return cn(
    "px-3.5 py-3 sm:px-4",
    opts?.muted && "bg-[#FAFAFA]",
    opts?.alert && "bg-[#FFFBEB]/50"
  );
}
