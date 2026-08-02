import type { CoachSessionPricing, Program, Session } from "@/lib/koaches/types";
import { getDropInSessionTotal, normalizeSessionPricing } from "@/lib/koaches/pricing";
import { getProgramPerSessionRevenue } from "@/lib/koaches/program-pricing";

/** Suggested price when scheduling a session */
export function suggestSessionPrice(options: {
  type: Session["type"];
  program?: Program;
  playerCount?: number;
  durationMinutes?: number;
  pricing?: CoachSessionPricing;
}): number {
  const { type, program, playerCount = 1, pricing } = options;
  if (type === "program" && program) {
    return getProgramPerSessionRevenue(program);
  }
  if (pricing) {
    const normalized = normalizeSessionPricing(pricing);
    const duration = options.durationMinutes ?? normalized.defaultDurationMinutes;
    return getDropInSessionTotal(normalized, playerCount, duration) ?? 0;
  }
  return 0;
}
