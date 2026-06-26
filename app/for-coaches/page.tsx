import type { Metadata } from "next";
import { CoachMarketingLanding } from "@/components/koaches/public/CoachMarketingLanding";

export const metadata: Metadata = {
  title: "For Coaches",
  description:
    "Join KoachesPH — manage students, sessions, programs, progress cards, and social marketing from one dashboard.",
};

export default function ForCoachesPage() {
  return <CoachMarketingLanding />;
}
