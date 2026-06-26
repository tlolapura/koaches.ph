import Link from "next/link";
import { KoachesLogo } from "@/components/koaches/KoachesLogo";

export default function CoachNotFound() {
  return (
    <div className="coach-portal flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <KoachesLogo size="sm" />
      <p className="font-heading mt-8 text-6xl font-bold text-[#E07A5F]">404</p>
      <h1 className="font-heading mt-3 text-xl font-semibold text-[#111827]">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
        This coach portal page doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/coach/dashboard" className="coach-btn-primary w-auto">
          Back to dashboard
        </Link>
        <Link href="/coach/sessions" className="coach-btn-outline w-auto">
          View schedule
        </Link>
      </div>
    </div>
  );
}
