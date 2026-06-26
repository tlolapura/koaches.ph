import type { CoachAchievementKind } from "@/lib/koaches/types";
import { ACHIEVEMENT_KIND_LABELS } from "@/lib/koaches/coach-achievements";
import { cn } from "@/lib/utils";

const kindStyles: Record<CoachAchievementKind, string> = {
  certification: "bg-[#E5EFE8] text-[#3D5C47]",
  education: "bg-[#EDE9FE] text-[#5B21B6]",
  tournament: "bg-[#F0FDF4] text-[#166534]",
  competition: "bg-[#FEF3C7] text-[#92400E]",
  league: "bg-[#EFF6FF] text-[#14532D]",
};

export function CoachAchievementKindBadge({
  kind,
  className,
}: {
  kind: CoachAchievementKind;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-heading shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        kindStyles[kind],
        className
      )}
    >
      {ACHIEVEMENT_KIND_LABELS[kind]}
    </span>
  );
}
