"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import type { CoachListing } from "@/lib/koaches/types";
import { filterCoaches, type ExperienceLevel, type FinderAnswers } from "@/lib/koaches/discovery";
import { CoachFinder } from "@/components/koaches/public/CoachFinder";
import { CoachCard } from "@/components/koaches/public/CoachCard";
import { CoachFilters, type CoachFilterState } from "@/components/koaches/public/CoachFilters";
import { PublicHero, PublicStatGrid } from "@/components/koaches/public/LandingHero";
import { BRAND_NAME } from "@/lib/koaches/constants";

type CoachesBrowseProps = {
  coaches: CoachListing[];
};

export function CoachesBrowse({ coaches }: CoachesBrowseProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [finderOpen, setFinderOpen] = useState(false);

  const [filters, setFilters] = useState<CoachFilterState>(() => ({
    search: searchParams.get("q") ?? "",
    region: searchParams.get("region") ?? "",
    level: (searchParams.get("level") as ExperienceLevel | "") ?? "",
    freeTrialOnly: searchParams.get("trial") === "1",
  }));

  const patchFilters = (patch: Partial<CoachFilterState>) => {
    setFilters((f) => {
      const next = { ...f, ...patch };
      const params = new URLSearchParams();
      if (next.search) params.set("q", next.search);
      if (next.region) params.set("region", next.region);
      if (next.level) params.set("level", next.level);
      if (next.freeTrialOnly) params.set("trial", "1");
      const qs = params.toString();
      router.replace(qs ? `/coaches?${qs}` : "/coaches", { scroll: false });
      return next;
    });
  };

  const filtered = useMemo(
    () =>
      filterCoaches(coaches, {
        search: filters.search,
        region: filters.region || undefined,
        level: filters.level || undefined,
        freeTrialOnly: filters.freeTrialOnly,
      }),
    [coaches, filters]
  );

  const freeTrialCount = coaches.filter((c) => c.freeTrialEnabled).length;

  const applyFinder = (answers: FinderAnswers) => {
    patchFilters({
      search: "",
      region: answers.region ?? "",
      level: answers.level ?? "",
      freeTrialOnly: false,
    });
  };

  return (
    <>
      <PublicHero
        compact
        back={{ href: "/", label: "← Home" }}
        eyebrow="For players"
        title="Find your coach"
        subtitle={`${coaches.length} coach${coaches.length === 1 ? "" : "es"} on ${BRAND_NAME}${freeTrialCount > 0 ? ` · ${freeTrialCount} with free trials` : ""}`}
      >
        <PublicStatGrid
          stats={[
            { value: String(coaches.length), label: "Listed" },
            { value: String(freeTrialCount), label: "Free trial" },
            { value: "PH", label: "Courts" },
          ]}
        />

        <button
          type="button"
          onClick={() => setFinderOpen(true)}
          className="coach-btn-primary mt-3 gap-2 shadow-[0_4px_14px_rgba(22,163,74,0.28)]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Match me to a coach
        </button>
      </PublicHero>

      <CoachFilters
        filters={filters}
        onChange={patchFilters}
        onOpenQuiz={() => setFinderOpen(true)}
        resultCount={filtered.length}
      />

      <div className="mx-auto w-full max-w-lg px-4 py-4 sm:max-w-xl lg:max-w-2xl">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#1D4ED8]">
              <Search className="h-6 w-6" strokeWidth={2} />
            </span>
            <p className="font-heading mt-4 text-lg font-semibold text-[#111827]">No coaches match</p>
            <p className="mt-1 text-sm text-[#6B7280]">Try clearing filters or use Match me.</p>
            <button
              type="button"
              onClick={() => patchFilters({ search: "", region: "", level: "", freeTrialOnly: false })}
              className="coach-btn-primary mt-5 max-w-xs"
            >
              Show all coaches
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((coach) => (
              <li key={coach.id}>
                <CoachCard coach={coach} />
              </li>
            ))}
          </ul>
        )}

        {filtered.length > 0 ? (
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-[#9CA3AF]">
            <Users className="h-3.5 w-3.5" />
            Tap a coach to view profile and book
          </p>
        ) : null}
      </div>

      <CoachFinder
        open={finderOpen}
        onClose={() => setFinderOpen(false)}
        coaches={coaches}
        onApply={applyFinder}
      />
    </>
  );
}
