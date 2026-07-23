# Supabase setup

## 1. Create project

Create a project at [supabase.com](https://supabase.com) and copy the project URL and anon key.

## 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server actions only — never expose to the browser)

## 3. Run migrations

In the Supabase SQL editor, run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_progress_card_feedback.sql`
3. `supabase/migrations/003_coach_photos_storage.sql` (public `coach-photos` bucket)

After (3), re-upload coach profile photos (or call `migrateCoachDataUrlPhotosAction` as admin) so existing data-URL blobs move to Storage.

## 4. Auth users & seed

Create users in **Supabase Auth** (Authentication → Users):

| Email | Role | Portal |
|-------|------|--------|
| `leigh@koaches.ph` | coach | `/coach` |
| `admin@koaches.ph` | super admin | `/admin` |

Then run `supabase/seed.sql`. This creates Leigh's `coaches` row, `profiles` rows, and links auth users. Students, programs, and sessions are added through the app.

### `profiles` table

Each auth user gets one profile row:

- `role`: `coach` | `admin` | `super_admin`
- `coach_id`: required when `role = 'coach'` (FK to `coaches.id`)

RLS and middleware use `profiles` for portal access.

## 5. Dev without Supabase

If env vars are unset, the app falls back to mock data + localStorage overlays (same as before).

With env vars set, server actions persist to Postgres and middleware enforces auth on `/coach/*` and `/admin/*`.
