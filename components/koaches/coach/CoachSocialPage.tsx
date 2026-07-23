"use client";

import { usePortalCoachId } from "@/components/koaches/coach/CoachAuthProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, isToday, parse, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { useCoachSessions } from "@/hooks/useCoachSessions";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { socialStoryCoachName } from "@/lib/koaches/person-name";
import { SITE_URL } from "@/lib/koaches/site-metadata";
import { useCoachAvailability } from "@/hooks/useCoachAvailability";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { CoachDatePicker } from "@/components/koaches/coach/CoachDatePicker";
import {
  getCalendarStoryWeek,
  getDailyStoryDay,
  type SocialStoryTemplate,
} from "@/lib/koaches/social-stories";
import { exportStoryAsPng, storyPngBlob } from "@/lib/koaches/social-story-export";
import {
  SocialStoryCalendarCard,
  SocialStoryDailyCard,
} from "@/components/koaches/coach/social/SocialStoryCards";
import { SocialStoryStepper } from "@/components/koaches/coach/social/SocialStoryStepper";
import { SocialTemplatePicker } from "@/components/koaches/coach/social/SocialTemplatePicker";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { CoachPageHeader, CoachPageShell } from "@/components/koaches/coach/CoachPageLayout";
import { CoachSocialSkeleton } from "@/components/koaches/coach/CoachSkeletons";

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
  const [step, setStep] = useState<1 | 2>(1);
  const [template, setTemplate] = useState<SocialStoryTemplate | null>(null);
  const [date, setDate] = useState(todayKey);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const profileUrl = coach
    ? `${origin || SITE_URL}${buildPublicCoachPath(coach.slug)}`
    : SITE_URL;

  const dailyDay = useMemo(
    () => getDailyStoryDay(sessions, date, workingHours, blockedSlots),
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
    if (!node || saving || !template) return;
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
    if (!coach || !template) return;
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
          title: `${socialStoryCoachName(coach)} · PickleKoach story`,
        });
        return;
      }
      await exportStoryAsPng(node, `koaches-${template}-${date}.png`);
      showToast("Image saved. Upload to your story.");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      showToast("Share not available. Try Save image.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!coachId) {
    return <CoachSocialSkeleton />;
  }

  if (loading || !coach) {
    return (
      <CoachPageShell>
        <CoachPageHeader title="Social" subtitle="Post open court time to your stories" />
        <div className="mt-6 animate-pulse space-y-4" aria-busy aria-label="Loading social tools">
          <div className="h-24 rounded-xl bg-[#E5E7EB]" />
          <div className="h-10 rounded-xl bg-[#E5E7EB]" />
          <div className="h-80 rounded-2xl bg-[#E5E7EB]/80" />
        </div>
      </CoachPageShell>
    );
  }

  const isWeekTemplate = template === "week-calendar";
  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  return (
    <CoachPageShell>
      <CoachPageHeader title="Social" subtitle="Post open court time to your stories" />

      <p className="mt-2 text-sm text-[#6B7280]">
        Create an IG or FB story from your schedule.
      </p>

      <div className="mt-4">
        <SocialStoryStepper
          step={step}
          onStep={setStep}
          canAccessStep2={template !== null}
        />
      </div>

      {step === 1 ? (
        <div className="mt-4">
          <p className="font-heading text-sm font-semibold text-[#14532D]">Choose a template</p>
          <p className="mt-0.5 text-xs text-[#6B7280]">What kind of story do you want to post?</p>
          <div className="mt-3">
            <SocialTemplatePicker value={template} onChange={setTemplate} />
          </div>
          <CoachButton
            type="button"
            className="mt-4 w-full"
            disabled={!template}
            onClick={() => setStep(2)}
          >
            Next: choose date
          </CoachButton>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-heading text-sm font-semibold text-[#14532D]">Choose a date</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {isWeekTemplate ? "Pick any day in the week to show" : "Which day should this story show?"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="shrink-0 text-xs font-semibold text-[#4F8FF7]"
              >
                Change template
              </button>
            </div>

            <div className="coach-card mt-3 p-3">
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
          </div>

          <div>
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Preview
            </p>
            <div className="mt-3">
              {template === "daily-slots" ? (
                <SocialStoryDailyCard
                  coach={coach}
                  date={date}
                  day={dailyDay}
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
          </div>

          <div className="space-y-2 pb-2">
            <CoachButton
              type="button"
              className="w-full py-3.5 text-sm"
              loading={saving}
              loadingLabel="Saving…"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Save image
            </CoachButton>
            <CoachButton
              type="button"
              variant="outline"
              className="w-full text-sm"
              disabled={saving}
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </CoachButton>
          </div>
        </div>
      )}
    </CoachPageShell>
  );
}
