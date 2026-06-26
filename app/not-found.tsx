import Link from "next/link";
import { KoachesLogo } from "@/components/koaches/KoachesLogo";

export default function NotFound() {
  return (
    <div className="coach-portal flex min-h-[70vh] flex-col items-center justify-center px-4 py-32 text-center">
      <KoachesLogo size="md" />
      <p className="font-heading mt-10 text-7xl font-extrabold text-[#16A34A]">404</p>
      <h1 className="font-heading mt-4 text-2xl font-extrabold text-[#111827]">Page not found</h1>
      <p className="text-text-muted mt-2 max-w-md">
        This page doesn&apos;t exist. Head back home or find a coach to get started.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="coach-btn-primary w-auto">
          Go home
        </Link>
        <Link href="/coaches" className="coach-btn-outline w-auto">
          Browse coaches
        </Link>
      </div>
    </div>
  );
}
