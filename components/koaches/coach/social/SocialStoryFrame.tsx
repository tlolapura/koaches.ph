"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const STORY_WIDTH = 360;
export const STORY_HEIGHT = 640;

type SocialStoryPreviewProps = {
  children: ReactNode;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  previewWidth?: number;
};

export function SocialStoryPreview({
  children,
  exportRef,
  previewWidth = 300,
}: SocialStoryPreviewProps) {
  const width = previewWidth;
  const scale = width / STORY_WIDTH;
  const previewHeight = STORY_HEIGHT * scale;

  return (
    <div className="flex justify-center">
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-4 rounded-[2.75rem] bg-gradient-to-br from-[#E5EFE8]/80 via-[#F0FDF4]/60 to-[#16A34A]/10"
          aria-hidden
        />
        <div className="relative rounded-[2.25rem] border-[5px] border-[#14532D] bg-[#14532D] p-1.5 shadow-[0_20px_50px_rgba(79,143,247,0.25)]">
          <div
            className="overflow-hidden rounded-[1.65rem] bg-[#14532D]"
            style={{ width, height: previewHeight }}
          >
            <div
              style={{
                width: STORY_WIDTH,
                height: STORY_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <div
                ref={exportRef}
                className="relative flex h-full w-full flex-col overflow-hidden text-white"
                style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}
              >
                <StoryBackground />
                <div className="relative z-10 flex h-full flex-col">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-[#16A34A] via-[#1a8f48] to-[#4F8FF7]" />
      <div
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#16A34A]/15 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-[#FACC15]/10 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, #fff 39px, #fff 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #fff 39px, #fff 40px)",
        }}
        aria-hidden
      />
    </>
  );
}

export function SocialStoryHeader({
  coachName,
  eyebrow,
  photo,
  specialization,
}: {
  coachName: string;
  eyebrow: string;
  photo?: string | null;
  specialization?: string;
}) {
  const initials = coachName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-b border-white/10 px-6 pb-5 pt-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FACC15]">Koaches</p>
      <p className="mt-2 text-xs font-medium text-white/65">{eyebrow}</p>
      <div className="mt-4 flex items-center gap-3">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- story export
          <img
            src={photo}
            alt=""
            crossOrigin="anonymous"
            className="h-12 w-12 shrink-0 rounded-xl object-cover ring-2 ring-white/25"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#16A34A] font-heading text-sm font-bold ring-2 ring-white/25">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold leading-tight">{coachName}</h2>
          {specialization ? (
            <p className="mt-0.5 truncate text-[11px] font-medium text-[#FACC15]/90">{specialization}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SocialStoryFooter({ cta, url }: { cta: string; url: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "");

  return (
    <div className="mt-auto border-t border-white/10 bg-black/25 px-6 py-5 backdrop-blur-sm">
      <p className="font-heading text-sm font-bold text-[#FACC15]">{cta}</p>
      <p className="mt-1 truncate text-[10px] font-medium text-white/70">{displayUrl}</p>
    </div>
  );
}

export function SocialStorySlotPill({ label }: { label: string }) {
  return (
    <span className="inline-flex min-w-[4.5rem] items-center justify-center rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white shadow-sm backdrop-blur-sm">
      {label}
    </span>
  );
}

export function SocialStoryStatBadge({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm",
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">{label}</p>
      <p className="font-heading mt-0.5 text-lg font-bold text-[#FACC15]">{value}</p>
    </div>
  );
}
