const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateCoachPhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return "Use JPG, PNG, or WebP.";
  if (file.size > MAX_PHOTO_BYTES) return "Photo must be under 2 MB.";
  return null;
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
