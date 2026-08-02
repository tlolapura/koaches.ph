"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CoachSessionPricing, SessionRateTier } from "@/lib/koaches/types";
import { formatTierLabel, normalizeSessionPricing } from "@/lib/koaches/pricing";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";
import { cn } from "@/lib/utils";

type PricingTiersEditorProps = {
  pricing: CoachSessionPricing;
  onChange: (pricing: CoachSessionPricing) => void;
  /** basics = group size & duration; tiers = rate tiers; primary-rate = 1-on-1 only; full = everything */
  mode?: "full" | "basics" | "tiers" | "primary-rate";
};

function newTierId(): string {
  return `tier-${Date.now()}`;
}

const DURATION_OPTIONS = [60, 120, 180] as const;

export function PricingTiersEditor({
  pricing,
  onChange,
  mode = "full",
}: PricingTiersEditorProps) {
  const normalized = normalizeSessionPricing(pricing);

  const commit = (next: CoachSessionPricing) => {
    onChange(normalizeSessionPricing(next));
  };

  const updateTier = (id: string, patch: Partial<SessionRateTier>) => {
    commit({
      ...normalized,
      tiers: normalized.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const addTier = () => {
    const last = normalized.tiers[normalized.tiers.length - 1];
    const nextMin = last ? last.maxPlayers + 1 : normalized.minimumPlayers;
    commit({
      ...normalized,
      tiers: [
        ...normalized.tiers,
        {
          id: newTierId(),
          minPlayers: nextMin,
          maxPlayers: Math.min(nextMin, normalized.maximumPlayers),
          durationMinutes: last?.durationMinutes ?? normalized.defaultDurationMinutes,
          chargeType: last?.chargeType ?? "per_person",
          rate: last?.rate ?? 800,
        },
      ],
    });
  };

  const removeTier = (id: string) => {
    if (normalized.tiers.length <= 1) return;
    commit({ ...normalized, tiers: normalized.tiers.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-4">
      {(mode === "full" || mode === "basics") && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <CoachSheetField
              label="Minimum players"
              htmlFor="pricing-min-players"
              hint="Smallest group you'll accept"
            >
              <input
                id="pricing-min-players"
                type="number"
                min={1}
                className="coach-input"
                placeholder="1"
                value={normalized.minimumPlayers}
                onChange={(e) =>
                  commit({
                    ...normalized,
                    minimumPlayers: Math.max(1, Number(e.target.value)),
                  })
                }
              />
            </CoachSheetField>
            <CoachSheetField
              label="Maximum players"
              htmlFor="pricing-max-players"
              hint="Largest group per session"
            >
              <input
                id="pricing-max-players"
                type="number"
                min={1}
                className="coach-input"
                placeholder="4"
                value={normalized.maximumPlayers}
                onChange={(e) =>
                  commit({
                    ...normalized,
                    maximumPlayers: Math.max(1, Number(e.target.value)),
                  })
                }
              />
            </CoachSheetField>
          </div>
        </>
      )}

      {(mode === "full" || mode === "tiers" || mode === "primary-rate") && (
        <div>
          {mode === "primary-rate" ? (
            <CoachSheetField label="1-on-1 rate (₱ per person)" htmlFor="pricing-primary-rate">
              <input
                id="pricing-primary-rate"
                type="number"
                min={0}
                step={50}
                className="coach-input"
                placeholder="1000"
                value={normalized.tiers[0]?.rate ?? 1000}
                onChange={(e) => {
                  const rate = Math.max(0, Number(e.target.value));
                  const [first, ...rest] = normalized.tiers;
                  if (!first) return;
                  commit({
                    ...normalized,
                    tiers: [{ ...first, rate, chargeType: "per_person" }, ...rest],
                  });
                }}
              />
            </CoachSheetField>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="coach-label">Rate packages</span>
                <button
                  type="button"
                  onClick={addTier}
                  className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add package
                </button>
              </div>
              <p className="coach-field-hint">
                Players + length + price. Use “Each” for ₱600/person, or “Total” for a flat package.
              </p>

              <div className="mt-2 space-y-2">
                {normalized.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#374151]">
                        {formatTierLabel(tier)}
                      </span>
                      {normalized.tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(tier.id)}
                          className="-my-2 flex h-10 w-10 items-center justify-center text-[#6B7280] hover:text-[#EF4444]"
                          aria-label="Remove package"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <CoachSheetField label="Min pax" htmlFor={`tier-${tier.id}-min`}>
                        <input
                          id={`tier-${tier.id}-min`}
                          type="number"
                          min={1}
                          className="coach-input"
                          value={tier.minPlayers}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              minPlayers: Math.max(1, Number(e.target.value)),
                            })
                          }
                        />
                      </CoachSheetField>
                      <CoachSheetField label="Max pax" htmlFor={`tier-${tier.id}-max`}>
                        <input
                          id={`tier-${tier.id}-max`}
                          type="number"
                          min={1}
                          className="coach-input"
                          value={tier.maxPlayers}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              maxPlayers: Math.max(1, Number(e.target.value)),
                            })
                          }
                        />
                      </CoachSheetField>
                      <CoachSheetField label="Length" htmlFor={`tier-${tier.id}-duration`}>
                        <select
                          id={`tier-${tier.id}-duration`}
                          className="coach-input"
                          value={tier.durationMinutes}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              durationMinutes: Number(e.target.value),
                            })
                          }
                        >
                          {DURATION_OPTIONS.map((mins) => (
                            <option key={mins} value={mins}>
                              {mins / 60} hr
                            </option>
                          ))}
                          {!DURATION_OPTIONS.includes(
                            tier.durationMinutes as (typeof DURATION_OPTIONS)[number]
                          ) && (
                            <option value={tier.durationMinutes}>
                              {tier.durationMinutes} min
                            </option>
                          )}
                        </select>
                      </CoachSheetField>
                      <CoachSheetField
                        label={tier.chargeType === "flat" ? "₱ total" : "₱ each"}
                        htmlFor={`tier-${tier.id}-rate`}
                      >
                        <input
                          id={`tier-${tier.id}-rate`}
                          type="number"
                          min={0}
                          step={50}
                          className="coach-input"
                          value={tier.rate}
                          onChange={(e) =>
                            updateTier(tier.id, {
                              rate: Math.max(0, Number(e.target.value)),
                            })
                          }
                        />
                      </CoachSheetField>
                    </div>

                    <div className="mt-2 flex gap-2">
                      {(
                        [
                          { id: "per_person", label: "Each" },
                          { id: "flat", label: "Total" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateTier(tier.id, { chargeType: opt.id })}
                          className={cn(
                            "min-h-[36px] flex-1 rounded-lg px-3 text-xs font-semibold transition-colors",
                            tier.chargeType === opt.id
                              ? "bg-[#16A34A] text-white"
                              : "bg-white text-[#6B7280] ring-1 ring-[#E5E7EB]"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
