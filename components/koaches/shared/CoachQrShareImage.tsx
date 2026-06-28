"use client";

import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { CoachProfile } from "@/lib/koaches/types";
import { formatPricingSummary } from "@/lib/koaches/pricing";

export const QR_SHARE_WIDTH = 400;
export const QR_SHARE_HEIGHT = 560;

export type QrShareVariant = "intake" | "profile";

const VARIANT_COPY: Record<
  QrShareVariant,
  { eyebrow: string; headline: string; subline: string }
> = {
  intake: {
    eyebrow: "Student sign-up",
    headline: "Scan to join my roster",
    subline: "Sign up & complete the waiver",
  },
  profile: {
    eyebrow: "Coach profile",
    headline: "Scan to view my page",
    subline: "Rates, programs & booking",
  },
};

type CoachQrShareImageProps = {
  coach: CoachProfile;
  url: string;
  variant: QrShareVariant;
};

export const CoachQrShareImage = forwardRef<HTMLDivElement, CoachQrShareImageProps>(
  function CoachQrShareImage({ coach, url, variant }, ref) {
    const copy = VARIANT_COPY[variant];
    const pricingLabel = formatPricingSummary(coach.sessionPricing);
    const initials = coach.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const displayUrl = url.replace(/^https?:\/\//, "");

    return (
      <div
        ref={ref}
        className="flex flex-col overflow-hidden bg-gradient-to-b from-[#16A34A] via-[#1a8f48] to-[#4F8FF7] text-white"
        style={{ width: QR_SHARE_WIDTH, height: QR_SHARE_HEIGHT }}
      >
        <div className="px-8 pb-5 pt-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FDE047]">PickleKoach</p>
          <p className="mt-2 text-xs font-medium text-white/70">{copy.eyebrow}</p>

          {coach.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- export card; data URLs + storage URLs
            <img
              src={coach.photo}
              alt=""
              crossOrigin="anonymous"
              className="mx-auto mt-5 h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20"
            />
          ) : (
            <div className="mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#16A34A] font-heading text-2xl font-bold ring-4 ring-white/20">
              {initials}
            </div>
          )}

          <h2 className="font-heading mt-4 text-2xl font-bold leading-tight">{coach.name}</h2>
          {coach.specialization ? (
            <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#FDE047]">
              {coach.specialization}
            </span>
          ) : null}
          <p className="mt-2 text-sm text-white/80">{pricingLabel}</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-6">
          <div className="rounded-2xl bg-white p-4 shadow-2xl">
            <QRCodeSVG
              value={url}
              size={180}
              level="M"
              marginSize={2}
              bgColor="#ffffff"
              fgColor="#14532D"
            />
          </div>
          <p className="font-heading mt-5 text-center text-base font-bold">{copy.headline}</p>
          <p className="mt-1 text-center text-xs text-white/70">{copy.subline}</p>
        </div>

        <div className="border-t border-white/10 bg-black/20 px-8 py-4 text-center">
          <p className="break-all text-[10px] font-medium text-white/60">{displayUrl}</p>
        </div>
      </div>
    );
  }
);
