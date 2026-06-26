"use client";

import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
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
} as const;

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

  const pickPhoto = () => inputRef.current?.click();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const error = validateCoachPhotoFile(file);
    if (error) {
      showToast(error, "error");
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      savePhoto(dataUrl);
      onUpdated?.();
      showToast("Profile photo updated!");
    } catch {
      showToast("Could not upload photo", "error");
    }
  };

  const removePhoto = () => {
    savePhoto(null);
    onUpdated?.();
    showToast("Photo removed");
    if (inputRef.current) inputRef.current.value = "";
  };

  const dim = sizeClasses[size];

  return (
    <div className={cn("relative inline-block", className)}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URLs from local upload
        <img
          src={photo}
          alt={name}
          className={cn(
            "rounded-2xl object-cover ring-4 ring-[#FDEEE9]",
            dim,
            editable && "cursor-pointer"
          )}
          onClick={editable ? pickPhoto : undefined}
        />
      ) : (
        <button
          type="button"
          className={cn(editable && "group relative rounded-full")}
          onClick={editable ? pickPhoto : undefined}
          disabled={!editable}
        >
          <InitialsAvatar
            name={name}
            size={size}
            variant="navy"
            className={cn(editable && "ring-4 ring-[#FDEEE9]")}
          />
        </button>
      )}

      {editable && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
            }}
          />
          <button
            type="button"
            onClick={pickPhoto}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#E07A5F] text-white shadow-md transition-transform active:scale-95"
            aria-label="Change profile photo"
          >
            <Camera className="h-4 w-4" />
          </button>
        </>
      )}

      {editable && showRemove && photo && (
        <button
          type="button"
          onClick={removePhoto}
          className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#EF4444]"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove photo
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

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const error = validateCoachPhotoFile(file);
    if (error) {
      showToast(error, "error");
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      savePhoto(dataUrl);
      showToast("Profile photo updated!");
    } catch {
      showToast("Could not upload photo", "error");
    }
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAF8] p-4">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-24 w-24 rounded-2xl object-cover ring-4 ring-[#FDEEE9]" />
      ) : (
        <InitialsAvatar name={name} size="xl" variant="navy" />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="coach-btn-outline mt-4 w-auto gap-2 px-4 py-2 text-sm"
      >
        <Camera className="h-4 w-4" />
        {photo ? "Change photo" : "Upload photo"}
      </button>
      <p className="mt-2 text-center text-[10px] text-[#9CA3AF]">JPG or PNG, max 2 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {photo && (
        <button
          type="button"
          onClick={() => {
            savePhoto(null);
            showToast("Photo removed");
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-2 text-xs font-medium text-[#6B7280] hover:text-[#EF4444]"
        >
          Remove photo
        </button>
      )}
    </div>
  );
}
