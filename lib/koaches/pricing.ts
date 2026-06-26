import type { CoachSessionPricing, SessionRateTier } from "@/lib/koaches/types";
import { formatCurrency } from "@/lib/utils";

export function tierPlayerLabel(minPlayers: number, maxPlayers: number): string {
  if (minPlayers === maxPlayers) {
    return minPlayers === 1 ? "1 player" : `${minPlayers} players`;
  }
  return `${minPlayers}–${maxPlayers} players`;
}

export function formatTierLabel(tier: SessionRateTier): string {
  return tierPlayerLabel(tier.minPlayers, tier.maxPlayers);
}

export function getStartingRate(pricing: CoachSessionPricing): number {
  if (pricing.tiers.length === 0) return 0;
  return Math.min(...pricing.tiers.map((t) => t.rate));
}

export function getRateForPlayers(pricing: CoachSessionPricing, playerCount: number): number | null {
  const tier = pricing.tiers.find(
    (t) => playerCount >= t.minPlayers && playerCount <= t.maxPlayers
  );
  return tier?.rate ?? null;
}

export function formatPricingSummary(pricing: CoachSessionPricing): string {
  const start = getStartingRate(pricing);
  if (pricing.tiers.length <= 1) {
    return `${formatCurrency(start)} drop-in`;
  }
  return `Drop-in from ${formatCurrency(start)}`;
}

export function formatTierRate(tier: SessionRateTier): string {
  return `${formatCurrency(tier.rate)}/drop-in`;
}

export const DEFAULT_SESSION_PRICING: CoachSessionPricing = {
  minimumPlayers: 1,
  maximumPlayers: 4,
  defaultDurationMinutes: 60,
  tiers: [
    { id: "t1", minPlayers: 1, maxPlayers: 1, rate: 800 },
    { id: "t2", minPlayers: 2, maxPlayers: 2, rate: 1200 },
    { id: "t3", minPlayers: 3, maxPlayers: 4, rate: 1600 },
  ],
};
