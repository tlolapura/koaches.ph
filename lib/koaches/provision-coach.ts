import { addMonths, format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidCoachSlug, resolveCoachSlug } from "@/lib/koaches/coach-slug";
import type { DbCoach } from "@/lib/koaches/db/mappers";
import { getEarlyBirdCapacityError } from "@/lib/koaches/early-bird";
import { DEFAULT_SESSION_PRICING, getStartingRate } from "@/lib/koaches/pricing";
import type { CoachProfile, CoachSessionPricing, SkillRubricId } from "@/lib/koaches/types";

export type ProvisionCoachProfile = {
  fullName: string;
  mobile: string;
  preferredSlug?: string;
  specialization?: string;
  bio?: string;
  skillTemplateId?: SkillRubricId;
  subscriptionPlan?: CoachProfile["subscriptionPlan"];
  sessionPricing?: CoachSessionPricing;
};

export type ProvisionCoachCredentials = {
  loginEmail: string;
  password: string;
};

export type ProvisionCoachResult =
  | { ok: true; coachId: string; slug: string; loginEmail: string; userId: string }
  | { ok: false; error: string };

export function validateCoachLoginEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Please enter a valid email.";
  return null;
}

export function validateCoachLoginPassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function buildCoachRow(
  profile: ProvisionCoachProfile,
  opts: { coachId: string; slug: string; userId: string; subscriptionExpiry: string }
): Omit<DbCoach, "created_at" | "updated_at"> {
  const sessionPricing = profile.sessionPricing ?? DEFAULT_SESSION_PRICING;
  return {
    id: opts.coachId,
    user_id: opts.userId,
    slug: opts.slug,
    name: profile.fullName.trim(),
    photo_url: null,
    bio: profile.bio?.trim() ?? "",
    specialization: profile.specialization?.trim() ?? "",
    rate_per_session: getStartingRate(sessionPricing),
    session_pricing: sessionPricing,
    court_ids: [],
    mobile: profile.mobile.trim() || null,
    instagram: null,
    facebook: null,
    skill_template_id: profile.skillTemplateId ?? "intermediate",
    free_trial_enabled: false,
    free_trial_weekly_cap: 0,
    subscription_plan: profile.subscriptionPlan ?? "early-bird",
    subscription_expiry: opts.subscriptionExpiry,
    is_active: true,
    total_students: 0,
    total_sessions: 0,
  };
}

async function rollbackCoachAccount(
  supabase: SupabaseClient,
  userId: string | null,
  coachId: string | null
) {
  if (coachId) {
    await supabase.from("profiles").delete().eq("coach_id", coachId);
    await supabase.from("coaches").delete().eq("id", coachId);
  }
  if (userId) {
    await supabase.auth.admin.deleteUser(userId);
  }
}

/** Create auth user, coaches row, and profiles row for a new coach. */
export async function provisionCoachAccount(
  supabase: SupabaseClient,
  profile: ProvisionCoachProfile,
  credentials: ProvisionCoachCredentials
): Promise<ProvisionCoachResult> {
  const emailError = validateCoachLoginEmail(credentials.loginEmail);
  if (emailError) return { ok: false, error: emailError };
  const passwordError = validateCoachLoginPassword(credentials.password);
  if (passwordError) return { ok: false, error: passwordError };

  if (!profile.fullName.trim()) return { ok: false, error: "Full name is required." };
  if (!profile.mobile.trim()) return { ok: false, error: "Mobile number is required." };

  const plan = profile.subscriptionPlan ?? "early-bird";
  if (plan === "early-bird") {
    const capacityError = await getEarlyBirdCapacityError(supabase);
    if (capacityError) return { ok: false, error: capacityError };
  }

  const preferredSlug = profile.preferredSlug?.trim().toLowerCase();
  if (preferredSlug && !isValidCoachSlug(preferredSlug)) {
    return {
      ok: false,
      error: "Profile URL can only use lowercase letters, numbers, and hyphens.",
    };
  }

  const loginEmail = credentials.loginEmail.trim().toLowerCase();
  const coachId = `coach-${crypto.randomUUID().slice(0, 8)}`;
  const slug = await resolveCoachSlug(supabase, {
    fullName: profile.fullName,
    preferredSlug,
  });
  const subscriptionExpiry = format(addMonths(new Date(), 1), "yyyy-MM-dd");

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: loginEmail,
    password: credentials.password,
    email_confirm: true,
    user_metadata: { full_name: profile.fullName.trim() },
  });
  if (authError || !authData.user) {
    return { ok: false, error: authError?.message ?? "Could not create login account." };
  }

  const userId = authData.user.id;
  const coachRow = buildCoachRow(profile, { coachId, slug, userId, subscriptionExpiry });

  const { error: coachError } = await supabase.from("coaches").insert(coachRow);
  if (coachError) {
    await rollbackCoachAccount(supabase, userId, null);
    return { ok: false, error: coachError.message };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: userId,
    email: loginEmail,
    full_name: profile.fullName.trim(),
    role: "coach",
    coach_id: coachId,
  });
  if (profileError) {
    await rollbackCoachAccount(supabase, userId, coachId);
    return { ok: false, error: profileError.message };
  }

  return { ok: true, coachId, slug, loginEmail, userId };
}
