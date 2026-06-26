import { cn } from "@/lib/utils";

type NavCountBadgeProps = {
  count: number;
  className?: string;
  /** Pin on icon corner (compact nav / bell). */
  pinned?: boolean;
};

export function NavCountBadge({ count, className, pinned }: NavCountBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[#FACC15] font-bold text-[#14532D]",
        pinned
          ? "absolute -top-1 -right-1 min-h-4 min-w-4 px-1 text-[9px] leading-none ring-2 ring-white"
          : "ml-auto min-h-[18px] min-w-[18px] px-1.5 text-[10px]",
        className
      )}
    >
      {label}
    </span>
  );
}
