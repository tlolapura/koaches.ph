"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import {
  BALL_PATH,
  FEED_HEIGHT,
  FEED_WIDTH,
  FeedPreview,
  MASCOT_PATH,
  exportFeedPng,
  useExportAsset,
  useScreenshotSrc,
} from "@/components/koaches/internal/instagram-posts-brand";
import {
  INSTAGRAM_POSTS,
  type IgShots,
  type InstagramPost,
} from "@/components/koaches/internal/instagram-posts-content";

const IG_BIOS = [
  {
    id: "a",
    label: "Recommended",
    text: `Tools for pickleball coaches in the PH
Roster · sessions · programs · progress
picklekoach.com`,
  },
  {
    id: "b",
    label: "Feature-led",
    text: `Pickleball coaching, organized
Program templates · progress cards · GCash billing
For coaches in the Philippines`,
  },
  {
    id: "c",
    label: "Short",
    text: `Built for pickleball coaches in the PH
Students, programs, progress cards
picklekoach.com`,
  },
] as const;

const SHOT_NAMES = [
  "dashboard",
  "students",
  "session",
  "programs",
  "progress-card",
  "join-qr",
  "billing",
  "profile",
  "schedule",
  "skill-rating",
  "clinic",
] as const;

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          className="coach-btn-outline inline-flex min-h-[36px] items-center gap-1.5 px-3 text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#111827]">{text}</pre>
    </div>
  );
}

function PostCard({
  post,
  mascotSrc,
  ballSrc,
  shots,
}: {
  post: InstagramPost;
  mascotSrc: string;
  ballSrc: string;
  shots: IgShots;
}) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!exportRef.current || saving) return;
    setSaving(true);
    try {
      await exportFeedPng(exportRef.current, post.filename);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(post.caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-[#111827]">{post.label}</h2>
        <p className="text-xs font-medium text-[#9CA3AF]">
          {FEED_WIDTH}×{FEED_HEIGHT} · 4:5 · {post.backdrop}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start">
        <FeedPreview
          exportRef={exportRef}
          backdrop={post.backdrop}
          ballSrc={ballSrc}
          previewWidth={260}
        >
          {post.render(mascotSrc, shots)}
        </FeedPreview>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Caption (copy for Instagram)
            </p>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm leading-relaxed text-[#374151]">
              {post.caption}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="coach-btn-primary inline-flex min-h-[44px] items-center gap-2 px-4 text-sm disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {saving ? "Saving…" : "Save PNG"}
            </button>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="coach-btn-outline inline-flex min-h-[44px] items-center gap-2 px-4 text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy caption"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function useAllShots(): IgShots {
  const dashboard = useScreenshotSrc("dashboard");
  const students = useScreenshotSrc("students");
  const session = useScreenshotSrc("session");
  const programs = useScreenshotSrc("programs");
  const progressCard = useScreenshotSrc("progress-card");
  const joinQr = useScreenshotSrc("join-qr");
  const billing = useScreenshotSrc("billing");
  const profile = useScreenshotSrc("profile");
  const schedule = useScreenshotSrc("schedule");
  const skillRating = useScreenshotSrc("skill-rating");
  const clinic = useScreenshotSrc("clinic");

  return {
    dashboard,
    students,
    session,
    programs,
    "progress-card": progressCard,
    "join-qr": joinQr,
    billing,
    profile,
    schedule,
    "skill-rating": skillRating,
    clinic,
  };
}

export function InstagramPostsPage() {
  const mascotSrc = useExportAsset(MASCOT_PATH);
  const ballSrc = useExportAsset(BALL_PATH);
  const shots = useAllShots();

  return (
    <div className="coach-portal min-h-dvh bg-[#FAFAF8] text-[#111827]">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#16A34A]">
            Internal · noindex
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Instagram posts
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#6B7280]">
            {INSTAGRAM_POSTS.length} brand feed posts (4:5). Screenshot posters use files in{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-sm">
              public/marketing/ig-screenshots/
            </code>
            . Keep this URL private.
          </p>
        </header>

        <section className="mt-8 rounded-3xl border border-[#E5E7EB] bg-[#F0FDF4]/50 p-5 sm:p-6">
          <h2 className="font-heading text-xl font-bold text-[#111827]">IG bio options</h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Put <span className="font-semibold text-[#111827]">picklekoach.com</span> in the website
            field. Bio text below (English, PH coaches).
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {IG_BIOS.map((bio) => (
              <CopyBlock key={bio.id} label={bio.label} text={bio.text} />
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
          <h2 className="font-heading text-lg font-bold text-[#111827]">Screenshot drop folder</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
            Save mobile PNGs with these names (placeholders show until you add them):
          </p>
          <p className="mt-3 font-mono text-xs leading-relaxed text-[#374151]">
            {SHOT_NAMES.map((n) => `${n}.png`).join(" · ")}
          </p>
        </section>

        <div className="mt-8 space-y-6">
          {INSTAGRAM_POSTS.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              mascotSrc={mascotSrc}
              ballSrc={ballSrc}
              shots={shots}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
