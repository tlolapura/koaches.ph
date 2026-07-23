-- ── Clinics (multi-date group events) ───────────────────────────────────────

create table if not exists clinics (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  name text not null,
  description text not null default '',
  focus text not null default '',
  court_id text not null default '',
  capacity integer not null default 12 check (capacity >= 1),
  price_per_player integer,
  flat_price integer,
  payment_status text not null default 'unpaid',
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clinics_price_check check (
    price_per_player is not null or flat_price is not null
  )
);

create index if not exists clinics_coach_id_idx on clinics (coach_id);
create index if not exists clinics_coach_status_idx on clinics (coach_id, status);

create table if not exists clinic_enrollments (
  clinic_id text not null references clinics (id) on delete cascade,
  student_id text not null references students (id) on delete cascade,
  status text not null default 'enrolled',
  enrolled_at timestamptz not null default now(),
  primary key (clinic_id, student_id)
);

create index if not exists clinic_enrollments_student_idx on clinic_enrollments (student_id);

-- Allow clinic sessions without a single primary student; roster lives on clinic + participants/attendance
alter table sessions alter column student_id drop not null;

alter table sessions
  add column if not exists clinic_id text references clinics (id) on delete cascade;

alter table sessions
  add column if not exists attendance jsonb;

create index if not exists sessions_clinic_id_idx on sessions (clinic_id);

drop policy if exists clinics_coach_all on clinics;
create policy clinics_coach_all on clinics for all
  using (coach_id = current_coach_id())
  with check (coach_id = current_coach_id());

drop policy if exists clinics_admin on clinics;
create policy clinics_admin on clinics for all
  using (is_platform_admin());

drop policy if exists clinic_enrollments_coach_all on clinic_enrollments;
create policy clinic_enrollments_coach_all on clinic_enrollments for all
  using (
    exists (
      select 1 from clinics c
      where c.id = clinic_id and c.coach_id = current_coach_id()
    )
  )
  with check (
    exists (
      select 1 from clinics c
      where c.id = clinic_id and c.coach_id = current_coach_id()
    )
  );

drop policy if exists clinic_enrollments_admin on clinic_enrollments;
create policy clinic_enrollments_admin on clinic_enrollments for all
  using (is_platform_admin());

alter table clinics enable row level security;
alter table clinic_enrollments enable row level security;
