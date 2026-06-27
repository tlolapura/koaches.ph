import { CoachPortalShell } from "@/components/koaches/coach/CoachPortalShell";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return <CoachPortalShell>{children}</CoachPortalShell>;
}
