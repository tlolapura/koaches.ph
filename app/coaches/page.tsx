import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPublicCoachListingsAction } from "@/lib/koaches/actions/coaches";
import { CoachesBrowse } from "@/components/koaches/public/CoachesBrowse";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find a Coach",
  description:
    "Browse pickleball coaches in the Philippines. Compare rates, locations, and book a session.",
};

export default async function CoachesPage() {
  const coaches = await fetchPublicCoachListingsAction();

  return (
    <Suspense fallback={null}>
      <CoachesBrowse coaches={coaches} />
    </Suspense>
  );
}
