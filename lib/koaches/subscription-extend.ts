import { addMonths, format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDateValue } from "@/lib/utils";

/** Extend coach subscription from the later of today or current expiry. */
export async function extendCoachSubscriptionByMonths(
  supabase: SupabaseClient,
  coachId: string,
  months = 1
): Promise<string> {
  const { data: row, error: fetchError } = await supabase
    .from("coaches")
    .select("subscription_expiry")
    .eq("id", coachId)
    .maybeSingle();
  if (fetchError) throw fetchError;
  if (!row) throw new Error("Coach not found.");

  const today = format(new Date(), "yyyy-MM-dd");
  const base =
    row.subscription_expiry && row.subscription_expiry >= today
      ? parseDateValue(row.subscription_expiry)
      : new Date();
  const nextExpiry = format(addMonths(base, months), "yyyy-MM-dd");

  const { error } = await supabase
    .from("coaches")
    .update({
      subscription_expiry: nextExpiry,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", coachId);
  if (error) throw error;

  return nextExpiry;
}
