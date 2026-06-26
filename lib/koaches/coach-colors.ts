/** Pickleball palette — court green + kitchen blue zones, ball yellow accent, forest depth */
export const COACH_COLORS = {
  green: "#16A34A",
  greenDark: "#15803D",
  greenLight: "#F0FDF4",
  greenText: "#166534",
  yellow: "#FACC15",
  yellowLight: "#FEFCE8",
  yellowText: "#854D0E",
  forest: "#14532D",
  forestDark: "#0F3D24",
  blue: "#4F8FF7",
  blueDark: "#3B82F6",
  blueLight: "#EFF6FF",
  blueText: "#1D4ED8",
  sage: "#6B9E78",
  sageLight: "#E5EFE8",
  sageText: "#3D5C47",
  surface: "#FAFAF8",
  /** @deprecated use `green` — kept for gradual migration */
  coral: "#16A34A",
  coralDark: "#15803D",
  coralLight: "#F0FDF4",
  coralText: "#166534",
  /** @deprecated use `forest` */
  navy: "#14532D",
} as const;

export function navActiveClass(pathname: string, href: string, exact?: boolean) {
  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
  if (!active) return "text-[#6B7280] hover:bg-[#EFF6FF]";
  return "bg-[#4F8FF7] text-white";
}

export function bottomNavActiveClass(_pathname: string, _href: string, isActive: boolean) {
  if (!isActive) return "text-[#6B7280]";
  return "text-[#4F8FF7]";
}
