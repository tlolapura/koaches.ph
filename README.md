# PickleKoach

Pickleball coaching platform for the Philippines — find coaches, book sessions, track student progress, and share availability on social.

**Live site:** [picklekoach.com](https://picklekoach.com)

## What's in the app

| Area | Routes | Purpose |
|------|--------|---------|
| **Public** | `/`, `/coaches`, `/coach/[slug]`, `/join/[slug]` | Landing, coach directory, public profiles, student intake |
| **Coach portal** | `/coach/dashboard`, `/coach/sessions`, `/coach/students`, … | Schedule, roster, programs, progress cards, billing, social stories |
| **Admin** | `/admin`, `/admin/coaches`, `/admin/applications`, … | Coach onboarding, courts, applications |
| **Apply** | `/apply`, `/coach/apply` | Coach application wizard |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (Auth + Postgres)
- **TanStack Query** for client data fetching
- **react-day-picker**, **html-to-image**, **qrcode.react**

## Getting started

### Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (optional for local demo mode without auth)

### Install & run

```bash
npm install
cp .env.example .env   # create and fill in — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env` file in the project root:

```env
# Supabase — Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only — never expose to the browser
SUPABASE_SERVICE_ROLE_KEY=

# Optional — used for OG URLs and sitemap
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Without Supabase env vars, some flows fall back to demo/local behaviour (e.g. admin login accepts any credentials).

### Database

1. Run migrations in `supabase/migrations/` against your Supabase project (SQL editor or CLI).
2. Create auth users in Supabase Dashboard (Authentication → Users).
3. Run `supabase/seed.sql` to link profiles and seed a demo coach.

Migrations:

- `001_initial_schema.sql` — core tables (coaches, sessions, students, programs, etc.)
- `002_coach_billing.sql` — subscription billing

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

## Project structure

```
app/                    # Next.js routes (public, coach, admin)
components/koaches/     # UI by domain (coach, admin, public, shared)
lib/koaches/            # Types, server actions, business logic
hooks/                  # React Query hooks
supabase/migrations/    # SQL schema
public/                 # Static assets, favicons, illustrations
```

## Brand

- **Court green** `#16A34A` · **Kitchen blue** `#4F8FF7` · **Ball yellow** `#FACC15`
- Story graphics export at **1080×1920** (Instagram / Facebook Stories)

## License

Private — all rights reserved.
