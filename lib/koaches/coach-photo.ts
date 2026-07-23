export const COACH_PHOTO_BUCKET = "coach-photos";
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateCoachPhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) return "Use JPG, PNG, or WebP.";
  if (file.size > MAX_PHOTO_BYTES) return "Photo must be under 2 MB.";
  return null;
}

export function coachPhotoExtension(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

/** Extract storage object path from a public coach-photos URL, if any. */
export function coachPhotoPathFromUrl(photoUrl: string | null | undefined): string | null {
  if (!photoUrl || photoUrl.startsWith("data:")) return null;
  const marker = `/storage/v1/object/public/${COACH_PHOTO_BUCKET}/`;
  const idx = photoUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(photoUrl.slice(idx + marker.length).split("?")[0] ?? "");
}

export function isDataUrlPhoto(photoUrl: string | null | undefined): boolean {
  return Boolean(photoUrl?.startsWith("data:"));
}
