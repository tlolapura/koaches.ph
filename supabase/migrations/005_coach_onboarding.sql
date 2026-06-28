-- One-time coach setup wizard completion

alter table coaches
  add column if not exists onboarding_completed_at timestamptz;

-- Treat existing coaches with a complete public profile as already onboarded
update coaches
set onboarding_completed_at = coalesce(updated_at, created_at)
where onboarding_completed_at is null
  and nullif(trim(bio), '') is not null
  and nullif(trim(mobile), '') is not null
  and rate_per_session > 0;
