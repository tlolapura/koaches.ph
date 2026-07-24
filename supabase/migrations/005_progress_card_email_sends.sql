-- Limit progress-card email sends (max 2 per card, enforced in app).
alter table progress_cards
  add column if not exists email_send_count integer not null default 0;

alter table progress_cards
  drop constraint if exists progress_cards_email_send_count_nonneg;

alter table progress_cards
  add constraint progress_cards_email_send_count_nonneg
  check (email_send_count >= 0);
