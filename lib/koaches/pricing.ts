import type { CoachSessionPricing, SessionRateTier } from "@/lib/koaches/types";
import { HOURLY_SESSION_MINUTES } from "@/lib/koaches/session-slots";
import { formatCurrency } from "@/lib/utils";

export type SessionRateChargeType = SessionRateTier["chargeType"];

export function tierPlayerLabel(minPlayers: number, maxPlayers: number): string {
  if (minPlayers === maxPlayers) {
    return minPlayers === 1 ? "1 player" : `${minPlayers} players`;
  }
  return `${minPlayers}–${maxPlayers} players`;
}

export function formatDurationHours(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${minutes} min`;
}

export function formatTierLabel(tier: SessionRateTier): string {
  return `${tierPlayerLabel(tier.minPlayers, tier.maxPlayers)} · ${formatDurationHours(tier.durationMinutes)}`;
}

export function formatTierRate(tier: SessionRateTier): string {
  if (tier.chargeType === "flat") {
    return `${formatCurrency(tier.rate)} total`;
  }
  return `${formatCurrency(tier.rate)}/person`;
}

/** Lowest displayable starting amount for “from ₱X” summaries. */
export function getStartingRate(pricing: CoachSessionPricing): number {
  const normalized = normalizeSessionPricing(pricing);
  if (normalized.tiers.length === 0) return 0;
  return Math.min(
    ...normalized.tiers.map((t) =>
      t.chargeType === "flat" ? t.rate : t.rate
    )
  );
}

export function findDropInTier(
  pricing: CoachSessionPricing,
  playerCount: number,
  durationMinutes: number
): SessionRateTier | null {
  const normalized = normalizeSessionPricing(pricing);
  return (
    normalized.tiers.find(
      (t) =>
        playerCount >= t.minPlayers &&
        playerCount <= t.maxPlayers &&
        t.durationMinutes === durationMinutes
    ) ?? null
  );
}

/** Per-person drop-in rate when the matched tier is per_person; otherwise null. */
export function getPerPersonRate(
  pricing: CoachSessionPricing,
  playerCount: number,
  durationMinutes?: number
): number | null {
  const duration = durationMinutes ?? normalizeSessionPricing(pricing).defaultDurationMinutes;
  const tier = findDropInTier(pricing, playerCount, duration);
  if (!tier || tier.chargeType === "flat") return null;
  return tier.rate;
}

/**
 * @deprecated Use getPerPersonRate / getDropInSessionTotal with duration.
 */
export function getRateForPlayers(
  pricing: CoachSessionPricing,
  playerCount: number
): number | null {
  return getPerPersonRate(pricing, playerCount);
}

/** Session total charged for a drop-in. */
export function getDropInSessionTotal(
  pricing: CoachSessionPricing,
  playerCount: number,
  durationMinutes?: number
): number | null {
  const duration = durationMinutes ?? normalizeSessionPricing(pricing).defaultDurationMinutes;
  const tier = findDropInTier(pricing, playerCount, duration);
  if (!tier) return null;
  if (tier.chargeType === "flat") return tier.rate;
  return tier.rate * playerCount;
}

export function formatPricingSummary(pricing: CoachSessionPricing): string {
  const normalized = normalizeSessionPricing(pricing);
  const start = getStartingRate(normalized);
  if (normalized.tiers.length <= 1) {
    const tier = normalized.tiers[0];
    if (!tier) return formatCurrency(start);
    return tier.chargeType === "flat"
      ? `${formatCurrency(tier.rate)} drop-in`
      : `${formatCurrency(tier.rate)}/person drop-in`;
  }
  return `Drop-in from ${formatCurrency(start)}`;
}

export function formatSuggestedDropInHint(
  pricing: CoachSessionPricing,
  playerCount: number,
  durationMinutes: number,
  suggested: number
): string {
  const tier = findDropInTier(pricing, playerCount, durationMinutes);
  if (!tier || suggested <= 0) {
    return "No package for this players + length. Enter a price.";
  }
  if (tier.chargeType === "flat") {
    return `Package: ${formatTierLabel(tier)} · ${formatCurrency(suggested)} total`;
  }
  return `${formatCurrency(tier.rate)}/person × ${playerCount} = ${formatCurrency(suggested)}`;
}

function sanitizeTier(raw: unknown, fallbackDuration: number): SessionRateTier | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Partial<SessionRateTier> & { rate?: number };
  if (typeof t.id !== "string" || typeof t.rate !== "number") return null;
  const minPlayers = Math.max(1, Number(t.minPlayers) || 1);
  const maxPlayers = Math.max(minPlayers, Number(t.maxPlayers) || minPlayers);
  const durationMinutes = Math.max(
    HOURLY_SESSION_MINUTES,
    Number(t.durationMinutes) || fallbackDuration
  );
  const chargeType: SessionRateChargeType =
    t.chargeType === "flat" ? "flat" : "per_person";
  return {
    id: t.id,
    minPlayers,
    maxPlayers,
    durationMinutes,
    chargeType,
    rate: Math.max(0, t.rate),
  };
}

/** Booking form default length — most common package length (ties → shortest). */
export function inferDefaultDurationMinutes(
  tiers: SessionRateTier[],
  fallback = DEFAULT_SESSION_PRICING.defaultDurationMinutes
): number {
  if (tiers.length === 0) return fallback;
  const counts = new Map<number, number>();
  for (const tier of tiers) {
    counts.set(tier.durationMinutes, (counts.get(tier.durationMinutes) ?? 0) + 1);
  }
  let best = tiers[0]!.durationMinutes;
  let bestCount = 0;
  for (const [minutes, count] of counts) {
    if (count > bestCount || (count === bestCount && minutes < best)) {
      best = minutes;
      bestCount = count;
    }
  }
  return Math.max(HOURLY_SESSION_MINUTES, best);
}

/** Normalize legacy tiers (no duration / chargeType) into the current shape. */
export function normalizeSessionPricing(value: unknown): CoachSessionPricing {
  const fallback = DEFAULT_SESSION_PRICING;
  if (!value || typeof value !== "object") return fallback;

  const raw = value as Partial<CoachSessionPricing>;
  const storedDefault = Math.max(
    HOURLY_SESSION_MINUTES,
    Number(raw.defaultDurationMinutes) || fallback.defaultDurationMinutes
  );
  const minimumPlayers = Math.max(1, Number(raw.minimumPlayers) || fallback.minimumPlayers);
  const maximumPlayers = Math.max(
    minimumPlayers,
    Number(raw.maximumPlayers) || fallback.maximumPlayers
  );

  const tiers = Array.isArray(raw.tiers)
    ? raw.tiers
        .map((t) => sanitizeTier(t, storedDefault))
        .filter((t): t is SessionRateTier => t != null)
    : [];

  if (tiers.length === 0) {
    return {
      minimumPlayers,
      maximumPlayers,
      defaultDurationMinutes: storedDefault,
      tiers: fallback.tiers.map((t) => ({
        ...t,
        durationMinutes: storedDefault,
      })),
    };
  }

  return {
    minimumPlayers,
    maximumPlayers,
    defaultDurationMinutes: inferDefaultDurationMinutes(tiers, storedDefault),
    tiers,
  };
}

/** True when two tiers compete for the same booking (overlapping pax + same duration). */
export function sessionPricingTiersOverlap(a: SessionRateTier, b: SessionRateTier): boolean {
  if (a.durationMinutes !== b.durationMinutes) return false;
  return a.minPlayers <= b.maxPlayers && b.minPlayers <= a.maxPlayers;
}

export function validateSessionPricing(pricing: CoachSessionPricing): string | null {
  const normalized = normalizeSessionPricing(pricing);
  if (normalized.tiers.length === 0) return "Add at least one rate package.";
  if (normalized.minimumPlayers > normalized.maximumPlayers) {
    return "Minimum players can’t be higher than maximum.";
  }

  for (const tier of normalized.tiers) {
    if (tier.minPlayers > tier.maxPlayers) {
      return "Each package needs min players ≤ max players.";
    }
    if (tier.durationMinutes < HOURLY_SESSION_MINUTES) {
      return "Session length must be at least 1 hour.";
    }
    if (tier.rate < 0) return "Rates can’t be negative.";
  }

  for (let i = 0; i < normalized.tiers.length; i++) {
    for (let j = i + 1; j < normalized.tiers.length; j++) {
      if (sessionPricingTiersOverlap(normalized.tiers[i], normalized.tiers[j])) {
        return "Two packages overlap for the same players and length. Adjust one of them.";
      }
    }
  }

  return null;
}

export const DEFAULT_SESSION_PRICING: CoachSessionPricing = {
  minimumPlayers: 1,
  maximumPlayers: 4,
  defaultDurationMinutes: 60,
  tiers: [
    {
      id: "t1",
      minPlayers: 1,
      maxPlayers: 1,
      durationMinutes: 60,
      chargeType: "per_person",
      rate: 1000,
    },
    {
      id: "t2",
      minPlayers: 2,
      maxPlayers: 4,
      durationMinutes: 60,
      chargeType: "per_person",
      rate: 800,
    },
  ],
};
