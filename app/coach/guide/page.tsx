import type { Metadata } from "next";
import { CoachGuidePage } from "@/components/koaches/coach/CoachGuidePage";
import { BRAND_NAME } from "@/lib/koaches/constants";

export const metadata: Metadata = {
  title: `Coach guide · ${BRAND_NAME}`,
  description: `A simple tour of the ${BRAND_NAME} coach app: schedule, students, programs, and more.`,
};

export default function CoachGuideRoute() {
  return <CoachGuidePage />;
}
