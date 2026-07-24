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
