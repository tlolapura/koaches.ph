"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Filter, Search, Sparkles, X } from "lucide-react";
import { CoachBottomSheet } from "@/components/koaches/coach/CoachBottomSheet";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachSheetFooterActions } from "@/components/koaches/coach/CoachSheet";
import {
  EXPERIENCE_OPTIONS,
  SORT_OPTIONS,
  type CoachSortId,
  type ExperienceLevel,
} from "@/lib/koaches/discovery";
import { cn } from "@/lib/utils";

export type CoachFilterState = {
  search: string;
  city: string;
  courtId: string;
  level: ExperienceLevel | "";
  freeTrialOnly: boolean;
  sort: CoachSortId;
};

export const EMPTY_COACH_FILTERS: CoachFilterState = {
  search: "",
  city: "",
  courtId: "",
  level: "",
  freeTrialOnly: false,
  sort: "featured",
};

type CourtOption = { id: string; name: string; city?: string };

type CoachFiltersProps = {
  filters: CoachFilterState;
  onChange: (patch: Partial<CoachFilterState>) => void;
  onOpenQuiz: () => void;
  resultCount: number;
  cities: string[];
  courts: CourtOption[];
};

export function CoachFilters({
  filters,
  onChange,
  onOpenQuiz,
  resultCount,
  cities,
  courts,
}: CoachFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<CoachFilterState>(filters);

  useEffect(() => {
    if (sheetOpen) setDraft(filters);
  }, [sheetOpen, filters]);

  const draftCourts = useMemo(() => {
    if (!draft.city) return courts;
    return courts.filter((c) => c.city === draft.city);
  }, [courts, draft.city]);

  const visibleCourts = useMemo(() => {
    if (!filters.city) return courts;
    return courts.filter((c) => c.city === filters.city);
  }, [courts, filters.city]);

  const activeFilterCount = [
    filters.city,
    filters.courtId,
    filters.level,
    filters.freeTrialOnly,
  ].filter(Boolean).length;

  const hasActive = activeFilterCount > 0 || Boolean(filters.search);

  const clearAll = () => onChange({ ...EMPTY_COACH_FILTERS, sort: filters.sort });

  const patchDraft = (patch: Partial<CoachFilterState>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (patch.city !== undefined && patch.city !== prev.city) {
        next.courtId = "";
      }
      if (patch.courtId) {
        const court = courts.find((c) => c.id === patch.courtId);
        if (court?.city) next.city = court.city;
      }
      return next;
    });
  };

  const applyDraft = () => {
    onChange({
      city: draft.city,
      courtId: draft.courtId,
      level: draft.level,
      freeTrialOnly: draft.freeTrialOnly,
    });
    setSheetOpen(false);
  };

  const selectedCourtName = courts.find((c) => c.id === filters.courtId)?.name;
  const selectedLevelLabel = EXPERIENCE_OPTIONS.find((o) => o.id === filters.level)?.label;
  const sortLabel = SORT_OPTIONS.find((o) => o.id === filters.sort)?.label ?? "Featured";

  return (
    <div>
      <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-[#E8EBE4] focus-within:ring-2 focus-within:ring-[#86EFAC]">
        <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search coach, city, or court…"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
          aria-label="Search coaches"
        />
        {filters.search ? (
          <button
            type="button"
            onClick={() => onChange({ search: "" })}
            className="rounded-full p-1 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {/* Mobile / tablet toolbar */}
      <div className="mt-2.5 flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            "inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold ring-1 ring-[#E8EBE4]",
            activeFilterCount > 0 ? "text-[#15803D] ring-[#86EFAC]" : "text-[#111827]"
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="rounded-full bg-[#16A34A] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <label className="relative inline-flex min-h-[42px] flex-1 items-center">
          <ArrowUpDown className="pointer-events-none absolute left-3 h-4 w-4 text-[#6B7280]" />
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as CoachSortId })}
            className="h-full w-full appearance-none rounded-xl bg-white py-2 pl-9 pr-8 text-sm font-semibold text-[#111827] ring-1 ring-[#E8EBE4] focus:outline-none focus:ring-2 focus:ring-[#86EFAC]"
            aria-label="Sort coaches"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Desktop filters */}
      <div className="mt-3 hidden gap-3 lg:grid lg:grid-cols-[1fr_1fr_1fr_auto]">
        <FilterSelect
          label="City"
          value={filters.city}
          onChange={(city) => {
            onChange({ city, courtId: "" });
          }}
          options={[
            { value: "", label: "All cities" },
            ...cities.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterSelect
          label="Court"
          value={filters.courtId}
          onChange={(courtId) => {
            const court = courts.find((c) => c.id === courtId);
            onChange({
              courtId,
              ...(court?.city ? { city: court.city } : {}),
            });
          }}
          options={[
            { value: "", label: "All courts" },
            ...visibleCourts.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <FilterSelect
          label="Level"
          value={filters.level}
          onChange={(level) => onChange({ level: level as ExperienceLevel | "" })}
          options={[
            { value: "", label: "Any level" },
            ...EXPERIENCE_OPTIONS.map((o) => ({ value: o.id, label: o.label })),
          ]}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Sort
          </span>
          <select
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as CoachSortId })}
            className="h-[42px] rounded-xl bg-white px-3 text-sm font-medium text-[#111827] ring-1 ring-[#E8EBE4] focus:outline-none focus:ring-2 focus:ring-[#86EFAC]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2.5 hidden items-center justify-between gap-3 lg:flex">
        <button
          type="button"
          onClick={() => onChange({ freeTrialOnly: !filters.freeTrialOnly })}
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            filters.freeTrialOnly
              ? "bg-[#16A34A] text-white"
              : "bg-white text-[#6B7280] ring-1 ring-[#E8EBE4] hover:bg-[#F9FAFB]"
          )}
        >
          Free trial only
        </button>
        <button
          type="button"
          onClick={onOpenQuiz}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Match me
        </button>
      </div>

      {(filters.city || filters.courtId || filters.level || filters.freeTrialOnly) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {filters.city ? (
            <ActiveChip
              label={filters.city}
              onClear={() => onChange({ city: "", courtId: "" })}
            />
          ) : null}
          {selectedCourtName ? (
            <ActiveChip label={selectedCourtName} onClear={() => onChange({ courtId: "" })} />
          ) : null}
          {selectedLevelLabel ? (
            <ActiveChip label={selectedLevelLabel} onClear={() => onChange({ level: "" })} />
          ) : null}
          {filters.freeTrialOnly ? (
            <ActiveChip
              label="Free trial"
              onClear={() => onChange({ freeTrialOnly: false })}
            />
          ) : null}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="text-xs text-[#6B7280]">
          {resultCount} {resultCount === 1 ? "coach" : "coaches"}
          {filters.sort !== "featured" ? (
            <span className="text-[#9CA3AF]"> · {sortLabel}</span>
          ) : null}
          {hasActive ? (
            <>
              {" · "}
              <button
                type="button"
                onClick={clearAll}
                className="font-semibold text-[#15803D] hover:underline"
              >
                Reset
              </button>
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={onOpenQuiz}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#15803D] lg:hidden"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Match me
        </button>
      </div>

      <CoachBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        subtitle="City, court, and player level"
        footer={
          <CoachSheetFooterActions>
            <CoachButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() =>
                setDraft({
                  ...filters,
                  city: "",
                  courtId: "",
                  level: "",
                  freeTrialOnly: false,
                })
              }
            >
              Clear
            </CoachButton>
            <CoachButton type="button" className="flex-1" onClick={applyDraft}>
              Show results
            </CoachButton>
          </CoachSheetFooterActions>
        }
      >
        <div className="space-y-5">
          <FilterSection title="City">
            <div className="flex flex-wrap gap-2">
              <ChoiceChip
                active={!draft.city}
                onClick={() => patchDraft({ city: "", courtId: "" })}
              >
                All cities
              </ChoiceChip>
              {cities.map((city) => (
                <ChoiceChip
                  key={city}
                  active={draft.city === city}
                  onClick={() =>
                    patchDraft({
                      city: draft.city === city ? "" : city,
                      courtId: "",
                    })
                  }
                >
                  {city}
                </ChoiceChip>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Court">
            {draftCourts.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No courts listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <ChoiceChip active={!draft.courtId} onClick={() => patchDraft({ courtId: "" })}>
                  All courts
                </ChoiceChip>
                {draftCourts.map((court) => (
                  <ChoiceChip
                    key={court.id}
                    active={draft.courtId === court.id}
                    onClick={() =>
                      patchDraft({
                        courtId: draft.courtId === court.id ? "" : court.id,
                      })
                    }
                  >
                    {court.name}
                  </ChoiceChip>
                ))}
              </div>
            )}
          </FilterSection>

          <FilterSection title="Level">
            <div className="flex flex-wrap gap-2">
              <ChoiceChip active={!draft.level} onClick={() => patchDraft({ level: "" })}>
                Any level
              </ChoiceChip>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <ChoiceChip
                  key={opt.id}
                  active={draft.level === opt.id}
                  onClick={() =>
                    patchDraft({ level: draft.level === opt.id ? "" : opt.id })
                  }
                >
                  {opt.label}
                </ChoiceChip>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Extras">
            <button
              type="button"
              onClick={() => patchDraft({ freeTrialOnly: !draft.freeTrialOnly })}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                draft.freeTrialOnly
                  ? "bg-[#16A34A] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280]"
              )}
            >
              Free trial only
            </button>
          </FilterSection>
        </div>
      </CoachBottomSheet>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] rounded-xl bg-white px-3 text-sm font-medium text-[#111827] ring-1 ring-[#E8EBE4] focus:outline-none focus:ring-2 focus:ring-[#86EFAC]"
      >
        {options.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChoiceChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-[#111827] text-white"
          : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
      )}
    >
      {children}
    </button>
  );
}

function ActiveChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#15803D] ring-1 ring-[#BBF7D0]"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  );
}
