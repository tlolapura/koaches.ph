import Link from "next/link";
import { KoachesLogo } from "@/components/koaches/KoachesLogo";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#F8FAFC] px-4 py-16 text-center">
      <KoachesLogo size="sm" />
      <p className="font-heading mt-8 text-6xl font-bold text-[#1E3A5F]">404</p>
      <h1 className="font-heading mt-3 text-xl font-semibold text-[#111827]">Admin page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
        This admin route doesn&apos;t exist or you may not have access.
      </p>
      <Link href="/admin" className="coach-btn-primary mt-8 w-auto">
        Back to admin home
      </Link>
    </div>
  );
}
