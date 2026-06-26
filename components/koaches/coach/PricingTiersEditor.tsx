"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CoachSessionPricing, SessionRateTier } from "@/lib/koaches/types";
import { formatTierLabel } from "@/lib/koaches/pricing";

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
        <div>
          <label className="text-xs font-medium text-[#6B7280]">Minimum players</label>
          <input
            type="number"
            min={1}
            className="coach-input mt-1"
            value={pricing.minimumPlayers}
            onChange={(e) =>
              onChange({ ...pricing, minimumPlayers: Math.max(1, Number(e.target.value)) })
            }
          />
          <p className="mt-1 text-[10px] text-[#6B7280]">Smallest group you&apos;ll accept</p>
        </div>
        <div>
          <label className="text-xs font-medium text-[#6B7280]">Maximum players</label>
          <input
            type="number"
            min={1}
            className="coach-input mt-1"
            value={pricing.maximumPlayers}
            onChange={(e) =>
              onChange({ ...pricing, maximumPlayers: Math.max(1, Number(e.target.value)) })
            }
          />
          <p className="mt-1 text-[10px] text-[#6B7280]">Largest group per session</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[#6B7280]">Default session length (min)</label>
        <input
          type="number"
          min={60}
          step={60}
          className="coach-input mt-1"
          value={pricing.defaultDurationMinutes}
          onChange={(e) =>
            onChange({ ...pricing, defaultDurationMinutes: Math.max(60, Number(e.target.value)) })
          }
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#6B7280]">Rates by group size</label>
          <button
            type="button"
            onClick={addTier}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#E07A5F]"
          >
            <Plus className="h-3.5 w-3.5" /> Add tier
          </button>
        </div>
        <p className="mt-0.5 text-[10px] text-[#6B7280]">
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
                <div>
                  <label className="text-[10px] text-[#6B7280]">Min pax</label>
                  <input
                    type="number"
                    min={1}
                    className="coach-input mt-0.5 text-sm"
                    value={tier.minPlayers}
                    onChange={(e) =>
                      updateTier(tier.id, { minPlayers: Math.max(1, Number(e.target.value)) })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280]">Max pax</label>
                  <input
                    type="number"
                    min={1}
                    className="coach-input mt-0.5 text-sm"
                    value={tier.maxPlayers}
                    onChange={(e) =>
                      updateTier(tier.id, { maxPlayers: Math.max(1, Number(e.target.value)) })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B7280]">Rate (₱)</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    className="coach-input mt-0.5 text-sm"
                    value={tier.rate}
                    onChange={(e) =>
                      updateTier(tier.id, { rate: Math.max(0, Number(e.target.value)) })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
