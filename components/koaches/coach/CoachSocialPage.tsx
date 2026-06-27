"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, isToday, parse, startOfWeek } from "date-fns";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  Share2,
} from "lucide-react";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import {
  getCalendarStoryWeek,
  getDailyStorySlots,
  SOCIAL_STORY_TEMPLATES,
  type SocialStoryTemplate,
} from "@/lib/koaches/social-stories";
import { exportStoryAsPng, storyPngBlob } from "@/lib/koaches/social-story-export";
import {
  SocialStoryCalendarCard,
  SocialStoryDailyCard,
} from "@/components/koaches/coach/social/SocialStoryCards";
import { STORY_EXPORT_LABEL } from "@/components/koaches/coach/social/SocialStoryFrame";
import { cn } from "@/lib/utils";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachSocialSkeleton } from "@/components/koaches/coach/CoachSkeletons";

const TEMPLATE_ICONS = {
  "daily-slots": CalendarDays,
  "week-calendar": LayoutGrid,
} as const;

function useStoryPreviewWidth() {
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      const max = Math.min(window.innerWidth - 32, 400);
      setWidth(Math.max(280, max));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return width;
}

export function CoachSocialPage() {
  const coachId = usePortalCoachId();
  const { coach, loading } = useCoachProfile(coachId);
  const { sessions } = useCoachSessions(coachId);
  const { workingHours, blockedSlots } = useCoachAvailability(coachId);
  const { showToast } = useCoachToast();
  const exportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const previewWidth = useStoryPreviewWidth();

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const [template, setTemplate] = useState<SocialStoryTemplate>("daily-slots");
  const [date, setDate] = useState(todayKey);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const profileUrl = coach
    ? `${origin || "https://koaches.ph"}${buildPublicCoachPath(coach.slug)}`
    : "https://koaches.ph";

  const dailySlots = useMemo(
    () => getDailyStorySlots(sessions, date, workingHours, blockedSlots),
    [sessions, date, workingHours, blockedSlots]
  );

  const calendarWeek = useMemo(
    () => getCalendarStoryWeek(sessions, date, workingHours, blockedSlots),
    [sessions, date, workingHours, blockedSlots]
  );

  const parsedDate = parse(date, "yyyy-MM-dd", new Date());
  const weekStart = startOfWeek(parsedDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`;

  const shiftDay = (delta: number) => {
    setDate(format(addDays(parsedDate, delta), "yyyy-MM-dd"));
  };

  const handleDownload = async () => {
    const node = exportRef.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      await exportStoryAsPng(node, `koaches-${template}-${date}.png`);
      showToast("Saved to your downloads");
    } catch {
      showToast("Could not save image", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!coach) return;
    const node = exportRef.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      const blob = await storyPngBlob(node);
      if (!blob) throw new Error("no blob");
      const file = new File([blob], `koaches-story.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${coach.name} — KoachesPH story`,
        });
        return;
      }
      await exportStoryAsPng(node, `koaches-${template}-${date}.png`);
      showToast("Image saved — upload to your story");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      showToast("Share not available — try Save image", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!coachId) {
    return <CoachSocialSkeleton />;
  }

  if (loading || !coach) {
    return (
      <CoachPageShell className="pb-40 md:pb-6">
        <CoachPageHeader title="Social" />
        <div className="mt-6 animate-pulse space-y-4" aria-busy aria-label="Loading social tools">
          <div className="h-10 rounded-xl bg-[#E5E7EB]" />
          <div className="h-80 rounded-2xl bg-[#E5E7EB]/80" />
        </div>
      </CoachPageShell>
    );
  }

  const isWeekTemplate = template === "week-calendar";
  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  return (
    <CoachPageShell className="pb-40 md:pb-6">
      <CoachPageHeader title="Social" />

      <div className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-heading text-base font-bold text-[#111827]">Choose a template</p>
            <p className="mt-0.5 hidden text-xs text-[#6B7280] md:block">
              Today&apos;s slots or your full week at a glance
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-semibold text-[#1D4ED8] sm:inline-block">
            {STORY_EXPORT_LABEL}
          </span>
        </div>

        <div
          className="mt-3 grid grid-cols-2 gap-3"
          role="tablist"
          aria-label="Story templates"
        >
          {SOCIAL_STORY_TEMPLATES.map((item) => {
            const Icon = TEMPLATE_ICONS[item.id];
            const selected = template === item.id;
            const isDaily = item.id === "daily-slots";

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTemplate(item.id)}
                className={cn(
                  "relative flex flex-col items-center rounded-2xl border-2 px-3 py-5 text-center transition-all duration-200",
                  selected
                    ? isDaily
                      ? "border-[#4F8FF7] bg-[#4F8FF7] text-white shadow-lg shadow-[#4F8FF7]/30"
                      : "border-[#16A34A] bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/30"
                    : isDaily
                      ? "border-[#4F8FF7]/30 bg-[#EFF6FF] text-[#1D4ED8] hover:border-[#4F8FF7]/60 hover:shadow-sm"
                      : "border-[#16A34A]/30 bg-[#F0FDF4] text-[#166534] hover:border-[#16A34A]/60 hover:shadow-sm"
                )}
              >
                {selected ? (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : null}
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    selected ? "bg-white/20" : "bg-white shadow-sm"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      selected ? "text-white" : isDaily ? "text-[#4F8FF7]" : "text-[#16A34A]"
                    )}
                    strokeWidth={2.25}
                  />
                </div>
                <p className="font-heading mt-3 text-sm font-bold leading-tight">{item.label}</p>
                <p
                  className={cn(
                    "mt-1.5 text-[11px] leading-snug",
                    selected ? "text-white/85" : "opacity-75"
                  )}
                >
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="coach-card mt-4 p-3">
        {template === "daily-slots" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftDay(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white transition-colors hover:bg-[#F9FAFB]"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5 text-[#14532D]" />
            </button>
            <div className="min-w-0 flex-1">
              <CoachDatePicker value={date} onChange={setDate} />
            </div>
            <button
              type="button"
              onClick={() => shiftDay(1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white transition-colors hover:bg-[#F9FAFB]"
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5 text-[#14532D]" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftDay(-7)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5 text-[#14532D]" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="font-heading text-sm font-semibold text-[#14532D]">{weekLabel}</p>
              <p className="text-[11px] text-[#6B7280]">Monday – Sunday</p>
            </div>
            <button
              type="button"
              onClick={() => shiftDay(7)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5 text-[#14532D]" />
            </button>
          </div>
        )}

        {template === "daily-slots" && !isToday(parsedDate) ? (
          <button
            type="button"
            onClick={() => setDate(todayKey)}
            className="mt-3 w-full rounded-full bg-[#E5EFE8] py-2 text-xs font-semibold text-[#3D5C47] transition-colors hover:bg-[#D5E5D8]"
          >
            Jump to today
          </button>
        ) : isWeekTemplate && format(weekStart, "yyyy-MM-dd") !== thisWeekStart ? (
          <button
            type="button"
            onClick={() => setDate(todayKey)}
            className="mt-3 w-full rounded-full bg-[#E5EFE8] py-2 text-xs font-semibold text-[#3D5C47] transition-colors hover:bg-[#D5E5D8]"
          >
            Jump to this week
          </button>
        ) : null}
      </div>

      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Preview
      </p>
      <div className="mt-3">
        {template === "daily-slots" ? (
          <SocialStoryDailyCard
            coach={coach}
            date={date}
            slots={dailySlots}
            profileUrl={profileUrl}
            exportRef={exportRef}
            previewWidth={previewWidth}
          />
        ) : (
          <SocialStoryCalendarCard
            coach={coach}
            week={calendarWeek}
            profileUrl={profileUrl}
            exportRef={exportRef}
            previewWidth={previewWidth}
          />
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-30 md:pointer-events-auto md:static md:inset-auto md:bottom-auto md:mt-6">
        <div className="pointer-events-auto space-y-2 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-md md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          <button
            type="button"
            className="coach-btn-primary w-full gap-2 py-3.5 text-sm"
            onClick={handleDownload}
            disabled={saving}
          >
            <Download className="h-4 w-4" />
            {saving ? "Saving…" : "Save image"}
          </button>
          <button
            type="button"
            className="coach-btn-outline w-full gap-2 text-sm"
            onClick={handleShare}
            disabled={saving}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </CoachPageShell>
  );
}
