"use server";

import { redirect } from "next/navigation";
import type { Profile } from "@/lib/koaches/auth/profile";
import { isAdminRole, isCoachRole } from "@/lib/koaches/auth/profile";
import { createClient } from "@/lib/supabase/server";

import { validateCoachLoginPassword } from "@/lib/koaches/provision-coach";

export async function coachSignInAction(email: string, password: string, nextPath?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, coach_id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!isCoachRole(profile?.role) || !profile?.coach_id) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "This account is not authorized for the coach portal." };
  }

  redirect(nextPath && nextPath.startsWith("/coach") ? nextPath : "/coach/dashboard");
}

export async function adminSignInAction(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false as const, error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!isAdminRole(profile?.role)) {
    await supabase.auth.signOut();
    return { ok: false as const, error: "Not authorized as platform admin." };
  }

  redirect("/admin");
}

export async function signOutAction(redirectTo: string) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(redirectTo);
}

export async function getProfileAction(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, coach_id")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

export async function getAuthenticatedCoachIdAction(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("current_coach_id");
  if (error) return null;
  return typeof data === "string" && data.length > 0 ? data : null;
}

export type PasswordChangeResult = { ok: true } | { ok: false; error: string };

export async function changeCoachPasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<PasswordChangeResult> {
  const profile = await getProfileAction();
  if (!isCoachRole(profile?.role) || !profile?.email) {
    return { ok: false, error: "Not authorized." };
  }

  const passwordError = validateCoachLoginPassword(newPassword);
  if (passwordError) return { ok: false, error: passwordError };
  if (currentPassword === newPassword) {
    return { ok: false, error: "New password must be different from your current password." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: currentPassword,
  });
  if (verifyError) return { ok: false, error: "Current password is incorrect." };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true };
}
