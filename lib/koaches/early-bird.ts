import type { SupabaseClient } from "@supabase/supabase-js";

/** First N coaches get free-for-life (subscription_plan = early-bird). */
export const EARLY_BIRD_SLOTS_TOTAL = 30;

export async function countActiveEarlyBirdCoaches(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("coaches")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "early-bird")
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

/** Returns an error message when founding (free) slots are full. */
export async function getEarlyBirdCapacityError(
  supabase: SupabaseClient
): Promise<string | null> {
  const used = await countActiveEarlyBirdCoaches(supabase);
  if (used >= EARLY_BIRD_SLOTS_TOTAL) {
    return `Founding free slots are full (${EARLY_BIRD_SLOTS_TOTAL} coaches). Use the monthly plan (₱299/mo).`;
  }
  return null;
}

/** Prefer founding free plan while slots remain; otherwise monthly. */
export async function resolveNewCoachSubscriptionPlan(
  supabase: SupabaseClient
): Promise<"early-bird" | "regular"> {
  const used = await countActiveEarlyBirdCoaches(supabase);
  return used < EARLY_BIRD_SLOTS_TOTAL ? "early-bird" : "regular";
}
