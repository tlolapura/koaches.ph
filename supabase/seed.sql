-- Seed admin + coach accounts only
-- Prerequisite: create users in Supabase Auth:
--   leigh@koaches.ph (coach)
--   admin@koaches.ph (super admin)

-- Coach row (required before profiles.coach_id FK)
insert into coaches (
  id, slug, name, first_name, last_name, bio, specialization, rate_per_session, session_pricing,
  court_ids, mobile, skill_template_id, subscription_plan, subscription_expiry, is_active
) values (
  'coach-1',
  'leigh',
  'Leigh',
  'Leigh',
  '',
  '',
  '',
  0,
  '{}'::jsonb,
  '{}',
  'leigh@koaches.ph',
  'intermediate',
  'regular',
  (current_date + interval '30 days')::date,
  true
) on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  mobile = excluded.mobile,
  subscription_expiry = excluded.subscription_expiry;

-- Super admin
insert into profiles (id, email, role, full_name)
select id, email, 'super_admin'::app_role, 'Koaches Admin'
from auth.users
where email = 'admin@koaches.ph'
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role,
  full_name = excluded.full_name,
  coach_id = null;

-- Coach (Leigh) → coach-1
insert into profiles (id, email, role, coach_id, full_name)
select id, email, 'coach'::app_role, 'coach-1', 'Leigh'
from auth.users
where email = 'leigh@koaches.ph'
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role,
  coach_id = excluded.coach_id,
  full_name = excluded.full_name;

update coaches
set user_id = (select id from auth.users where email = 'leigh@koaches.ph')
where id = 'coach-1';
