import { CoachPortalShell } from "@/components/koaches/coach/CoachPortalShell";

export const dynamic = "force-dynamic";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <CoachPortalShell>{children}</CoachPortalShell>;
}
