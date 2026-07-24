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

/** Lowest per-person rate on the card (for “from ₱X” summaries). */
export function getStartingRate(pricing: CoachSessionPricing): number {
  if (pricing.tiers.length === 0) return 0;
  return Math.min(...pricing.tiers.map((t) => t.rate));
}

/** Per-person drop-in rate for this group size. */
export function getPerPersonRate(
  pricing: CoachSessionPricing,
  playerCount: number
): number | null {
  const tier = pricing.tiers.find(
    (t) => playerCount >= t.minPlayers && playerCount <= t.maxPlayers
  );
  return tier?.rate ?? null;
}

/**
 * @deprecated Use getPerPersonRate — rate is per person, not group total.
 * Kept as an alias so older call sites keep compiling during the switch.
 */
export function getRateForPlayers(
  pricing: CoachSessionPricing,
  playerCount: number
): number | null {
  return getPerPersonRate(pricing, playerCount);
}

/** Session total charged for a drop-in = per-person rate × players. */
export function getDropInSessionTotal(
  pricing: CoachSessionPricing,
  playerCount: number
): number | null {
  const perPerson = getPerPersonRate(pricing, playerCount);
  if (perPerson == null) return null;
  return perPerson * playerCount;
}

export function formatPricingSummary(pricing: CoachSessionPricing): string {
  const start = getStartingRate(pricing);
  if (pricing.tiers.length <= 1) {
    return `${formatCurrency(start)}/person drop-in`;
  }
  return `Drop-in from ${formatCurrency(start)}/person`;
}

export function formatTierRate(tier: SessionRateTier): string {
  return `${formatCurrency(tier.rate)}/person`;
}

export const DEFAULT_SESSION_PRICING: CoachSessionPricing = {
  minimumPlayers: 1,
  maximumPlayers: 4,
  defaultDurationMinutes: 60,
  tiers: [
    { id: "t1", minPlayers: 1, maxPlayers: 1, rate: 1000 },
    { id: "t2", minPlayers: 2, maxPlayers: 4, rate: 800 },
  ],
};
