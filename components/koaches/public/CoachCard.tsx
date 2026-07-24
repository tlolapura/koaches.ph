import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import type { CoachListing } from "@/lib/koaches/types";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { formatCurrency } from "@/lib/utils";

type CoachCardProps = {
  coach: CoachListing;
};

export function CoachCard({ coach }: CoachCardProps) {
  const initials = coach.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const locationLabel =
    coach.courts.length > 0
      ? [...new Set(coach.courts.map((c) => c.city).filter(Boolean))].join(" · ")
      : "Philippines";

  return (
    <Link
      href={buildPublicCoachPath(coach.slug)}
      className="group flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-[#E8EBE4] transition-all active:scale-[0.99] active:bg-[#F9FAFB]"
    >
      {coach.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- coach photos may be data URLs
        <img
          src={coach.photo}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#F0FDF4]"
        />
      ) : (
        <div className="font-heading flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ECFDF5] text-sm font-bold text-[#15803D] ring-2 ring-[#F0FDF4]">
          {initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-heading truncate text-[0.9375rem] font-semibold text-[#111827]">
            {coach.name}
          </p>
          <p className="font-heading shrink-0 text-sm font-semibold text-[#15803D]">
            {formatCurrency(coach.ratePerSession)}
          </p>
        </div>
        <p className="truncate text-xs text-[#6B7280]">
          {coach.specialization || "Pickleball coach"}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1 truncate text-[11px] text-[#9CA3AF]">
            <MapPin className="h-3 w-3 shrink-0" />
            {locationLabel}
          </p>
          {coach.freeTrialEnabled ? (
            <span className="shrink-0 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
              Free trial
            </span>
          ) : null}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB] transition-colors group-active:text-[#16A34A]" />
    </Link>
  );
}
