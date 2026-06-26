"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { REGIONS, EXPERIENCE_OPTIONS, type ExperienceLevel } from "@/lib/koaches/discovery";
import { cn } from "@/lib/utils";

export type CoachFilterState = {
  search: string;
  region: string;
  level: ExperienceLevel | "";
  freeTrialOnly: boolean;
};

type CoachFiltersProps = {
  filters: CoachFilterState;
  onChange: (patch: Partial<CoachFilterState>) => void;
  onOpenQuiz: () => void;
  resultCount: number;
};

export function CoachFilters({ filters, onChange, onOpenQuiz, resultCount }: CoachFiltersProps) {
  const hasActive =
    filters.search || filters.region || filters.level || filters.freeTrialOnly;

  const clearAll = () =>
    onChange({ search: "", region: "", level: "", freeTrialOnly: false });

  return (
    <div className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-[#FAFAF8]/95 backdrop-blur-md">
      <div className="mx-auto max-w-lg px-4 py-3 sm:max-w-xl lg:max-w-2xl">
        <div className="coach-input flex items-center gap-2 px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="City, area, or coach name..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
            aria-label="Search coaches"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={!filters.region} onClick={() => onChange({ region: "" })}>
            All areas
          </FilterChip>
          {REGIONS.map((r) => (
            <FilterChip
              key={r.id}
              active={filters.region === r.id}
              onClick={() => onChange({ region: filters.region === r.id ? "" : r.id })}
            >
              {r.label}
            </FilterChip>
          ))}
          <FilterChip
            active={filters.freeTrialOnly}
            onClick={() => onChange({ freeTrialOnly: !filters.freeTrialOnly })}
            accent
          >
            Free trial
          </FilterChip>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={!filters.level} onClick={() => onChange({ level: "" })} small>
            Any level
          </FilterChip>
          {EXPERIENCE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.id}
              active={filters.level === opt.id}
              onClick={() => onChange({ level: filters.level === opt.id ? "" : opt.id })}
              small
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-[#6B7280]">
            {resultCount} {resultCount === 1 ? "coach" : "coaches"}
            {hasActive && (
              <>
                {" · "}
                <button type="button" onClick={clearAll} className="font-semibold text-[#4F8FF7] hover:underline">
                  Reset
                </button>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={onOpenQuiz}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#1D4ED8]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Match me
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  accent,
  small,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 font-semibold transition-colors",
        small ? "py-1 text-[11px]" : "py-1.5 text-xs",
        active
          ? accent
            ? "border-[#6B9E78] bg-[#6B9E78] text-white"
            : "border-[#16A34A] bg-[#EFF6FF] text-[#1D4ED8]"
          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#C5D4E8]"
      )}
    >
      {children}
    </button>
  );
}
