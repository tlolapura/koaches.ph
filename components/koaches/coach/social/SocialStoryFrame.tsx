"use client";

import type { ReactNode } from "react";
import { stripCoachTitle } from "@/lib/koaches/person-name";
import { cn } from "@/lib/utils";

/** Instagram & Facebook Story — 9:16 at 1080×1920 px */
export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

/** Meta safe zones (px at export size) — keep key content inside */
export const STORY_SAFE_TOP = 270;
export const STORY_SAFE_BOTTOM = 380;
export const STORY_SAFE_SIDES = 65;

type SocialStoryPreviewProps = {
  children: ReactNode;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  previewWidth?: number;
};

export function SocialStoryPreview({
  children,
  exportRef,
  previewWidth,
}: SocialStoryPreviewProps) {
  const width = previewWidth ?? 320;
  const scale = width / STORY_WIDTH;
  const previewHeight = STORY_HEIGHT * scale;

  return (
    <div className="w-full">
      <div
        className="mx-auto overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_12px_40px_rgba(22,163,74,0.12)] sm:rounded-3xl"
        style={{ width, maxWidth: "100%", height: previewHeight }}
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
            className="relative flex h-full w-full flex-col overflow-hidden text-[#111827]"
            style={{ width: STORY_WIDTH, height: STORY_HEIGHT }}
          >
            <StoryBackground />
            <div className="relative z-10 flex h-full flex-col">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[#FAFAF8]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Plain img for story PNG export (same ball art as login) */}
        {/* eslint-disable-next-line @next/next/no-img-element -- story export */}
        <img
          src="/illustrations/ball.png"
          alt=""
          crossOrigin="anonymous"
          className="absolute opacity-[0.16] rotate-12"
          style={{ right: -32, top: -16, width: 440, height: 440 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- story export */}
        <img
          src="/illustrations/ball.png"
          alt=""
          crossOrigin="anonymous"
          className="absolute opacity-[0.16] -rotate-[18deg]"
          style={{ bottom: -120, left: -100, width: 560, height: 560 }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- story export */}
        <img
          src="/illustrations/ball.png"
          alt=""
          crossOrigin="anonymous"
          className="absolute opacity-[0.14] rotate-[8deg]"
          style={{ top: "36%", right: "6%", width: 320, height: 320 }}
        />
      </div>
    </>
  );
}

export function SocialStoryBrandBar() {
  return (
    <div className="flex items-center gap-4 px-10 pt-12">
      {/* eslint-disable-next-line @next/next/no-img-element -- story export */}
      <img
        src="/illustrations/mascot.png"
        alt=""
        crossOrigin="anonymous"
        className="h-20 w-20 shrink-0 object-contain"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="font-heading text-[42px] font-bold leading-none tracking-tight">
          <span className="text-[#16A34A]">Pickle</span>
          <span className="text-[#4F8FF7]">Koach</span>
        </p>
        <p className="mt-2 text-[22px] font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
          Pickleball coaching
        </p>
      </div>
    </div>
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
  const initials = stripCoachTitle(coachName)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-10 mt-6 border-b-2 border-dashed border-[#E5EFE8] pb-8">
      <p className="text-[24px] font-bold uppercase tracking-[0.18em] text-[#4F8FF7]">{eyebrow}</p>
      <div className="mt-5 flex items-center gap-5">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- story export
          <img
            src={photo}
            alt=""
            crossOrigin="anonymous"
            className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-[#16A34A]/20"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#16A34A] font-heading text-3xl font-bold text-white ring-4 ring-[#16A34A]/20">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-heading text-[52px] font-bold leading-tight text-[#14532D]">{coachName}</h2>
          {specialization ? (
            <p className="mt-1 truncate text-[26px] font-semibold text-[#16A34A]">{specialization}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SocialStoryFooter({ url }: { url: string }) {
  const displayUrl = url.replace(/^https?:\/\//, "");

  return (
    <div
      className="mt-auto px-10 pb-12 pt-6 text-center"
      style={{ paddingBottom: Math.max(STORY_SAFE_BOTTOM - 260, 48) }}
    >
      <p className="truncate text-[32px] font-semibold text-[#4F8FF7]">{displayUrl}</p>
    </div>
  );
}

export function storySlotCellClass(status?: "open" | "booked" | "blocked") {
  if (status === "open") return "bg-[#F0FDF4] ring-2 ring-[#16A34A]";
  if (status === "booked") return "bg-[#EDF2F7] ring-1 ring-[#D1D5DB]";
  if (status === "blocked") return "bg-[#E5E7EB] ring-1 ring-[#9CA3AF]";
  return "bg-transparent";
}

export function storySlotLabel(status: "open" | "booked" | "blocked"): string | null {
  if (status === "open") return "Open";
  if (status === "booked") return "Booked";
  return null;
}

export function SocialStorySlotPill({
  label,
  variant = "open",
}: {
  label: string;
  variant?: "open" | "booked";
}) {
  if (variant === "booked") {
    return (
      <span className="inline-flex min-w-[7rem] flex-col items-center justify-center rounded-2xl border-2 border-[#D1D5DB] bg-[#EDF2F7] px-5 py-3 text-center shadow-sm">
        <span className="text-[28px] font-bold text-[#374151]">{label}</span>
        <span className="mt-0.5 text-[18px] font-bold uppercase tracking-wide text-[#6B7280]">
          Booked
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-[7rem] items-center justify-center rounded-2xl border-2 border-[#16A34A] bg-[#F0FDF4] px-5 py-4 text-[28px] font-bold text-[#166534] shadow-sm">
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
        "rounded-3xl border-2 border-[#E5EFE8] bg-white px-6 py-5 shadow-sm",
        className
      )}
    >
      <p className="text-[22px] font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="font-heading mt-1 text-[44px] font-bold text-[#16A34A]">{value}</p>
    </div>
  );
}

export function SocialStoryLegend() {
  const items = [
    { color: "#F0FDF4", border: "#16A34A", label: "Open" },
    { color: "#EDF2F7", border: "#D1D5DB", label: "Booked" },
    { color: "#E5E7EB", border: "#9CA3AF", label: "Blocked" },
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-6 text-[22px] font-semibold uppercase tracking-wide text-[#6B7280]">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span
            className="h-5 w-10 rounded-full border-2"
            style={{ backgroundColor: item.color, borderColor: item.border }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
