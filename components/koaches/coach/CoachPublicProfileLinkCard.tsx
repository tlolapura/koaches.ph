"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Globe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { CoachProfile } from "@/lib/koaches/types";
import { buildPublicCoachPath } from "@/lib/koaches/coach-routes";
import { SaveCoachQrCta } from "@/components/koaches/shared/SaveCoachQrCta";
import { useCoachToast } from "@/components/koaches/coach/CoachUi";
import { cn } from "@/lib/utils";

type CoachPublicProfileLinkCardProps = {
  coach: CoachProfile;
  className?: string;
};

export function CoachPublicProfileLinkCard({ coach, className }: CoachPublicProfileLinkCardProps) {
  const { showToast } = useCoachToast();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const profilePath = buildPublicCoachPath(coach.slug);
  const profileUrl = origin ? `${origin}${profilePath}` : profilePath;
  const ready = origin.length > 0;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    showToast("Profile link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!coach.slug?.trim()) {
    return (
      <div className={cn("coach-card p-4 text-sm text-[#6B7280]", className)}>
        Your public profile URL is being set up. Check back soon to share your page.
      </div>
    );
  }

  return (
    <div className={cn("coach-card overflow-hidden", className)}>
      <div className="bg-gradient-to-br from-[#EFF6FF] via-white to-[#FAFAF8] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14532D] text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading font-semibold text-[#111827]">Public profile</p>
            <p className="mt-0.5 text-sm text-[#6B7280]">
              Share your page so players can view your rates, programs, and book sessions.
            </p>
          </div>
        </div>

        {ready ? (
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
              <QRCodeSVG
                value={profileUrl}
                size={148}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#14532D"
              />
            </div>
            <div className="min-w-0 flex-1 sm:pt-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">Profile link</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs text-[#6B7280]">{profileUrl}</span>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#14532D]"
                  aria-label="Copy profile link"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <Link
                  href={profilePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280]"
                  aria-label="Open public profile"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
              <SaveCoachQrCta
                coach={coach}
                url={profileUrl}
                variant="profile"
                label="Save profile QR"
                filename={`${coach.slug}-profile-qr.png`}
                className="mt-3 w-full sm:w-auto"
                onSaved={() => showToast("Profile QR saved — print or share at court")}
                onError={() => showToast("Could not save image", "error")}
              />
            </div>
          </div>
        ) : (
          <div className="mt-4 flex h-40 items-center justify-center rounded-xl bg-white/80 text-sm text-[#9CA3AF]">
            Preparing…
          </div>
        )}
      </div>
    </div>
  );
}
