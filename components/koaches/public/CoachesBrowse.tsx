"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import type { CoachListing } from "@/lib/koaches/types";
import {
  collectCoachCities,
  collectCoachCourts,
  filterCoaches,
  sortCoaches,
  type CoachSortId,
  type ExperienceLevel,
  type FinderAnswers,
} from "@/lib/koaches/discovery";
import { CoachFinder } from "@/components/koaches/public/CoachFinder";
import { CoachCard } from "@/components/koaches/public/CoachCard";
import {
  CoachFilters,
  EMPTY_COACH_FILTERS,
  type CoachFilterState,
} from "@/components/koaches/public/CoachFilters";
import { KoachesWordmark } from "@/components/koaches/KoachesLogo";
import { FacebookIcon, InstagramIcon } from "@/components/koaches/shared/SocialIcons";
import { BRAND_NAME, BRAND_SOCIAL } from "@/lib/koaches/constants";

type CoachesBrowseProps = {
  coaches: CoachListing[];
};

function parseSort(value: string | null): CoachSortId {
  if (
    value === "price-asc" ||
    value === "price-desc" ||
    value === "name" ||
    value === "students" ||
    value === "featured"
  ) {
    return value;
  }
  return "featured";
}

export function CoachesBrowse({ coaches }: CoachesBrowseProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [finderOpen, setFinderOpen] = useState(false);

  const [filters, setFilters] = useState<CoachFilterState>(() => ({
    search: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "",
    courtId: searchParams.get("court") ?? "",
    level: (searchParams.get("level") as ExperienceLevel | "") ?? "",
    freeTrialOnly: searchParams.get("trial") === "1",
    sort: parseSort(searchParams.get("sort")),
  }));

  const cities = useMemo(() => collectCoachCities(coaches), [coaches]);
  const courts = useMemo(() => collectCoachCourts(coaches), [coaches]);

  const patchFilters = (patch: Partial<CoachFilterState>) => {
    setFilters((f) => {
      const next = { ...f, ...patch };
      if (patch.city !== undefined && patch.city !== f.city && patch.courtId === undefined) {
        next.courtId = "";
      }
      if (patch.courtId && !patch.city) {
        const court = courts.find((c) => c.id === patch.courtId);
        if (court?.city) next.city = court.city;
      }

      const params = new URLSearchParams();
      if (next.search) params.set("q", next.search);
      if (next.city) params.set("city", next.city);
      if (next.courtId) params.set("court", next.courtId);
      if (next.level) params.set("level", next.level);
      if (next.freeTrialOnly) params.set("trial", "1");
      if (next.sort && next.sort !== "featured") params.set("sort", next.sort);
      const qs = params.toString();
      router.replace(qs ? `/coaches?${qs}` : "/coaches", { scroll: false });
      return next;
    });
  };

  const filtered = useMemo(() => {
    const list = filterCoaches(coaches, {
      search: filters.search,
      city: filters.city || undefined,
      courtId: filters.courtId || undefined,
      level: filters.level || undefined,
      freeTrialOnly: filters.freeTrialOnly,
    });
    return sortCoaches(list, filters.sort);
  }, [coaches, filters]);

  const freeTrialCount = coaches.filter((c) => c.freeTrialEnabled).length;

  const applyFinder = (answers: FinderAnswers) => {
    patchFilters({
      search: "",
      city: "",
      courtId: "",
      level: answers.level ?? "",
      freeTrialOnly: false,
    });
  };

  return (
    <div className="coach-portal relative flex min-h-dvh flex-col bg-[#F7F8F5] text-[#111827]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(120%_80%_at_50%_-10%,#DCFCE7_0%,transparent_65%)]"
        aria-hidden
      />

      <header className="relative z-[1] border-b border-[#E8EBE4]/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <KoachesWordmark size="sm" />
          <Link
            href="/"
            className="text-xs font-semibold text-[#6B7280] transition-colors hover:text-[#111827]"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="relative z-[1] mx-auto w-full max-w-5xl flex-1 px-4 pb-8 sm:px-6">
        <div className="pt-5 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#15803D]">
              For players
            </p>
            <h1 className="font-heading mt-1.5 text-[1.75rem] font-bold leading-tight tracking-tight text-[#111827] sm:text-3xl">
              Find your coach
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5B6470]">
              Book pickleball sessions near you — filter by city, court, and level.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
              <span className="rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-[#E5E7EB]">
                {coaches.length} coaches
              </span>
              {freeTrialCount > 0 ? (
                <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 font-medium text-[#166534] ring-1 ring-[#BBF7D0]">
                  {freeTrialCount} free trial
                  {freeTrialCount === 1 ? "" : "s"}
                </span>
              ) : null}
              {cities.length > 0 ? (
                <span className="rounded-full bg-white px-2.5 py-1 font-medium ring-1 ring-[#E5E7EB]">
                  {cities.length} {cities.length === 1 ? "city" : "cities"}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFinderOpen(true)}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] px-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(17,24,39,0.18)] transition-transform active:scale-[0.99] lg:mt-0 lg:w-auto lg:px-5"
          >
            <Sparkles className="h-4 w-4 text-[#86EFAC]" />
            Match me to a coach
          </button>
        </div>

        <div className="sticky top-0 z-30 -mx-4 mt-5 border-y border-[#E8EBE4] bg-[#F7F8F5]/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <CoachFilters
            filters={filters}
            onChange={patchFilters}
            onOpenQuiz={() => setFinderOpen(true)}
            resultCount={filtered.length}
            cities={cities}
            courts={courts}
          />
        </div>

        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-12 text-center ring-1 ring-[#E8EBE4]">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F0FDF4] text-[#166534]">
                <Search className="h-5 w-5" />
              </span>
              <p className="font-heading mt-3 text-base font-semibold text-[#111827]">
                No coaches match
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">Try another city, court, or clear filters.</p>
              <button
                type="button"
                onClick={() => patchFilters({ ...EMPTY_COACH_FILTERS, sort: filters.sort })}
                className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#16A34A] px-5 text-sm font-semibold text-white"
              >
                Show all coaches
              </button>
            </div>
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-1 lg:grid-cols-2">
              {filtered.map((coach) => (
                <li key={coach.id}>
                  <CoachCard coach={coach} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="relative z-[1] mt-auto border-t border-[#E8EBE4] bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <a
              href={BRAND_SOCIAL.facebook.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
              aria-label={`${BRAND_NAME} on Facebook`}
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={BRAND_SOCIAL.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151]"
              aria-label={`${BRAND_NAME} on Instagram`}
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
          </div>
          <p className="text-center text-[11px] text-[#9CA3AF]">
            © {new Date().getFullYear()} {BRAND_NAME} · @{BRAND_SOCIAL.instagram.handle}
          </p>
        </div>
      </footer>

      <CoachFinder
        open={finderOpen}
        onClose={() => setFinderOpen(false)}
        coaches={coaches}
        onApply={applyFinder}
      />
    </div>
  );
}
