-- Coach subscription invoices & payment receipt uploads

create table if not exists coach_subscription_invoices (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  invoice_number text not null,
  period_start date not null,
  period_end date not null,
  amount integer not null,
  plan text not null,
  status text not null default 'issued',
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (coach_id, period_end)
);

create index if not exists coach_invoices_coach_idx on coach_subscription_invoices (coach_id, period_end desc);

create table if not exists coach_payment_submissions (
  id text primary key,
  coach_id text not null references coaches (id) on delete cascade,
  invoice_id text not null references coach_subscription_invoices (id) on delete cascade,
  amount integer not null,
  method text not null,
  receipt_path text not null,
  receipt_file_name text not null,
  notes text,
  status text not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists coach_payments_coach_idx on coach_payment_submissions (coach_id, submitted_at desc);
create index if not exists coach_payments_invoice_idx on coach_payment_submissions (invoice_id);

alter table coach_subscription_invoices enable row level security;
alter table coach_payment_submissions enable row level security;

drop policy if exists invoices_coach on coach_subscription_invoices;
create policy invoices_coach on coach_subscription_invoices for select
  using (coach_id = current_coach_id());

drop policy if exists invoices_admin on coach_subscription_invoices;
create policy invoices_admin on coach_subscription_invoices for all
  using (is_platform_admin());

drop policy if exists payments_coach_select on coach_payment_submissions;
create policy payments_coach_select on coach_payment_submissions for select
  using (coach_id = current_coach_id());

drop policy if exists payments_coach_insert on coach_payment_submissions;
create policy payments_coach_insert on coach_payment_submissions for insert
  with check (coach_id = current_coach_id());

drop policy if exists payments_admin on coach_payment_submissions;
create policy payments_admin on coach_payment_submissions for all
  using (is_platform_admin());

-- Receipt uploads (private bucket)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'coach-receipts',
  'coach-receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists coach_receipts_insert on storage.objects;
create policy coach_receipts_insert on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'coach-receipts'
    and (storage.foldername(name))[1] = current_coach_id()
  );

drop policy if exists coach_receipts_select on storage.objects;
create policy coach_receipts_select on storage.objects for select
  to authenticated
  using (
    bucket_id = 'coach-receipts'
    and (
      (storage.foldername(name))[1] = current_coach_id()
      or is_platform_admin()
    )
  );
