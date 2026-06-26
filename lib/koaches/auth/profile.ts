export type AppRole = "coach" | "admin" | "super_admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  coach_id: string | null;
};

export function isAdminRole(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isCoachRole(role: AppRole | null | undefined): boolean {
  return role === "coach";
}
