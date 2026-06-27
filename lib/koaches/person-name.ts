/** Strip legacy "Coach " prefix from stored display names. */
export function stripCoachTitle(name: string): string {
  return name.replace(/^Coach\s+/i, "").trim();
}

export function splitPersonName(fullName: string): { firstName: string; lastName: string } {
  const cleaned = stripCoachTitle(fullName).replace(/\s+/g, " ").trim();
  if (!cleaned) return { firstName: "", lastName: "" };
  const parts = cleaned.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function joinPersonName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

export function personDisplayName(
  person: { firstName: string; lastName?: string; name?: string }
): string {
  const joined = joinPersonName(person.firstName, person.lastName ?? "");
  if (joined) return joined;
  return person.name?.trim() ?? "";
}

/** Dashboard hero: "Good afternoon, Coach Bianca" */
export function coachGreetingLabel(
  coach: { firstName: string; lastName?: string; name?: string }
): string {
  const first =
    coach.firstName?.trim() ||
    splitPersonName(coach.name ?? "").firstName ||
    "Coach";
  return `Coach ${first}`;
}

export function coachFirstName(
  coach: { firstName: string; lastName?: string; name?: string }
): string {
  return (
    coach.firstName?.trim() ||
    splitPersonName(coach.name ?? "").firstName ||
    "Coach"
  );
}
