import { getAuthenticatedCoachIdAction, getProfileAction } from "@/lib/koaches/actions/auth";
import { isAdminRole } from "@/lib/koaches/auth/profile";
import { createServiceClient } from "@/lib/supabase/server";

export async function assertCoachAccess(coachId: string): Promise<string> {
  const authCoachId = await getAuthenticatedCoachIdAction();
  if (!authCoachId || authCoachId !== coachId) {
    throw new Error("Not authorized.");
  }
  return authCoachId;
}

export async function requireAuthenticatedCoachId(): Promise<string> {
  const coachId = await getAuthenticatedCoachIdAction();
  if (!coachId) throw new Error("Not authorized.");
  return coachId;
}

export async function requireAdmin(): Promise<void> {
  const profile = await getProfileAction();
  if (!isAdminRole(profile?.role)) {
    throw new Error("Not authorized as platform admin.");
  }
}

export async function assertCoachOwnsStudent(studentId: string): Promise<string> {
  const coachId = await getAuthenticatedCoachIdAction();
  if (!coachId) throw new Error("Not authorized.");

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("students")
    .select("coach_id")
    .eq("id", studentId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.coach_id !== coachId) throw new Error("Student not found.");
  return coachId;
}

export async function assertCoachOwnsSession(sessionId: string): Promise<string> {
  const coachId = await getAuthenticatedCoachIdAction();
  if (!coachId) throw new Error("Not authorized.");

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("coach_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.coach_id !== coachId) throw new Error("Session not found.");
  return coachId;
}

export async function assertCoachOwnsProgram(programId: string): Promise<string> {
  const coachId = await getAuthenticatedCoachIdAction();
  if (!coachId) throw new Error("Not authorized.");

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("programs")
    .select("coach_id")
    .eq("id", programId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.coach_id !== coachId) throw new Error("Program not found.");
  return coachId;
}
