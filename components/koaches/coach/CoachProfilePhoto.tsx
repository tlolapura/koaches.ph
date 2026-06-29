"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { CoachButton } from "@/components/koaches/coach/CoachButton";
import { useCoachPhoto } from "@/hooks/useCoachPhoto";
import { InitialsAvatar, useCoachToast } from "@/components/koaches/coach/CoachUi";
import {
  readImageFileAsDataUrl,
  validateCoachPhotoFile,
} from "@/lib/koaches/coach-photo";
import { cn } from "@/lib/utils";

const sizeClasses = {
  lg: "h-20 w-20",
  xl: "h-24 w-24",
  hero: "h-[7.5rem] w-[7.5rem] sm:h-36 sm:w-36",
  public: "h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40",
} as const;

const initialsSize = {
  lg: "lg" as const,
  xl: "xl" as const,
  hero: "hero" as const,
  public: "public" as const,
};

type CoachProfilePhotoProps = {
  coachId: string;
  name: string;
  defaultPhoto?: string | null;
  size?: keyof typeof sizeClasses;
  editable?: boolean;
  showRemove?: boolean;
  className?: string;
  onUpdated?: () => void;
};

export function CoachProfilePhoto({
  coachId,
  name,
  defaultPhoto = null,
  size = "xl",
  editable = false,
  showRemove = false,
  className,
  onUpdated,
}: CoachProfilePhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useCoachToast();
  const { photo, savePhoto } = useCoachPhoto(coachId, defaultPhoto);
  const [uploading, setUploading] = useState(false);

  const pickPhoto = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    const error = validateCoachPhotoFile(file);
    if (error) {
      showToast(error, "error");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      await savePhoto(dataUrl);
      onUpdated?.();
      showToast("Profile photo updated!");
    } catch {
      showToast("Could not upload photo", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      await savePhoto(null);
      onUpdated?.();
      showToast("Photo removed");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      showToast("Could not remove photo", "error");
    } finally {
      setUploading(false);
    }
  };

  const dim = sizeClasses[size];
  const avatarSize = initialsSize[size];
  const isHero = size === "hero" || size === "public";
  const initialsShape = isHero ? "rounded-2xl" : "rounded-full";

  return (
    <div className={cn("relative inline-block", className)}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs from local upload
        <img
          src={photo}
          alt={name}
          className={cn(
            "rounded-2xl object-cover ring-4 ring-[#F0FDF4] shadow-[0_8px_24px_rgba(22,163,74,0.12)]",
            dim,
            editable && !uploading && "cursor-pointer",
            uploading && "opacity-70"
          )}
          onClick={editable && !uploading ? pickPhoto : undefined}
        />
      ) : (
        <button
          type="button"
          className={cn(editable && "group relative", initialsShape)}
          onClick={editable ? pickPhoto : undefined}
          disabled={!editable || uploading}
        >
          <InitialsAvatar
            name={name}
            size={avatarSize}
            variant="navy"
            className={cn(
              initialsShape,
              editable && "ring-4 ring-[#F0FDF4]",
              uploading && "opacity-70"
            )}
          />
        </button>
      )}

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="absolute h-0 w-0 overflow-hidden opacity-0"
            tabIndex={-1}
            disabled={uploading}
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
            }}
          />
          <button
            type="button"
            onClick={pickPhoto}
            disabled={uploading}
            className={cn(
              "absolute flex items-center justify-center rounded-full border-2 border-white bg-[#16A34A] text-white shadow-md transition-transform active:scale-95 disabled:opacity-70",
              isHero ? "-bottom-1.5 -right-1.5 h-10 w-10" : "-bottom-1 -right-1 h-9 w-9"
            )}
            aria-label="Change profile photo"
            aria-busy={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
        </>
      )}

      {editable && showRemove && photo && (
        <button
          type="button"
          onClick={() => void removePhoto()}
          disabled={uploading}
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#EF4444] disabled:opacity-60"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {uploading ? "Removing…" : "Remove photo"}
        </button>
      )}
    </div>
  );
}

/** Upload field for edit profile sheet */
export function CoachPhotoUploadField({
  coachId,
  name,
  defaultPhoto = null,
}: {
  coachId: string;
  name: string;
  defaultPhoto?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useCoachToast();
  const { photo, savePhoto } = useCoachPhoto(coachId, defaultPhoto);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    const error = validateCoachPhotoFile(file);
    if (error) {
      showToast(error, "error");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      await savePhoto(dataUrl);
      showToast("Profile photo updated!");
    } catch {
      showToast("Could not upload photo", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAF8] p-4">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-[#F0FDF4]" />
      ) : (
        <InitialsAvatar name={name} size="xl" variant="navy" />
      )}
      <CoachButton
        type="button"
        variant="outline"
        className="mt-4 w-auto px-4 py-2 text-sm"
        loading={uploading}
        loadingLabel="Uploading…"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-4 w-4" />
        {photo ? "Change photo" : "Upload photo"}
      </CoachButton>
      <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">JPG or PNG, max 2 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={uploading}
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {photo && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => void (async () => {
            setUploading(true);
            try {
              await savePhoto(null);
              showToast("Photo removed");
              if (inputRef.current) inputRef.current.value = "";
            } catch {
              showToast("Could not remove photo", "error");
            } finally {
              setUploading(false);
            }
          })()}
          className="mt-2 text-xs font-medium text-[#6B7280] hover:text-[#EF4444] disabled:opacity-60"
        >
          {uploading ? "Removing…" : "Remove photo"}
        </button>
      )}
    </div>
  );
}
