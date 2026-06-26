import {
  CoachPageHeader,
  CoachPageShell,
} from "@/components/koaches/coach/CoachPageLayout";
import { cn } from "@/lib/utils";

export { CoachPageHeader as AdminPageHeader };

type AdminPageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Dashboard and wide tables use max-w-6xl; most admin pages use max-w-4xl */
  wide?: boolean;
};

export function AdminPageShell({ children, className, wide }: AdminPageShellProps) {
  return (
    <CoachPageShell className={cn(wide ? "max-w-6xl" : "max-w-4xl", className)}>
      {children}
    </CoachPageShell>
  );
}
