-- KoachesPH initial schema

-- Extensions
create extension if not exists "pgcrypto";

-- ── Coaches ──────────────────────────────────────────────────────────────
create table if not exists coaches (
  id text primary key,
  user_id uuid unique references auth.users (id) on delete set null,
  slug text unique not null,
  name text not null,
  photo_url text,
  bio text not null default '',
  specialization text not null default '',
  rate_per_session integer not null default 0,
  session_pricing jsonb not null default '{}',
  court_ids text[] not null default '{}',
  mobile text,
  instagram text,
  facebook text,
  skill_template_id text not null default 'intermediate',
  free_trial_enabled boolean not null default false,
  free_trial_weekly_cap integer not null default 0,
  subscription_plan text not null default 'regular',
  subscription_expiry date,
  is_active boolean not null default true,
  total_students integer not null default 0,
  total_sessions integer not null default 0,
  working_hours jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Programs ───────────────────────────────────────────────────────────────
create table if not exists programs (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  name text not null,
  description text not null default '',
  price integer not null default 0,
  session_count integer not null default 1,
  rubric_id text not null,
  skill_template_id text,
  preset_id text,
  source text not null,
  target_level text not null default '',
  custom_skill_ids text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programs_coach_id_idx on programs (coach_id);

-- ── Students ─────────────────────────────────────────────────────────────
create table if not exists students (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  name text not null,
  mobile text not null default '',
  email text not null default '',
  status text not null default 'active',
  program_id text references programs (id) on delete set null,
  sessions_completed integer not null default 0,
  enrolled_date date not null default current_date,
  skill_level text not null default '3.0',
  is_archived boolean not null default false,
  notes text,
  waiver_signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_coach_id_idx on students (coach_id);

-- ── Program enrollments (sync with student.program_id) ───────────────────
create table if not exists program_enrollments (
  program_id text not null references programs (id) on delete cascade,
  student_id text not null references students (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (program_id, student_id)
);

-- ── Sessions ─────────────────────────────────────────────────────────────
create table if not exists sessions (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  student_id text not null references students (id) on delete cascade,
  type text not null,
  program_id text references programs (id) on delete set null,
  session_number integer,
  date date,
  time text not null,
  end_time text not null,
  court_id text not null,
  status text not null default 'upcoming',
  payment_status text not null default 'unpaid',
  price integer not null default 0,
  player_count integer not null default 1,
  participants jsonb not null default '[]',
  notes text,
  ratings_before jsonb,
  ratings_after jsonb,
  participant_progress jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_coach_id_idx on sessions (coach_id);
create index if not exists sessions_student_id_idx on sessions (student_id);
create index if not exists sessions_date_idx on sessions (coach_id, date);

-- ── Student intake ─────────────────────────────────────────────────────────
create table if not exists student_intake_submissions (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  name text not null,
  mobile text not null,
  email text not null,
  emergency_contact text,
  skill_level text not null,
  notes text,
  waiver_accepted boolean not null default true,
  signed_name text not null,
  submitted_at timestamptz not null default now(),
  status text not null default 'pending'
);

create index if not exists intake_coach_status_idx on student_intake_submissions (coach_id, status);

-- ── Progress cards ───────────────────────────────────────────────────────
create table if not exists progress_cards (
  id text primary key,
  student_id text not null references students (id) on delete cascade,
  coach_id text not null references coaches (id) on delete cascade,
  student_name text not null,
  coach_name text not null,
  program_name text not null,
  program_or_session text not null,
  date_completed date not null,
  ratings_before jsonb not null default '[]',
  ratings_after jsonb not null default '[]',
  coach_message text not null default '',
  session_id text references sessions (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists progress_cards_coach_idx on progress_cards (coach_id);

-- ── Coach applications (admin) ─────────────────────────────────────────────
create table if not exists coach_applications (
  id text primary key,
  full_name text not null,
  mobile text not null,
  email text not null,
  bio text not null,
  specialization text not null default '',
  instagram text,
  facebook text,
  skill_template_id text not null default 'intermediate',
  coaching_levels text[] not null default '{}',
  session_pricing jsonb not null default '{}',
  preferred_slug text,
  current_student_count integer not null default 0,
  status text not null default 'pending',
  applied_at timestamptz not null default now()
);

-- ── Coach availability ───────────────────────────────────────────────────
create table if not exists coach_working_hours (
  coach_id text not null references coaches (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  enabled boolean not null default false,
  start_time text,
  end_time text,
  primary key (coach_id, day_of_week)
);

create table if not exists coach_blocked_slots (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  date date not null,
  start_time text not null,
  end_time text not null,
  label text,
  created_at timestamptz not null default now()
);

create table if not exists coach_achievements (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  kind text not null,
  title text not null,
  organization text,
  year text,
  detail text,
  sort_order integer not null default 0
);

-- ── Profiles (auth roles) ───────────────────────────────────────────────────
do $$ begin
  create type public.app_role as enum ('coach', 'admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role app_role not null,
  coach_id text references coaches (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_coach_role_check check (
    (role = 'coach' and coach_id is not null)
    or (role in ('admin', 'super_admin') and coach_id is null)
  )
);

create index if not exists profiles_role_idx on profiles (role);
create index if not exists profiles_coach_id_idx on profiles (coach_id) where coach_id is not null;

-- ── sessions_completed trigger ─────────────────────────────────────────────
create or replace function sync_sessions_completed_on_done()
returns trigger as $$
begin
  if new.status = 'done' and (old.status is distinct from 'done') then
    update students
    set sessions_completed = sessions_completed + 1,
        updated_at = now()
    where id = new.student_id;

    if new.program_id is not null then
      update students
      set program_id = coalesce(program_id, new.program_id),
          updated_at = now()
      where id = new.student_id;

      insert into program_enrollments (program_id, student_id)
      values (new.program_id, new.student_id)
      on conflict do nothing;
    end if;
  elsif old.status = 'done' and new.status is distinct from 'done' then
    update students
    set sessions_completed = greatest(0, sessions_completed - 1),
        updated_at = now()
    where id = new.student_id;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sessions_completed_trigger on sessions;
create trigger sessions_completed_trigger
  before update on sessions
  for each row execute function sync_sessions_completed_on_done();

-- ── updated_at helper ──────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists coaches_updated_at on coaches;
create trigger coaches_updated_at before update on coaches
  for each row execute function set_updated_at();

drop trigger if exists students_updated_at on students;
create trigger students_updated_at before update on students
  for each row execute function set_updated_at();

drop trigger if exists programs_updated_at on programs;
create trigger programs_updated_at before update on programs
  for each row execute function set_updated_at();

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table coaches enable row level security;
alter table programs enable row level security;
alter table students enable row level security;
alter table program_enrollments enable row level security;
alter table sessions enable row level security;
alter table student_intake_submissions enable row level security;
alter table progress_cards enable row level security;
alter table coach_working_hours enable row level security;
alter table coach_blocked_slots enable row level security;
alter table coach_achievements enable row level security;
alter table coach_applications enable row level security;
alter table profiles enable row level security;

create or replace function current_coach_id()
returns text as $$
  select coach_id
  from profiles
  where id = auth.uid() and role = 'coach'
  limit 1;
$$ language sql stable security definer set search_path = public;

create or replace function is_platform_admin()
returns boolean as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$ language sql stable security definer set search_path = public;

create or replace function is_coach()
returns boolean as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid() and role = 'coach'
  );
$$ language sql stable security definer set search_path = public;

drop policy if exists profiles_read_own on profiles;
create policy profiles_read_own on profiles for select
  using (id = auth.uid());

drop policy if exists profiles_admin_read on profiles;
create policy profiles_admin_read on profiles for select
  using (is_platform_admin());

drop policy if exists coaches_select_own on coaches;
create policy coaches_select_own on coaches for select
  using (
    user_id = auth.uid()
    or id = current_coach_id()
  );

drop policy if exists coaches_select_public on coaches;
create policy coaches_select_public on coaches for select
  using (is_active = true);

drop policy if exists coaches_update_own on coaches;
create policy coaches_update_own on coaches for update
  using (
    user_id = auth.uid()
    or id = current_coach_id()
  );

drop policy if exists programs_coach on programs;
create policy programs_coach on programs for all
  using (coach_id = current_coach_id());

drop policy if exists students_coach on students;
create policy students_coach on students for all
  using (coach_id = current_coach_id());

drop policy if exists enrollments_coach on program_enrollments;
create policy enrollments_coach on program_enrollments for all
  using (
    program_id in (select id from programs where coach_id = current_coach_id())
  );

drop policy if exists sessions_coach on sessions;
create policy sessions_coach on sessions for all
  using (coach_id = current_coach_id());

drop policy if exists intake_coach on student_intake_submissions;
create policy intake_coach on student_intake_submissions for select
  using (coach_id = current_coach_id());

drop policy if exists intake_coach_update on student_intake_submissions;
create policy intake_coach_update on student_intake_submissions for update
  using (coach_id = current_coach_id());

drop policy if exists intake_coach_delete on student_intake_submissions;
create policy intake_coach_delete on student_intake_submissions for delete
  using (coach_id = current_coach_id());

drop policy if exists intake_public_insert on student_intake_submissions;
create policy intake_public_insert on student_intake_submissions for insert
  with check (true);

drop policy if exists progress_coach on progress_cards;
create policy progress_coach on progress_cards for all
  using (coach_id = current_coach_id());

drop policy if exists hours_coach on coach_working_hours;
create policy hours_coach on coach_working_hours for all
  using (coach_id = current_coach_id());

drop policy if exists blocks_coach on coach_blocked_slots;
create policy blocks_coach on coach_blocked_slots for all
  using (coach_id = current_coach_id());

drop policy if exists achievements_coach on coach_achievements;
create policy achievements_coach on coach_achievements for all
  using (coach_id = current_coach_id());

drop policy if exists applications_admin on coach_applications;
create policy applications_admin on coach_applications for all
  using (is_platform_admin());

drop policy if exists applications_public_insert on coach_applications;
create policy applications_public_insert on coach_applications for insert
  with check (true);

-- ── Courts (platform directory) ─────────────────────────────────────────────
create table if not exists courts (
  id text primary key,
  name text not null,
  address text not null default '',
  city text not null default '',
  region text not null default '',
  maps_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table courts enable row level security;

drop policy if exists courts_public_read on courts;
create policy courts_public_read on courts for select
  using (is_active = true);

drop policy if exists courts_admin on courts;
create policy courts_admin on courts for all
  using (is_platform_admin());
