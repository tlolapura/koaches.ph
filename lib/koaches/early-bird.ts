import type { SupabaseClient } from "@supabase/supabase-js";

export const EARLY_BIRD_SLOTS_TOTAL = 50;

export async function countActiveEarlyBirdCoaches(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("coaches")
    .select("*", { count: "exact", head: true })
    .eq("subscription_plan", "early-bird")
    .eq("is_active", true);
  if (error) throw error;
  return count ?? 0;
}

/** Returns an error message when early-bird slots are full. */
export async function getEarlyBirdCapacityError(
  supabase: SupabaseClient
): Promise<string | null> {
  const used = await countActiveEarlyBirdCoaches(supabase);
  if (used >= EARLY_BIRD_SLOTS_TOTAL) {
    return `Early bird plan is full (${EARLY_BIRD_SLOTS_TOTAL} coaches). Use regular plan or wait for a slot.`;
  }
  return null;
}
