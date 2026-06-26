"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useMemo, useRef, useState } from "react";
import { addDays, format, isToday, parse, startOfWeek } from "date-fns";
import {
  CalendarDays,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Layers,
  Share2,
  Sparkles,
} from "lucide-react";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachPrograms } from "@/hooks/useCoachPrograms";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { buildIntakeUrl } from "@/lib/koaches/intake";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import {
  buildStoryCaption,
  getDailyStorySlots,
  getProgramStoryItems,
  getWeeklyStoryDays,
  SOCIAL_STORY_TEMPLATES,
  type SocialStoryTemplate,
} from "@/lib/koaches/social-stories";
import { exportStoryAsPng, storyPngBlob } from "@/lib/koaches/social-story-export";
import {
  SocialStoryDailyCard,
  SocialStoryProgramsCard,
  SocialStoryWeeklyCard,
} from "@/components/koaches/coach/social/SocialStoryCards";
import { cn } from "@/lib/utils";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachSocialSkeleton } from "@/components/koaches/coach/CoachSkeletons";

const TEMPLATE_ICONS = {
  "daily-slots": CalendarDays,
  "weekly-slots": CalendarRange,
  programs: Layers,
} as const;

export function CoachSocialPage() {
  const coachId = usePortalCoachId();
  const { coach, loading } = useCoachProfile(coachId);
  const { sessions } = useCoachSessions(coachId);
  const { programs } = useCoachPrograms(coachId);
  const { workingHours, blockedSlots } = useCoachAvailability(coachId);
  const { showToast } = useCoachToast();
  const exportRef = useRef<HTMLDivElement>(null);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const [template, setTemplate] = useState<SocialStoryTemplate>("daily-slots");
  const [date, setDate] = useState(todayKey);

  const bookUrl =
    typeof window !== "undefined" && coach
      ? buildIntakeUrl(coach.slug, window.location.origin)
      : coach
        ? `https://koaches.ph/join/${coach.slug}`
        : "https://koaches.ph";

  const dailySlots = useMemo(
    () => getDailyStorySlots(sessions, date, workingHours, blockedSlots),
    [sessions, date, workingHours, blockedSlots]
  );

  const weeklyDays = useMemo(
    () => getWeeklyStoryDays(sessions, date, workingHours, blockedSlots),
    [sessions, date, workingHours, blockedSlots]
  );

  const programItems = useMemo(() => getProgramStoryItems(programs), [programs]);

  const caption = useMemo(
    () =>
      coach
        ? buildStoryCaption(template, coach, {
            date,
            dailySlots,
            weeklyDays,
            programs: programItems,
            bookUrl,
          })
        : "",
    [template, coach, date, dailySlots, weeklyDays, programItems, bookUrl]
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

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCaptionCopied(true);
      showToast("Caption copied — paste on Instagram or Facebook");
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch {
      showToast("Could not copy caption", "error");
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
          title: coach.name,
          text: caption,
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

  if (loading || !coach) {
    return <CoachSocialSkeleton />;
  }

  return (
    <CoachPageShell>
      <CoachPageHeader
        title="Social"
        subtitle="Story-ready graphics for Instagram, Facebook, and group chats"
      />

      <div className="coach-card mt-5 overflow-hidden border-[#E5EFE8] bg-gradient-to-br from-[#F4FAF6] to-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E07A5F]/15">
            <Sparkles className="h-5 w-5 text-[#E07A5F]" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-[#111827]">Pick a template, save, post</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
              Your availability and programs auto-fill the design. Save the image, then paste the caption.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Template</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SOCIAL_STORY_TEMPLATES.map((item) => {
          const Icon = TEMPLATE_ICONS[item.id];
          const selected = template === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTemplate(item.id)}
              className={cn(
                "coach-card relative flex min-h-[88px] flex-col items-start p-4 text-left transition-all",
                selected
                  ? "border-[#E07A5F] bg-[#FDEEE9] ring-2 ring-[#E07A5F]/20"
                  : "hover:border-[#D1D5DB]"
              )}
            >
              {selected ? (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#E07A5F]">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              ) : null}
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  selected ? "bg-[#E07A5F] text-white" : "bg-[#E5EFE8] text-[#3D5C47]"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-heading mt-3 text-sm font-semibold text-[#111827]">{item.label}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280]">{item.description}</p>
            </button>
          );
        })}
      </div>

      {template !== "programs" && (
        <div className="coach-card mt-4 p-3">
          {template === "daily-slots" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shiftDay(-1)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white transition-colors hover:bg-[#F9FAFB]"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-5 w-5 text-[#1E3A5F]" />
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
                <ChevronRight className="h-5 w-5 text-[#1E3A5F]" />
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
                <ChevronLeft className="h-5 w-5 text-[#1E3A5F]" />
              </button>
              <div className="min-w-0 flex-1 text-center">
                <p className="font-heading text-sm font-semibold text-[#1E3A5F]">{weekLabel}</p>
                <p className="text-[11px] text-[#6B7280]">Monday – Sunday</p>
              </div>
              <button
                type="button"
                onClick={() => shiftDay(7)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white"
                aria-label="Next week"
              >
                <ChevronRight className="h-5 w-5 text-[#1E3A5F]" />
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
          ) : null}
        </div>
      )}

      <p className="mt-6 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Preview
      </p>
      <div className="mt-3">
        {template === "daily-slots" && (
          <SocialStoryDailyCard
            coach={coach}
            date={date}
            slots={dailySlots}
            bookUrl={bookUrl}
            exportRef={exportRef}
          />
        )}
        {template === "weekly-slots" && (
          <SocialStoryWeeklyCard
            coach={coach}
            days={weeklyDays}
            bookUrl={bookUrl}
            exportRef={exportRef}
          />
        )}
        {template === "programs" && (
          <SocialStoryProgramsCard
            coach={coach}
            programs={programItems}
            bookUrl={bookUrl}
            exportRef={exportRef}
          />
        )}
      </div>

      <div className="mt-6 space-y-2">
        <button
          type="button"
          className="coach-btn-primary w-full gap-2 py-3.5 text-sm"
          onClick={handleDownload}
          disabled={saving}
        >
          <Download className="h-4 w-4" />
          {saving ? "Saving…" : "Save image"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="coach-btn-outline gap-2 text-sm"
            onClick={handleShare}
            disabled={saving}
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            className="coach-btn-outline gap-2 text-sm"
            onClick={handleCopyCaption}
          >
            {captionCopied ? <Check className="h-4 w-4 text-[#3D5C47]" /> : <Copy className="h-4 w-4" />}
            {captionCopied ? "Copied" : "Copy caption"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopyCaption}
        className="coach-card mt-4 w-full p-4 text-left transition-colors hover:border-[#E07A5F]/30 hover:bg-[#FFFBFA]"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Caption</p>
          <span className="text-[10px] font-semibold text-[#E07A5F]">Tap to copy</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[#374151]">{caption}</p>
      </button>
    </CoachPageShell>
  );
}
