"use client";

import { CalendarDays, Check, LayoutGrid } from "lucide-react";
import {
  SOCIAL_STORY_TEMPLATES,
  type SocialStoryTemplate,
} from "@/lib/koaches/social-stories";
import { cn } from "@/lib/utils";

const TEMPLATE_ICONS = {
  "daily-slots": CalendarDays,
  "week-calendar": LayoutGrid,
} as const;

type SocialTemplatePickerProps = {
  value: SocialStoryTemplate | null;
  onChange: (template: SocialStoryTemplate) => void;
};

export function SocialTemplatePicker({ value, onChange }: SocialTemplatePickerProps) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Story templates">
      {SOCIAL_STORY_TEMPLATES.map((item) => {
        const Icon = TEMPLATE_ICONS[item.id];
        const selected = value === item.id;

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
              selected
                ? "border-[#16A34A] bg-[#F0FDF4] shadow-sm"
                : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                selected ? "bg-[#16A34A] text-white" : "bg-[#E5EFE8] text-[#166534]"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-sm font-semibold text-[#14532D]">{item.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-[#6B7280]">{item.description}</p>
            </div>
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-[#16A34A] bg-[#16A34A] text-white" : "border-[#D1D5DB] bg-white"
              )}
            >
              {selected ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
