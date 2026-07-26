"use client";

import { useEffect, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/utils";

/** Instagram feed — 4:5 at 1080×1350 */
export const FEED_WIDTH = 1080;
export const FEED_HEIGHT = 1350;

export const MASCOT_PATH = "/illustrations/mascot.png";
export const BALL_PATH = "/illustrations/ball.webp";

export type BackdropVariant =
  | "mint"
  | "stark"
  | "split"
  | "green"
  | "sky"
  | "cream"
  | "blueBand"
  | "mintBottom";

/** Load asset as data URL so html-to-image always captures a sharp logo/mascot. */
export function useExportAsset(path: string) {
  const [src, setSrc] = useState(path);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(path, { cache: "force-cache" });
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
        if (!cancelled) setSrc(dataUrl);
      } catch {
        if (!cancelled) setSrc(path);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return src;
}

export function BrandMark({
  mascotSrc,
  size = "md",
  light = false,
  stacked = false,
  wordmark = true,
  className,
}: {
  mascotSrc: string;
  size?: "sm" | "md" | "lg" | "xl";
  light?: boolean;
  stacked?: boolean;
  wordmark?: boolean;
  className?: string;
}) {
  const plate =
    size === "xl"
      ? "h-36 w-36 rounded-[36px]"
      : size === "lg"
        ? "h-28 w-28 rounded-[28px]"
        : size === "sm"
          ? "h-[72px] w-[72px] rounded-2xl"
          : "h-24 w-24 rounded-[22px]";
  const img =
    size === "xl"
      ? "h-[112px] w-[112px]"
      : size === "lg"
        ? "h-[88px] w-[88px]"
        : size === "sm"
          ? "h-14 w-14"
          : "h-[76px] w-[76px]";
  const text =
    size === "xl"
      ? "text-[80px]"
      : size === "lg"
        ? "text-[60px]"
        : size === "sm"
          ? "text-[34px]"
          : "text-[46px]";

  return (
    <div
      className={cn(
        "inline-flex items-center",
        stacked ? "flex-col gap-6" : "gap-5",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          plate,
          light
            ? "bg-white shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
            : "bg-white shadow-[0_6px_20px_rgba(22,163,74,0.12)] ring-1 ring-[#E5E7EB]"
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={mascotSrc}
          alt="PickleKoach"
          className={cn("object-contain", img)}
          draggable={false}
        />
      </div>
      {wordmark ? (
        <p
          className={cn(
            "font-heading font-bold leading-none tracking-tight",
            text,
            stacked && "text-center"
          )}
        >
          <span className={light ? "text-white" : "text-[#16A34A]"}>Pickle</span>
          <span className={light ? "text-white" : "text-[#4F8FF7]"}>Koach</span>
        </p>
      ) : null}
    </div>
  );
}

export function PostBackdrop({
  variant,
  ballSrc,
}: {
  variant: BackdropVariant;
  ballSrc: string;
}) {
  if (variant === "green") {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-[#16A34A] via-[#15803D] to-[#4F8FF7]" />
        <div
          className="pointer-events-none absolute rounded-full bg-white/10 blur-3xl"
          style={{ right: -80, top: 200, width: 480, height: 480 }}
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={ballSrc}
          alt=""
          className="pointer-events-none absolute opacity-[0.16] rotate-[14deg]"
          style={{ right: -60, bottom: -40, width: 440, height: 440 }}
          aria-hidden
        />
      </>
    );
  }

  if (variant === "stark") {
    return (
      <>
        <div className="absolute inset-0 bg-white" />
        <div className="absolute bottom-0 left-0 top-0 w-[18px] bg-[#16A34A]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={ballSrc}
          alt=""
          className="pointer-events-none absolute opacity-[0.07] -rotate-12"
          style={{ right: -100, bottom: -80, width: 520, height: 520 }}
          aria-hidden
        />
      </>
    );
  }

  if (variant === "split") {
    return (
      <>
        <div className="absolute inset-0 bg-[#FAFAF8]" />
        <div className="absolute bottom-0 left-0 top-0 w-[42%] bg-gradient-to-b from-[#16A34A] to-[#14532D]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={ballSrc}
          alt=""
          className="pointer-events-none absolute opacity-[0.18] rotate-6"
          style={{ left: -40, bottom: -60, width: 360, height: 360 }}
          aria-hidden
        />
      </>
    );
  }

  if (variant === "sky") {
    return (
      <>
        <div className="absolute inset-0 bg-gradient-to-b from-[#EFF6FF] via-white to-[#ECFDF5]" />
        <div
          className="pointer-events-none absolute rounded-full bg-[#4F8FF7]/18 blur-3xl"
          style={{ left: "50%", top: -100, width: 700, height: 700, marginLeft: -350 }}
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={ballSrc}
          alt=""
          className="pointer-events-none absolute opacity-[0.14] -rotate-[8deg]"
          style={{ left: -60, top: 80, width: 280, height: 280 }}
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={ballSrc}
          alt=""
          className="pointer-events-none absolute opacity-[0.12] rotate-[20deg]"
          style={{ right: -40, bottom: 120, width: 300, height: 300 }}
          aria-hidden
        />
      </>
    );
  }

  if (variant === "cream") {
    return (
      <>
        <div className="absolute inset-0 bg-[#FAFAF8]" />
        <div className="absolute inset-x-0 top-0 h-4 bg-[#16A34A]" />
        <div className="absolute inset-x-[14%] top-4 h-[6px] bg-[#FACC15]" />
      </>
    );
  }

  if (variant === "blueBand") {
    return (
      <>
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-r from-[#4F8FF7] to-[#16A34A]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
        <img
          src={ballSrc}
          alt=""
          className="pointer-events-none absolute opacity-[0.1] rotate-12"
          style={{ right: -50, top: 40, width: 340, height: 340 }}
          aria-hidden
        />
      </>
    );
  }

  if (variant === "mintBottom") {
    return (
      <>
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#ECFDF5]" />
        <div
          className="pointer-events-none absolute rounded-full bg-[#16A34A]/10 blur-3xl"
          style={{ left: -80, bottom: -40, width: 420, height: 420 }}
          aria-hidden
        />
      </>
    );
  }

  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#ECFDF5] via-white to-[#EFF6FF]" />
      <div
        className="pointer-events-none absolute rounded-full bg-[#4F8FF7]/15 blur-3xl"
        style={{ right: -120, top: -80, width: 520, height: 520 }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute rounded-full bg-[#16A34A]/14 blur-3xl"
        style={{ left: -140, bottom: -60, width: 480, height: 480 }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
      <img
        src={ballSrc}
        alt=""
        className="pointer-events-none absolute opacity-[0.12] rotate-12"
        style={{ right: -40, top: -20, width: 360, height: 360 }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
      <img
        src={ballSrc}
        alt=""
        className="pointer-events-none absolute opacity-[0.1] -rotate-[18deg]"
        style={{ bottom: -100, left: -80, width: 420, height: 420 }}
        aria-hidden
      />
    </>
  );
}

export function FeedPreview({
  children,
  exportRef,
  backdrop,
  ballSrc,
  previewWidth = 280,
}: {
  children: ReactNode;
  exportRef?: RefObject<HTMLDivElement | null>;
  backdrop: BackdropVariant;
  ballSrc: string;
  previewWidth?: number;
}) {
  const scale = previewWidth / FEED_WIDTH;
  const previewHeight = FEED_HEIGHT * scale;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_12px_40px_rgba(22,163,74,0.10)]"
      style={{ width: previewWidth, height: previewHeight }}
    >
      <div
        style={{
          width: FEED_WIDTH,
          height: FEED_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          ref={exportRef}
          className="coach-portal relative flex h-full w-full flex-col overflow-hidden text-[#111827]"
          style={{ width: FEED_WIDTH, height: FEED_HEIGHT }}
        >
          <PostBackdrop variant={backdrop} ballSrc={ballSrc} />
          <div className="relative z-10 flex h-full flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}

export async function exportFeedPng(element: HTMLElement, filename: string) {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    width: element.offsetWidth,
    height: element.offsetHeight,
  });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

const IG_SHOT_DIR = "/marketing/ig-screenshots";

/** Prefer PNG drop-in; fall back to SVG placeholder for export-safe data URL. */
export function useScreenshotSrc(name: string) {
  const [src, setSrc] = useState(`${IG_SHOT_DIR}/${name}.svg`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const path of [`${IG_SHOT_DIR}/${name}.png`, `${IG_SHOT_DIR}/${name}.svg`]) {
        try {
          const res = await fetch(path, { cache: "no-store" });
          if (!res.ok) continue;
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
          });
          if (!cancelled) {
            setSrc(dataUrl);
            return;
          }
        } catch {
          // try next
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name]);

  return src;
}

/** Mobile phone bezel for app screenshots (drop PNGs in public/marketing/ig-screenshots/). */
export function PhoneMock({
  src,
  label,
  size = "lg",
  className,
  style,
}: {
  src: string;
  label?: string;
  size?: "md" | "lg" | "xl" | "hero";
  className?: string;
  style?: CSSProperties;
}) {
  const width = size === "hero" ? 620 : size === "xl" ? 560 : size === "lg" ? 520 : 440;
  const height = size === "hero" ? 1120 : size === "xl" ? 1020 : size === "lg" ? 940 : 800;
  const radius = size === "hero" ? 64 : size === "xl" ? 58 : size === "lg" ? 54 : 48;
  const border = size === "hero" ? 14 : size === "xl" ? 12 : 11;
  const innerRadius = radius - 12;

  return (
    <div className={cn("mx-auto shrink-0", className)} style={{ width, ...style }}>
      <div
        className="bg-[#111827] shadow-[0_32px_70px_rgba(17,24,39,0.32)]"
        style={{
          borderRadius: radius,
          borderWidth: border,
          borderStyle: "solid",
          borderColor: "#111827",
          padding: 7,
        }}
      >
        <div
          className="overflow-hidden bg-[#F3F4F6]"
          style={{ height, borderRadius: innerRadius }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
          <img
            src={src}
            alt={label ?? "App screenshot"}
            className="h-full w-full object-cover object-top"
            draggable={false}
          />
        </div>
      </div>
      {label ? (
        <p className="mt-5 text-center text-[24px] font-semibold text-[#6B7280]">{label}</p>
      ) : null}
    </div>
  );
}

/** Cropped / cut UI panel (no full phone). Great for IG variety. */
export function ShotCrop({
  src,
  width = 920,
  height = 720,
  radius = 40,
  objectPosition = "top",
  className,
  style,
}: {
  src: string;
  width?: number;
  height?: number;
  radius?: number;
  objectPosition?: "top" | "center" | "bottom";
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden bg-white shadow-[0_28px_64px_rgba(17,24,39,0.18)] ring-1 ring-black/5",
        className
      )}
      style={{ width, height, borderRadius: radius, ...style }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- PNG export */}
      <img
        src={src}
        alt=""
        className={cn(
          "h-full w-full object-cover",
          objectPosition === "top" && "object-top",
          objectPosition === "center" && "object-center",
          objectPosition === "bottom" && "object-bottom"
        )}
        draggable={false}
      />
    </div>
  );
}

