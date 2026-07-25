-- Per-player clinic payment tracking (flat clinics still use clinics.payment_status)

alter table clinic_enrollments
  add column if not exists payment_status text not null default 'unpaid';

comment on column clinic_enrollments.payment_status is
  'paid | unpaid — used when the clinic is priced per player';
