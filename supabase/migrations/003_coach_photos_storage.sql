-- ── Storage: coach profile photos (public bucket) ──────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-photos',
  'coach-photos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists coach_photos_insert on storage.objects;
create policy coach_photos_insert on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'coach-photos'
    and (storage.foldername(name))[1] = current_coach_id()
  );

drop policy if exists coach_photos_update on storage.objects;
create policy coach_photos_update on storage.objects for update
  to authenticated
  using (
    bucket_id = 'coach-photos'
    and (storage.foldername(name))[1] = current_coach_id()
  )
  with check (
    bucket_id = 'coach-photos'
    and (storage.foldername(name))[1] = current_coach_id()
  );

drop policy if exists coach_photos_delete on storage.objects;
create policy coach_photos_delete on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'coach-photos'
    and (
      (storage.foldername(name))[1] = current_coach_id()
      or is_platform_admin()
    )
  );

drop policy if exists coach_photos_select on storage.objects;
create policy coach_photos_select on storage.objects for select
  to public
  using (bucket_id = 'coach-photos');
