"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CoachSessionPricing, SessionRateTier } from "@/lib/koaches/types";
import { formatTierLabel } from "@/lib/koaches/pricing";
import { CoachSheetField } from "@/components/koaches/coach/CoachSheet";

type PricingTiersEditorProps = {
  pricing: CoachSessionPricing;
  onChange: (pricing: CoachSessionPricing) => void;
};

function newTierId(): string {
  return `tier-${Date.now()}`;
}

export function PricingTiersEditor({ pricing, onChange }: PricingTiersEditorProps) {
  const updateTier = (id: string, patch: Partial<SessionRateTier>) => {
    onChange({
      ...pricing,
      tiers: pricing.tiers.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const addTier = () => {
    const last = pricing.tiers[pricing.tiers.length - 1];
    const nextMin = last ? last.maxPlayers + 1 : pricing.minimumPlayers;
    onChange({
      ...pricing,
      tiers: [
        ...pricing.tiers,
        {
          id: newTierId(),
          minPlayers: nextMin,
          maxPlayers: nextMin,
          rate: last?.rate ?? 800,
        },
      ],
    });
  };

  const removeTier = (id: string) => {
    if (pricing.tiers.length <= 1) return;
    onChange({ ...pricing, tiers: pricing.tiers.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-4">
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
            value={pricing.minimumPlayers}
            onChange={(e) =>
              onChange({ ...pricing, minimumPlayers: Math.max(1, Number(e.target.value)) })
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
            value={pricing.maximumPlayers}
            onChange={(e) =>
              onChange({ ...pricing, maximumPlayers: Math.max(1, Number(e.target.value)) })
            }
          />
        </CoachSheetField>
      </div>

      <CoachSheetField label="Default session length (min)" htmlFor="pricing-duration">
        <input
          id="pricing-duration"
          type="number"
          min={60}
          step={60}
          className="coach-input"
          placeholder="60"
          value={pricing.defaultDurationMinutes}
          onChange={(e) =>
            onChange({ ...pricing, defaultDurationMinutes: Math.max(60, Number(e.target.value)) })
          }
        />
      </CoachSheetField>

      <div>
        <div className="flex items-center justify-between">
          <span className="coach-label">Rates by group size</span>
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F8FF7]"
          >
            <Plus className="h-3.5 w-3.5" /> Add tier
          </button>
        </div>
        <p className="coach-field-hint">
          Set different drop-in prices for 1-on-1, pairs, small groups, etc.
        </p>

        <div className="mt-2 space-y-2">
          {pricing.tiers.map((tier) => (
            <div
              key={tier.id}
              className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#374151]">
                  {formatTierLabel(tier)}
                </span>
                {pricing.tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    className="text-[#6B7280] hover:text-[#EF4444]"
                    aria-label="Remove tier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <CoachSheetField label="Min pax" htmlFor={`tier-${tier.id}-min`}>
                  <input
                    id={`tier-${tier.id}-min`}
                    type="number"
                    min={1}
                    className="coach-input"
                    placeholder="1"
                    value={tier.minPlayers}
                    onChange={(e) =>
                      updateTier(tier.id, { minPlayers: Math.max(1, Number(e.target.value)) })
                    }
                  />
                </CoachSheetField>
                <CoachSheetField label="Max pax" htmlFor={`tier-${tier.id}-max`}>
                  <input
                    id={`tier-${tier.id}-max`}
                    type="number"
                    min={1}
                    className="coach-input"
                    placeholder="2"
                    value={tier.maxPlayers}
                    onChange={(e) =>
                      updateTier(tier.id, { maxPlayers: Math.max(1, Number(e.target.value)) })
                    }
                  />
                </CoachSheetField>
                <CoachSheetField label="Rate (₱)" htmlFor={`tier-${tier.id}-rate`}>
                  <input
                    id={`tier-${tier.id}-rate`}
                    type="number"
                    min={0}
                    step={50}
                    className="coach-input"
                    placeholder="800"
                    value={tier.rate}
                    onChange={(e) =>
                      updateTier(tier.id, { rate: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </CoachSheetField>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
