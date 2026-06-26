import {
  ClipboardList,
  PenLine,
  Target,
  Trophy,
  Users,
  UtensilsCrossed,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PresetIconId } from "@/lib/koaches/types";

export { KoachesLogo, KoachesMark, KoachesWordmark } from "@/components/koaches/KoachesLogo";

const PRESET_ICON_MAP: Record<PresetIconId, LucideIcon> = {
  users: Users,
  target: Target,
  trophy: Trophy,
  kitchen: UtensilsCrossed,
  zap: Zap,
};

export function PresetIcon({
  icon,
  className,
  iconClassName,
}: {
  icon: PresetIconId;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = PRESET_ICON_MAP[icon];
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDF4]",
        className
      )}
    >
      <Icon className={cn("h-5 w-5 text-[#166534]", iconClassName)} strokeWidth={2} />
    </div>
  );
}

export function ProgramListIcon({
  presetIcon,
  isCustom,
}: {
  presetIcon?: PresetIconId;
  isCustom?: boolean;
}) {
  if (isCustom) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4F8FF7]">
        <PenLine className="h-5 w-5 text-white" />
      </div>
    );
  }
  if (presetIcon) {
    return <PresetIcon icon={presetIcon} />;
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6]">
      <ClipboardList className="h-5 w-5 text-[#6B7280]" />
    </div>
  );
}
