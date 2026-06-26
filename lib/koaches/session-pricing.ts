import type { CoachSessionPricing, Program, Session } from "@/lib/koaches/types";
import { getRateForPlayers } from "@/lib/koaches/pricing";
import { getProgramPerSessionRevenue } from "@/lib/koaches/program-pricing";

/** Suggested price when scheduling a session */
export function suggestSessionPrice(options: {
  type: Session["type"];
  program?: Program;
  playerCount?: number;
  pricing?: CoachSessionPricing;
}): number {
  const { type, program, playerCount = 1, pricing } = options;
  if (type === "program" && program) {
    return getProgramPerSessionRevenue(program);
  }
  if (pricing) {
    return getRateForPlayers(pricing, playerCount) ?? pricing.tiers[0]?.rate ?? 0;
  }
  return 0;
}
