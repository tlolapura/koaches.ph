import { cn } from "@/lib/utils";

/** Half green / half blue — pickleball court surface split */
export function CourtStripe({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-1 w-full shrink-0 bg-gradient-to-r from-[#16A34A] from-50% to-[#4F8FF7] to-50%", className)}
      aria-hidden
    />
  );
}
