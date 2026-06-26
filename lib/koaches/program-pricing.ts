import type { Program } from "./types";
import { formatCurrency } from "@/lib/utils";

export function formatProgramBundleSummary(
  program: Pick<Program, "price" | "sessionCount">
): string {
  return `${formatCurrency(program.price)}/person · ${program.sessionCount} sessions`;
}

/** Revenue attributed to each program session when tracking earnings (bundle ÷ sessions) */
export function getProgramPerSessionRevenue(program: Pick<Program, "price" | "sessionCount">): number {
  return Math.round(program.price / program.sessionCount);
}
