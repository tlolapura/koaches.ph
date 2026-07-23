"use server";

import { requireAdmin } from "@/lib/koaches/actions/guards";
import { createServiceClient } from "@/lib/supabase/server";
import {
  COACH_PHOTO_BUCKET,
  coachPhotoExtension,
  isDataUrlPhoto,
} from "@/lib/koaches/coach-photo";

/**
 * One-time migration: move data-URL photos from coaches.photo_url into Storage.
 * Run from admin after applying migration 003_coach_photos_storage.sql.
 */
export async function migrateCoachDataUrlPhotosAction(): Promise<{
  migrated: number;
  skipped: number;
  errors: string[];
}> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("coaches").select("id, photo_url");
  if (error) throw error;

  let migrated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of data ?? []) {
    const photoUrl = row.photo_url as string | null;
    if (!isDataUrlPhoto(photoUrl)) {
      skipped += 1;
      continue;
    }

    try {
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(photoUrl!);
      if (!match) {
        errors.push(`${row.id}: invalid data URL`);
        continue;
      }
      const mime = match[1]!;
      const buffer = Buffer.from(match[2]!, "base64");
      const ext = coachPhotoExtension(mime);
      const storagePath = `${row.id}/profile.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(COACH_PHOTO_BUCKET)
        .upload(storagePath, buffer, { contentType: mime, upsert: true });
      if (uploadError) {
        errors.push(`${row.id}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrl } = supabase.storage
        .from(COACH_PHOTO_BUCKET)
        .getPublicUrl(storagePath);

      const { error: updateError } = await supabase
        .from("coaches")
        .update({
          photo_url: publicUrl.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (updateError) {
        errors.push(`${row.id}: ${updateError.message}`);
        continue;
      }
      migrated += 1;
    } catch (e) {
      errors.push(`${row.id}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  return { migrated, skipped, errors };
}
