"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { exportStoryAsPng } from "@/lib/koaches/social-story-export";
import { CoachQrShareImage, type QrShareVariant } from "@/components/koaches/shared/CoachQrShareImage";
import type { CoachProfile } from "@/lib/koaches/types";
import { cn } from "@/lib/utils";

type SaveCoachQrCtaProps = {
  coach: CoachProfile;
  url: string;
  variant: QrShareVariant;
  label: string;
  filename: string;
  className?: string;
  onSaved?: () => void;
  onError?: () => void;
};

export function SaveCoachQrCta({
  coach,
  url,
  variant,
  label,
  filename,
  className,
  onSaved,
  onError,
}: SaveCoachQrCtaProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  if (!url.startsWith("http")) {
    return null;
  }

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      await exportStoryAsPng(cardRef.current, filename);
      onSaved?.();
    } catch {
      onError?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CoachButton
        type="button"
        onClick={handleSave}
        loading={saving}
        loadingLabel="Saving…"
        className={cn("w-auto px-4 py-3 text-sm", className)}
      >
        <Download className="h-4 w-4" />
        {label}
      </CoachButton>

      <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0" aria-hidden>
        <CoachQrShareImage ref={cardRef} coach={coach} url={url} variant={variant} />
      </div>
    </>
  );
}
