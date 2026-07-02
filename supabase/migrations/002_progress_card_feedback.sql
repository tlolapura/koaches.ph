alter table progress_cards
  add column if not exists coach_strengths text,
  add column if not exists coach_to_improve text;
