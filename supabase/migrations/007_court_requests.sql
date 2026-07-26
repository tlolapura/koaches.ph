-- Court requests: coaches propose venues not yet in the platform directory.
create table if not exists court_requests (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  name text not null,
  address text not null default '',
  city text not null default '',
  region text not null default '',
  maps_url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_court_id text references courts (id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists court_requests_status_idx on court_requests (status);
create index if not exists court_requests_coach_idx on court_requests (coach_id);

alter table court_requests enable row level security;

-- Coaches read/insert their own requests (service role used for writes in app actions).
drop policy if exists court_requests_coach_select on court_requests;
create policy court_requests_coach_select on court_requests for select
  to authenticated
  using (coach_id = current_coach_id() or is_platform_admin());

drop policy if exists court_requests_admin on court_requests;
create policy court_requests_admin on court_requests for all
  using (is_platform_admin());
