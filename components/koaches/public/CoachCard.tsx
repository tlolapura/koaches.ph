import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import type { CoachListing } from "@/lib/koaches/types";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { formatPricingSummary } from "@/lib/koaches/pricing";
import { cn, formatCurrency } from "@/lib/utils";

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
    <Link href={buildPublicCoachPath(coach.slug)} className="coach-row group">
      {coach.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- coach photos may be data URLs
        <img
          src={coach.photo}
          alt={coach.name}
          className="h-14 w-14 shrink-0 rounded-xl object-cover ring-2 ring-[#EFF6FF]"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] font-heading text-sm font-bold text-[#1D4ED8] ring-2 ring-[#EFF6FF]">
          {initials}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-heading truncate text-[0.9375rem] font-semibold text-[#111827]">{coach.name}</p>
          <p className="font-heading shrink-0 text-sm font-semibold text-[#4F8FF7]">
            {formatCurrency(coach.ratePerSession)}
          </p>
        </div>
        <p className="truncate text-xs text-[#6B7280]">{coach.specialization}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1 truncate text-[11px] text-[#9CA3AF]">
            <MapPin className="h-3 w-3 shrink-0" />
            {locationLabel}
          </p>
          <div className="flex shrink-0 items-center gap-1.5">
            {coach.freeTrialEnabled ? (
              <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8]">
                Free trial
              </span>
            ) : null}
            <span className="hidden text-[10px] font-medium text-[#9CA3AF] sm:inline">
              {formatPricingSummary(coach.sessionPricing)}
            </span>
          </div>
        </div>
      </div>

      <ChevronRight
        className={cn(
          "h-4 w-4 shrink-0 text-[#D1D5DB] transition-colors",
          "group-hover:text-[#4F8FF7]"
        )}
      />
    </Link>
  );
}
