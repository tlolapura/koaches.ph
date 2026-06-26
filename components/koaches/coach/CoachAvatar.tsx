"use client";

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
} as const;

function coachInitial(name: string) {
  return name.replace(/^Coach\s+/i, "").charAt(0).toUpperCase() || "?";
}

type CoachAvatarProps = {
  name: string;
  photo?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
};

/** Small circular avatar — photo or initials fallback */
export function CoachAvatar({ name, photo, size = "sm", className }: CoachAvatarProps) {
  const dim = sizeClasses[size];

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URLs / stored coach photos
      <img
        src={photo}
        alt={name}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white", dim, className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "font-heading flex shrink-0 items-center justify-center rounded-full bg-[#4F8FF7] font-semibold text-white",
        dim,
        className
      )}
      aria-hidden
    >
      {coachInitial(name)}
    </span>
  );
}
