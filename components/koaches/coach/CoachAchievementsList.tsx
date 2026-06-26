"use client";

import { Award } from "lucide-react";
import { formatAchievementSubtitle } from "@/lib/koaches/coach-achievements";
import type { CoachAchievement } from "@/lib/koaches/types";
import { CoachAchievementKindBadge } from "@/components/koaches/coach/CoachAchievementKindBadge";

type CoachAchievementsListProps = {
  achievements: CoachAchievement[];
  compact?: boolean;
};

export function CoachAchievementsList({ achievements, compact }: CoachAchievementsListProps) {
  if (achievements.length === 0) return null;

  return (
    <ul className={compact ? "space-y-2" : "mt-4 space-y-2"}>
      {achievements.map((achievement) => (
        <li
          key={achievement.id}
          className="flex items-start gap-3 rounded-xl bg-[#F9FAFB] px-3 py-3"
        >
          <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#4F8FF7]" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-sm font-semibold text-[#111827]">{achievement.title}</p>
              <CoachAchievementKindBadge kind={achievement.kind} />
            </div>
            {formatAchievementSubtitle(achievement) && (
              <p className="mt-0.5 text-xs text-[#6B7280]">{formatAchievementSubtitle(achievement)}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
