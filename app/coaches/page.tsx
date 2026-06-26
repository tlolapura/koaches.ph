import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchPublicCoachListingsAction } from "@/lib/koaches/actions/coaches";
import { CoachesBrowse } from "@/components/koaches/public/CoachesBrowse";
import { PublicFooter } from "@/components/koaches/public/PublicChrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find a Coach",
  description: "Browse pickleball coaches in the Philippines. Compare rates, locations, and book a session.",
};

export default async function CoachesPage() {
  const coaches = await fetchPublicCoachListingsAction();

  return (
    <div className="coach-portal flex min-h-dvh flex-col bg-[#FAFAF8]">
      <main className="flex-1">
        <Suspense>
          <CoachesBrowse coaches={coaches} />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}
